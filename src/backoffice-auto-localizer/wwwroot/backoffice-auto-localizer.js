import { a as e, o as t } from "./localize-action-VJW6qG6O.js";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE as n, UMB_DOCUMENT_TYPE_ROOT_ENTITY_TYPE as r } from "@umbraco-cms/backoffice/document-type";
// src/index.ts
var i = "BackofficeAutoLocalizer.Workspace", a = "BackofficeAutoLocalizer.Collection", o = "BackofficeAutoLocalizer.Collection.Repository", s = [{
	alias: "Umb.Condition.CollectionAlias",
	match: a
}], c = [
	{
		type: "localization",
		alias: "BackofficeAutoLocalizer.Localization.En",
		name: "Backoffice Auto Localizer English",
		meta: { culture: "en" },
		js: () => import("./en-B1snF8Ao.js")
	},
	{
		type: "localization",
		alias: "BackofficeAutoLocalizer.Localization.Sv",
		name: "Backoffice Auto Localizer Swedish",
		meta: { culture: "sv" },
		js: () => import("./sv-BIYb7zgh.js")
	},
	{
		type: "localization",
		alias: "BackofficeAutoLocalizer.Localization.Ja",
		name: "Backoffice Auto Localizer Japanese",
		meta: { culture: "ja" },
		js: () => import("./ja-DFx6cgIn.js")
	},
	{
		type: "backofficeEntryPoint",
		alias: "BackofficeAutoLocalizer.EntryPoint",
		name: "Backoffice Auto Localizer Entry Point",
		js: () => import("./entry-point-DcRVOs2-.js")
	},
	{
		type: "menuItem",
		alias: "BackofficeAutoLocalizer.MenuItem",
		name: "Backoffice Auto Localizer Menu Item",
		weight: 100,
		meta: {
			label: "#autoLocalizerLabels_autoLocalizer",
			icon: "icon-globe",
			entityType: t,
			menus: ["Umb.Menu.AdvancedSettings"]
		}
	},
	{
		type: "workspace",
		kind: "default",
		alias: i,
		name: "Backoffice Auto Localizer Workspace",
		meta: {
			entityType: t,
			headline: "#autoLocalizerLabels_autoLocalizer"
		}
	},
	{
		type: "workspaceView",
		kind: "collection",
		alias: "BackofficeAutoLocalizer.WorkspaceView.Collection",
		name: "Backoffice Auto Localizer Collection View",
		meta: {
			label: "#autoLocalizerLabels_types",
			pathname: e,
			icon: "icon-globe",
			collectionAlias: a
		},
		conditions: [{
			alias: "Umb.Condition.WorkspaceAlias",
			match: i
		}]
	},
	{
		type: "collection",
		kind: "default",
		alias: a,
		name: "Backoffice Auto Localizer Collection",
		element: () => import("./collection.element-B9k-BOox.js"),
		meta: { repositoryAlias: o }
	},
	{
		type: "repository",
		alias: o,
		name: "Backoffice Auto Localizer Collection Repository",
		api: () => import("./repository-Cm86txoM.js")
	},
	{
		type: "collectionView",
		alias: "BackofficeAutoLocalizer.CollectionView.Table",
		name: "Backoffice Auto Localizer Table View",
		element: () => import("./table-view.element-C4NrQOD1.js"),
		meta: {
			label: "Table",
			icon: "icon-list",
			pathName: "table"
		},
		conditions: s
	},
	{
		type: "entityBulkAction",
		kind: "default",
		alias: "BackofficeAutoLocalizer.BulkAction.Localize",
		name: "Backoffice Auto Localizer Make Translatable",
		api: () => import("./bulk-action-V6FScuEa.js"),
		forEntityTypes: [n],
		meta: {
			icon: "icon-globe",
			label: "#autoLocalizerActions_makeTranslatable"
		},
		conditions: s
	},
	{
		type: "workspaceView",
		alias: "BackofficeAutoLocalizer.WorkspaceView.Usage",
		name: "Backoffice Auto Localizer Dictionary Usage",
		element: () => import("./usage-view.element-CDTOvSLI.js"),
		weight: 10,
		meta: {
			label: "#autoLocalizerLabels_usage",
			pathname: "usage",
			icon: "icon-link"
		},
		conditions: [{
			alias: "Umb.Condition.WorkspaceAlias",
			match: "Umb.Workspace.Dictionary"
		}]
	},
	{
		type: "entityAction",
		kind: "default",
		alias: "BackofficeAutoLocalizer.EntityAction.Localize",
		name: "Backoffice Auto Localizer Localize Labels",
		weight: 150,
		api: () => import("./localize-action-VJW6qG6O.js").then((e) => e.s),
		forEntityTypes: [n, r],
		meta: {
			icon: "icon-globe",
			label: "#autoLocalizerActions_localize"
		}
	},
	{
		type: "modal",
		alias: "BackofficeAutoLocalizer.Modal",
		name: "Backoffice Auto Localizer Modal",
		element: () => import("./localize-modal.element-JrwdmXtA.js")
	}
];
export { c as manifests };

//# sourceMappingURL=backoffice-auto-localizer.js.map