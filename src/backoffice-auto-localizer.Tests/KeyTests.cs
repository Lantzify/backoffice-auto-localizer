using BackofficeAutoLocalizer;
using Umbraco.Cms.Core.Models;

namespace BackofficeAutoLocalizer.Tests;

public class KeyTests
{
	private static readonly Guid Page = Guid.NewGuid(), Article = Guid.NewGuid();

	private static Label L(Guid owner, string ownerAlias, Field field, string alias, string text) =>
		new(owner, ownerAlias, ownerAlias, field, alias, text);

	private static readonly Label[] All =
	[
		L(Page, "contentPage", Field.Name, "title", "Title"),
		L(Page, "contentPage", Field.Name, "body", "Main content"),
		L(Page, "contentPage", Field.Description, "body", "The **main** text"),
		L(Page, "contentPage", Field.Group, "seo/meta", "Meta"),
		L(Article, "articlePage", Field.Name, "title", "Title"),
		L(Article, "articlePage", Field.Name, "author", "#Backoffice_articlePage_author"),
	];

	private static List<PlanRow> Plan(IReadOnlyDictionary<string, string?>? existing = null, params Guid[] owners) =>
		Planner.Build(All, existing ?? new Dictionary<string, string?>(), owners.Length == 0 ? new HashSet<Guid> { Page, Article } : owners.ToHashSet());

	private static PlanRow Row(List<PlanRow> rows, Guid owner, Field field, string alias) =>
		rows.Single(r => r.OwnerKey == owner && r.Field == field && r.TargetAlias == alias);

	[Fact]
	public void Keys_follow_the_tree_rules()
	{
		var rows = Plan();
		Assert.Equal("Backoffice_contentPage_body", Row(rows, Page, Field.Name, "body").Key);
		Assert.Equal("Backoffice_contentPage_group_seo_meta", Row(rows, Page, Field.Group, "seo/meta").Key);
	}

	[Fact]
	public void Text_used_twice_anywhere_is_shared_even_when_only_one_type_is_planned()
	{
		var row = Row(Plan(null, Page), Page, Field.Name, "title");
		Assert.Equal("Backoffice_shared_title", row.Key);
		Assert.True(row.Shared);
	}

	[Fact]
	public void Converted_and_formatted_labels_are_skipped()
	{
		var rows = Plan();
		var author = Row(rows, Article, Field.Name, "author");
		Assert.Equal(("converted", "Backoffice_articlePage_author"), (author.Reason, author.Key));
		Assert.Equal("formatting", Row(rows, Page, Field.Description, "body").Reason);
	}

	[Fact]
	public void Existing_item_with_the_same_value_is_reused_but_a_clash_gets_a_suffix()
	{
		var existing = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase)
		{
			["Backoffice_old_mainContent"] = "Main content",
			["backoffice_shared_title"] = "Something else",
			["frontend_title"] = "Title", // not ours, never reused
		};
		var rows = Plan(existing);

		var body = Row(rows, Page, Field.Name, "body");
		Assert.Equal((RowAction.Reuse, "Backoffice_old_mainContent"), (body.Action, body.Key));
		Assert.Equal("Backoffice_shared_title_2", Row(rows, Page, Field.Name, "title").Key);
		Assert.Equal("Backoffice_shared_title_2", Row(rows, Article, Field.Name, "title").Key);
	}

	[Theory]
	[InlineData("Rubrik för sidan!", "Backoffice_shared_rubrikForSidan")]
	[InlineData("SEO title", "Backoffice_shared_seoTitle")]
	public void Shared_keys_are_ascii_camel_case(string text, string expected) => Assert.Equal(expected, Planner.SharedKey(text));

	[Fact]
	public void Shared_key_for_non_latin_text_falls_back_to_a_hash() =>
		Assert.Matches("^Backoffice_shared_item[0-9a-f]{8}$", Planner.SharedKey("Заголовок"));

	[Fact]
	public void References_round_trip()
	{
		Assert.Equal("Backoffice_x_y", Planner.ReferencedKey(L(Page, "x", Field.Name, "y", Planner.Reference(Field.Name, "Backoffice_x_y"))));
		Assert.Equal("Backoffice_x_y", Planner.ReferencedKey(L(Page, "x", Field.Description, "y", Planner.Reference(Field.Description, "Backoffice_x_y"))));
		Assert.Null(Planner.ReferencedKey(L(Page, "x", Field.Name, "y", "#general_close")));
	}

	[Theory]
	[InlineData("#Content_Title", "Content_Title")]
	[InlineData("{#Content_Intro}", "Content_Intro")]
	[InlineData("See {#Content_Intro}", null)]
	public void Converted_labels_link_to_any_key_they_point_to(string text, string? expected) =>
		Assert.Equal(expected, Planner.LinkedKey(L(Page, "x", Field.Name, "y", text)));

	[Fact]
	public void Type_name_and_description_get_their_own_keys_and_plain_references()
	{
		Assert.Equal("Backoffice_contentPage_typeName", Planner.KeyFor(L(Page, "contentPage", Field.TypeName, "", "Content Page")));
		Assert.Equal("Backoffice_contentPage_typeDescription", Planner.KeyFor(L(Page, "contentPage", Field.TypeDescription, "", "A page")));
		Assert.Equal("#Backoffice_x", Planner.Reference(Field.TypeDescription, "Backoffice_x"));
	}

	[Fact]
	public void Reader_serves_our_prefix_and_referenced_keys_and_adds_an_en_fallback()
	{
		var sv = new Language("sv-SE", "Swedish");
		var items = new[]
		{
			new DictionaryItem("Backoffice_contentPage_title") { Translations = [new DictionaryTranslation(sv, "Rubrik")] },
			new DictionaryItem("Content_Title") { Translations = [new DictionaryTranslation(sv, "Innehållsrubrik")] },
			new DictionaryItem("general_close") { Translations = [new DictionaryTranslation(sv, "Stäng")] }, // no label uses it
		};
		// Lower case on purpose: the label's spelling wins, since the backoffice lookup is case-sensitive.
		var referenced = Planner.ReferencedKeys([L(Page, "x", Field.Name, "y", "#content_title")]);

		var extensions = LocalizationReader.Build(items, "sv-SE", referenced).Cast<Dictionary<string, object>>().ToList();

		Assert.Equal(["sv-SE", "en"], extensions.Select(e => (string)((Dictionary<string, object>)e["meta"])["culture"]));
		foreach (var extension in extensions)
		{
			var sections = (Dictionary<string, Dictionary<string, string>>)((Dictionary<string, object>)extension["meta"])["localizations"];
			Assert.Equal(["Backoffice", "content"], sections.Keys.Order(StringComparer.Ordinal));
			Assert.Equal("Rubrik", sections["Backoffice"]["contentPage_title"]);
			Assert.Equal("Innehållsrubrik", sections["content"]["title"]);
		}
	}

	// "#Rubrik_för" gives "Rubrik_f" because the backoffice's own #\w+ lookup stops at "ö" too.
	[Fact]
	public void Referenced_keys_are_found_anywhere_in_a_label_the_way_the_backoffice_finds_them() =>
		Assert.Equal(
			["Content_Intro", "Content_Title", "Rubrik_f"],
			Planner.ReferencedKeys([L(Page, "x", Field.Name, "y", "#Content_Title"), L(Page, "x", Field.Description, "y", "See {#Content_Intro}, #Rubrik_för")])
				.Keys.Order(StringComparer.Ordinal));
}
