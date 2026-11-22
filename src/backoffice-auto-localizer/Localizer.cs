using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;

namespace BackofficeAutoLocalizer;

[JsonConverter(typeof(JsonStringEnumConverter<Field>))]
public enum Field { TypeName, TypeDescription, Name, Description, Tab, Group }

[JsonConverter(typeof(JsonStringEnumConverter<RowAction>))]
public enum RowAction { Create, Reuse, Skip }

/// <summary>One translatable text on a content type: its own name or description, a property name or description, or a tab or group name.</summary>
public record Label(Guid OwnerKey, string OwnerAlias, string OwnerName, Field Field, string TargetAlias, string Text);

/// <param name="Key">The dictionary key the label gets, or already points to when it's converted.</param>
/// <param name="Reason">Why a row is skipped: <c>converted</c> or <c>formatting</c>.</param>
/// <param name="DictionaryId">The dictionary item behind <paramref name="Key"/> when it already exists, so the UI can link to it.</param>
public record PlanRow(
	Guid OwnerKey, string OwnerAlias, string OwnerName, Field Field, string TargetAlias,
	string Text, string? Key, RowAction Action, bool Shared, string? Reason, Guid? DictionaryId = null);

public record RowRef(Guid OwnerKey, Field Field, string TargetAlias);
public record ApplyResult(int Created, int Reused, int TypesUpdated);
public record RevertResult(int Restored, int TypesUpdated);
public record UsageRow(Guid ContentTypeKey, string ContentTypeName, string? ContentTypeIcon, bool IsElement, Field Field, string TargetAlias);

/// <param name="Compositions">Names of the types this one is composed of.</param>
/// <param name="Total">Every label on the type, including descriptions whose formatting keeps them from being translatable.</param>
public record TypeSummary(Guid Key, string Name, string? Icon, bool IsElement, string[] Compositions, int Translatable, int Total);

