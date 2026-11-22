using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Manifest;

namespace BackofficeAutoLocalizer;

/// <summary>
/// Serves dictionary items as backoffice localizations, so <c>#key</c> in a label or <c>{#key}</c> in a description
/// renders the translation. Served: every <c>Backoffice_</c> item, plus any other item a content type label points to
/// (like <c>#Content_Title</c> from Lexicon or an older Umbraco). Other front-end keys are never served, so they
/// can't override Umbraco's own texts.
/// </summary>
internal sealed class LocalizationReader(
	IDictionaryItemService dictionaryItemService,
	ILanguageService languageService,
	IContentTypeService contentTypeService)
	: IPackageManifestReader
{
	public const string Area = "Backoffice";
	public const string Prefix = Area + "_";

	public async Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
	{
		var items = await dictionaryItemService.GetDescendantsAsync(null);
		var defaultIsoCode = await languageService.GetDefaultIsoCodeAsync();
		var referenced = Planner.ReferencedKeys(Localizer.Labels(contentTypeService.GetAll()));

		return
		[
			new PackageManifest
			{
				Id = "BackofficeAutoLocalizer.Localizations",
				Name = "Backoffice Auto Localizer (dictionary)",
				AllowTelemetry = false,
				Version = typeof(LocalizationReader).Assembly.GetName().Version?.ToString(3),
				Extensions = Build(items, defaultIsoCode, referenced),
			},
		];
	}

	/// <param name="referenced">Keys content type labels point to, each with the spelling the label uses.</param>
	internal static object[] Build(IEnumerable<IDictionaryItem> items, string? defaultIsoCode, IReadOnlyDictionary<string, string> referenced)
	{
		// culture → section → key; the backoffice looks a term up as "section_key".
		var byCulture = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>(StringComparer.OrdinalIgnoreCase);

		foreach (var item in items)
		{
			// The label's spelling, since the backoffice lookup is case-sensitive and Umbraco's keys aren't.
			var key = item.ItemKey.StartsWith(Prefix, StringComparison.Ordinal) ? item.ItemKey : referenced.GetValueOrDefault(item.ItemKey);
			var split = key?.IndexOf('_') ?? -1;
			// A key without "_" has no section, so the backoffice could never look it up.
			if (key is null || split <= 0 || split == key.Length - 1)
				continue;

			foreach (var translation in item.Translations.Where(t => !string.IsNullOrEmpty(t.Value)))
			{
				if (!byCulture.TryGetValue(translation.LanguageIsoCode, out var sections))
					byCulture[translation.LanguageIsoCode] = sections = [];
				if (!sections.TryGetValue(key[..split], out var keys))
					sections[key[..split]] = keys = [];

				keys[key[(split + 1)..]] = translation.Value;
			}
		}

		var extensions = byCulture.Select(c => Extension(c.Key, c.Value, fallback: false)).ToList();

		// The backoffice only loads localizations for the user's UI culture plus "en".
		// Serving the default language as "en" means a UI culture with no matching site language
		// shows the default-language text instead of raw #keys.
		if (defaultIsoCode is not null && byCulture.TryGetValue(defaultIsoCode, out var defaults))
			extensions.Add(Extension("en", defaults, fallback: true));

		return [.. extensions];
	}

	private static Dictionary<string, object> Extension(string culture, Dictionary<string, Dictionary<string, string>> sections, bool fallback) => new()
	{
		["type"] = "localization",
		["alias"] = $"BackofficeAutoLocalizer.Localization.{culture}{(fallback ? ".Fallback" : "")}",
		["name"] = $"Backoffice Auto Localizer {culture}{(fallback ? " fallback" : "")}",
		// Lower weight wins, so a real "en" site language overrides the fallback.
		["weight"] = fallback ? 1000 : 100,
		["meta"] = new Dictionary<string, object>
		{
			["culture"] = culture,
			["localizations"] = sections,
		},
	};
}

/// <summary>
/// Drops the cached package manifests on every server whenever a dictionary item changes,
/// or a content type does (a label may now point to another key).
/// </summary>
internal sealed class ClearManifestCache(AppCaches appCaches)
	: INotificationHandler<DictionaryCacheRefresherNotification>, INotificationHandler<ContentTypeCacheRefresherNotification>
{
	public void Handle(DictionaryCacheRefresherNotification notification) => Clear();

	public void Handle(ContentTypeCacheRefresherNotification notification) => Clear();

	// ponytail: Umbraco-internal cache key from PackageManifestService; breaks silently if renamed, re-check on CMS majors.
	private void Clear() => appCaches.RuntimeCache.Clear("PackageManifestService-PackageManifests");
}