/// <summary>Converts content type labels to dictionary items and back.</summary>
public sealed class Localizer(
	IContentTypeService contentTypeService,
	IDictionaryItemService dictionaryItemService,
	ILanguageService languageService,
	ICoreScopeProvider scopeProvider)
{
	/// <param name="typeKeys">Types to convert, plus their compositions. <c>null</c> means all types.</param>
	public async Task<List<PlanRow>> PlanAsync(Guid[]? typeKeys)
	{
		var types = contentTypeService.GetAll().ToList();
		var (existing, ids) = await ExistingAsync(await languageService.GetDefaultIsoCodeAsync());
		return Planner.Build(Labels(types), existing, Owners(types, typeKeys))
			.Select(r => r.Key is { } key && ids.TryGetValue(key, out var id) ? r with { DictionaryId = id } : r)
			.ToList();
	}

	/// <summary>
	/// Re-plans on the server (never trusting keys from the client) and applies the selected rows.
	/// Everything runs in one scope, so a failure leaves no half-converted site.
	/// </summary>
	public async Task<ApplyResult> ApplyAsync(Guid[]? typeKeys, IEnumerable<RowRef> selected, Guid userKey)
	{
		using var scope = scopeProvider.CreateCoreScope();

		var language = await languageService.GetDefaultLanguageAsync()
			?? throw new InvalidOperationException("The site has no default language.");
		var types = contentTypeService.GetAll().ToList();
		var wanted = selected.ToHashSet();
		var rows = Planner.Build(Labels(types), (await ExistingAsync(language.IsoCode)).Values, Owners(types, typeKeys))
			.Where(r => r.Action != RowAction.Skip && wanted.Contains(new RowRef(r.OwnerKey, r.Field, r.TargetAlias)))
			.ToList();

		var root = await FolderAsync(LocalizationReader.Area, null, userKey);
		var folders = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
		var created = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

		foreach (var row in rows.Where(r => r.Action == RowAction.Create && created.Add(r.Key!)))
		{
			var folderKey = row.Shared ? Planner.SharedFolder : Planner.Folder(row.OwnerAlias);
			if (!folders.TryGetValue(folderKey, out var parent))
				folders[folderKey] = parent = await FolderAsync(folderKey, root, userKey);

			var item = new DictionaryItem(parent, row.Key!) { Translations = [new DictionaryTranslation(language, row.Text.Trim())] };
			var attempt = await dictionaryItemService.CreateAsync(item, userKey);
			if (!attempt.Success)
				throw new InvalidOperationException($"Could not create dictionary item {row.Key}: {attempt.Status}");
		}

		var byKey = types.ToDictionary(t => t.Key);
		foreach (var owner in rows.GroupBy(r => r.OwnerKey))
		{
			var type = byKey[owner.Key];
			foreach (var row in owner)
				Set(type, row.Field, row.TargetAlias, Planner.Reference(row.Field, row.Key!));
			await SaveAsync(type, userKey);
		}

		scope.Complete();
		return new ApplyResult(created.Count, rows.Count(r => r.Action == RowAction.Reuse), rows.Select(r => r.OwnerKey).Distinct().Count());
	}

	/// <summary>Puts the default-language text back in place of <c>#Backoffice_x</c> references. Dictionary items are left alone.</summary>
	public async Task<RevertResult> RevertAsync(Guid[]? typeKeys, Guid userKey)
	{
		using var scope = scopeProvider.CreateCoreScope();

		var existing = (await ExistingAsync(await languageService.GetDefaultIsoCodeAsync())).Values;
		var types = contentTypeService.GetAll().ToList();
		var owners = Owners(types, typeKeys);
		int restored = 0, updated = 0;

		foreach (var type in types.Where(t => owners.Contains(t.Key)))
		{
			var changes = Labels([type])
				.Select(l => (Label: l, Key: Planner.ReferencedKey(l)))
				.Where(x => x.Key is not null && !string.IsNullOrEmpty(existing.GetValueOrDefault(x.Key)))
				.ToList();
			if (changes.Count == 0)
				continue;

			foreach (var (label, key) in changes)
				Set(type, label.Field, label.TargetAlias, existing[key!]!);
			await SaveAsync(type, userKey);
			restored += changes.Count;
			updated++;
		}

		scope.Complete();
		return new RevertResult(restored, updated);
	}

	/// <summary>Every document and element type with how many of its own labels are translatable.</summary>
	public async Task<List<TypeSummary>> TypesAsync()
	{
		var rows = (await PlanAsync(null)).ToLookup(r => r.OwnerKey);
		return contentTypeService.GetAll()
			.Select(t => new TypeSummary(
				t.Key, t.Name ?? t.Alias, t.Icon, t.IsElement,
				t.ContentTypeComposition.Select(c => c.Name ?? c.Alias).ToArray(),
				rows[t.Key].Count(r => r.Reason == "converted"),
				rows[t.Key].Count()))
			.ToList();
	}

	/// <summary>Every content type label that points to <paramref name="key"/>.</summary>
	public List<UsageRow> Usage(string key) =>
		contentTypeService.GetAll()
			.SelectMany(t => Labels([t])
				.Where(l => Planner.References(l, key))
				.Select(l => new UsageRow(t.Key, l.OwnerName, t.Icon, t.IsElement, l.Field, l.TargetAlias)))
			.ToList();

	internal static IEnumerable<Label> Labels(IEnumerable<IContentType> types) =>
		types.SelectMany(t =>
		{
			var name = t.Name ?? t.Alias;
			return new[]
				{
					new Label(t.Key, t.Alias, name, Field.TypeName, "", t.Name ?? ""),
					new Label(t.Key, t.Alias, name, Field.TypeDescription, "", t.Description ?? ""),
				}
				.Concat(t.PropertyTypes.SelectMany(p => new[]
				{
					new Label(t.Key, t.Alias, name, Field.Name, p.Alias, p.Name),
					new Label(t.Key, t.Alias, name, Field.Description, p.Alias, p.Description ?? ""),
				}))
				.Concat(t.PropertyGroups.Select(g =>
					new Label(t.Key, t.Alias, name, g.Type == PropertyGroupType.Tab ? Field.Tab : Field.Group, g.Alias, g.Name ?? "")));
		})
		.Where(l => !string.IsNullOrWhiteSpace(l.Text));

	// Properties inherited from a composition are owned (and saved) by the composition.
	private static HashSet<Guid> Owners(List<IContentType> types, Guid[]? typeKeys) =>
		typeKeys is null
			? types.Select(t => t.Key).ToHashSet()
			: types.Where(t => typeKeys.Contains(t.Key)).SelectMany(t => t.CompositionKeys().Append(t.Key)).ToHashSet();

	private static void Set(IContentType type, Field field, string alias, string value)
	{
		switch (field)
		{
			case Field.TypeName: type.Name = value; break;
			case Field.TypeDescription: type.Description = value; break;
			case Field.Name: type.PropertyTypes.First(p => p.Alias == alias).Name = value; break;
			case Field.Description: type.PropertyTypes.First(p => p.Alias == alias).Description = value; break;
			default: type.PropertyGroups.First(g => g.Alias == alias).Name = value; break;
		}
	}

	private async Task SaveAsync(IContentType type, Guid userKey)
	{
		var result = await contentTypeService.UpdateAsync(type, userKey);
		if (!result.Success)
			throw new InvalidOperationException($"Could not save content type {type.Alias}: {result.Result}");
	}

	/// <summary>Every dictionary key with its default-language value, and with its item id.</summary>
	private async Task<(Dictionary<string, string?> Values, Dictionary<string, Guid> Ids)> ExistingAsync(string? defaultIsoCode)
	{
		var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
		var ids = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
		foreach (var item in await dictionaryItemService.GetDescendantsAsync(null))
		{
			values.TryAdd(item.ItemKey, item.Translations.FirstOrDefault(t => t.LanguageIsoCode.Equals(defaultIsoCode, StringComparison.OrdinalIgnoreCase))?.Value);
			ids.TryAdd(item.ItemKey, item.Key);
		}
		return (values, ids);
	}

	private async Task<Guid> FolderAsync(string key, Guid? parent, Guid userKey)
	{
		if (await dictionaryItemService.GetAsync(key) is { } existing)
			return existing.Key;

		var attempt = await dictionaryItemService.CreateAsync(new DictionaryItem(parent, key), userKey);
		return attempt.Success ? attempt.Result.Key : throw new InvalidOperationException($"Could not create dictionary folder {key}: {attempt.Status}");
	}
}

/// <summary>Pure key and planning rules, kept free of Umbraco services so they can be unit tested.</summary>
public static partial class Planner
{
	public const string Prefix = LocalizationReader.Prefix;
	public const string SharedFolder = Prefix + "shared";

	public static string Folder(string ownerAlias) => Prefix + Safe(ownerAlias);

	public static string KeyFor(Label label) => label.Field switch
	{
		Field.TypeName => $"{Folder(label.OwnerAlias)}_typeName",
		Field.TypeDescription => $"{Folder(label.OwnerAlias)}_typeDescription",
		Field.Name => $"{Folder(label.OwnerAlias)}_{Safe(label.TargetAlias)}",
		Field.Description => $"{Folder(label.OwnerAlias)}_{Safe(label.TargetAlias)}_description",
		Field.Tab => $"{Folder(label.OwnerAlias)}_tab_{Safe(label.TargetAlias)}",
		_ => $"{Folder(label.OwnerAlias)}_group_{Safe(label.TargetAlias)}",
	};

	/// <summary>"Rubrik för sidan!" becomes <c>Backoffice_shared_rubrikForSidan</c>. Keys must be ASCII \w for the label regex.</summary>
	public static string SharedKey(string text)
	{
		var plain = new string(text.Normalize(NormalizationForm.FormD)
			.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark).ToArray());
		var words = NonAlphanumeric().Split(plain).Where(w => w.Length > 0).ToArray();
		var slug = string.Concat(words.Select((w, i) => i == 0 ? w.ToLowerInvariant() : char.ToUpperInvariant(w[0]) + w[1..].ToLowerInvariant()));
		if (slug.Length > 40)
			slug = slug[..40];
		if (slug.Length == 0)
			slug = "item" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text)))[..8].ToLowerInvariant();
		return $"{SharedFolder}_{slug}";
	}

	// Only property descriptions go through UFM ({#key}); the type's own description is read with localize.string, which wants #key.
	public static string Reference(Field field, string key) => field == Field.Description ? $"{{#{key}}}" : $"#{key}";

	/// <summary>The key a converted label points to, or <c>null</c> when the label is plain text.</summary>
	public static string? ReferencedKey(Label label)
	{
		var match = (label.Field == Field.Description ? DescriptionReference() : LabelReference()).Match(label.Text.Trim());
		return match.Success ? match.Groups[1].Value : null;
	}

	/// <summary>
	/// Every <c>#key</c> in the labels, with the spelling the label uses. ECMAScript so <c>\w</c> is ASCII-only,
	/// matching the backoffice's own <c>#\w+</c> lookup.
	/// </summary>
	public static Dictionary<string, string> ReferencedKeys(IEnumerable<Label> labels)
	{
		var keys = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
		foreach (var label in labels)
		foreach (Match match in AnyKey().Matches(label.Text))
			keys.TryAdd(match.Groups[1].Value, match.Groups[1].Value);
		return keys;
	}

	/// <summary>Any dictionary key a converted label points to, ours or not (like <c>#Content_Title</c>), so the UI can link to it.</summary>
	public static string? LinkedKey(Label label)
	{
		var match = AnyReference().Match(label.Text.Trim());
		return match.Success ? match.Groups[1].Value + match.Groups[2].Value : null;
	}

	public static bool References(Label label, string key) => label.Field == Field.Description
		? label.Text.Contains($"{{#{key}}}", StringComparison.Ordinal)
		: label.Text.Trim() == $"#{key}";

	/// <param name="all">Labels from every document and element type; sharing is counted across all of them.</param>
	/// <param name="existing">Every dictionary key (case-insensitive) with its default-language value.</param>
	/// <param name="owners">The content types to plan rows for.</param>
	public static List<PlanRow> Build(IEnumerable<Label> all, IReadOnlyDictionary<string, string?> existing, IReadOnlySet<Guid> owners)
	{
		var labels = all.ToList();

		// Shared = the same text on 2+ labels anywhere, so keys don't depend on what is converted first.
		var counts = labels.Where(l => SkipReason(l) is null)
			.GroupBy(l => l.Text.Trim(), StringComparer.Ordinal)
			.ToDictionary(g => g.Key, g => g.Count(), StringComparer.Ordinal);

		// Only reuse our own items, preferring shared ones.
		var reusable = existing
			.Where(e => e.Key.StartsWith(Prefix, StringComparison.Ordinal) && !string.IsNullOrWhiteSpace(e.Value))
			.OrderBy(e => e.Key.StartsWith(SharedFolder + "_", StringComparison.Ordinal) ? 0 : 1)
			.ThenBy(e => e.Key, StringComparer.Ordinal)
			.GroupBy(e => e.Value!.Trim(), StringComparer.Ordinal)
			.ToDictionary(g => g.Key, g => g.First().Key, StringComparer.Ordinal);

		var taken = new HashSet<string>(existing.Keys, StringComparer.OrdinalIgnoreCase);
		var sharedKeys = new Dictionary<string, string>(StringComparer.Ordinal);
		var rows = new List<PlanRow>();

		foreach (var label in labels
			.Where(l => owners.Contains(l.OwnerKey))
			.OrderBy(l => l.OwnerAlias, StringComparer.Ordinal)
			.ThenBy(l => l.Field)
			.ThenBy(l => l.TargetAlias, StringComparer.Ordinal))
		{
			if (SkipReason(label) is { } reason)
			{
				rows.Add(Row(label, reason == "converted" ? LinkedKey(label) : null, RowAction.Skip, false, reason));
				continue;
			}

			var text = label.Text.Trim();
			if (reusable.TryGetValue(text, out var reuseKey))
			{
				rows.Add(Row(label, reuseKey, RowAction.Reuse, false, null));
				continue;
			}

			var shared = counts[text] > 1;
			if (!shared || !sharedKeys.TryGetValue(text, out var key))
			{
				key = Unique(shared ? SharedKey(text) : KeyFor(label), taken);
				taken.Add(key);
				if (shared)
					sharedKeys[text] = key;
			}

			rows.Add(Row(label, key, RowAction.Create, shared, null));
		}

		return rows;
	}

	private static string? SkipReason(Label label)
	{
		var text = label.Text.Trim();
		if (text.StartsWith('#') || text.Contains("{#"))
			return "converted";
		// ufm-localize renders its value as plain text, so markdown in a translation would show raw.
		if (label.Field == Field.Description && Formatting().IsMatch(text))
			return "formatting";
		return null;
	}

	private static string Unique(string key, HashSet<string> taken)
	{
		var candidate = key;
		for (var i = 2; taken.Contains(candidate); i++)
			candidate = $"{key}_{i}";
		return candidate;
	}

	private static string Safe(string alias) => NonWord().Replace(alias, "_");

	private static PlanRow Row(Label l, string? key, RowAction action, bool shared, string? reason) =>
		new(l.OwnerKey, l.OwnerAlias, l.OwnerName, l.Field, l.TargetAlias, l.Text, key, action, shared, reason);

	[GeneratedRegex("[^A-Za-z0-9]+")]
	private static partial Regex NonAlphanumeric();

	[GeneratedRegex("[^A-Za-z0-9_]")]
	private static partial Regex NonWord();

	[GeneratedRegex(@"^#(Backoffice_\w+)$", RegexOptions.ECMAScript)]
	private static partial Regex LabelReference();

	[GeneratedRegex(@"^\{#(Backoffice_\w+)\}$", RegexOptions.ECMAScript)]
	private static partial Regex DescriptionReference();

	[GeneratedRegex(@"^(?:#(\w+)|\{#(\w+)\})$", RegexOptions.ECMAScript)]
	private static partial Regex AnyReference();

	[GeneratedRegex(@"#(\w+)", RegexOptions.ECMAScript)]
	private static partial Regex AnyKey();

	// ponytail: heuristic for markdown/UFM/HTML; widen it if real descriptions slip through.
	[GeneratedRegex(@"[*_`\[\]<>{}~|\\\n]|https?://")]
	private static partial Regex Formatting();
}
