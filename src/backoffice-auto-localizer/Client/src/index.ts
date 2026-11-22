import { UMB_DOCUMENT_TYPE_ENTITY_TYPE, UMB_DOCUMENT_TYPE_ROOT_ENTITY_TYPE } from "@umbraco-cms/backoffice/document-type";
import { TYPES_VIEW_PATHNAME, WORKSPACE_ENTITY_TYPE } from "./localize-action.js";

const WORKSPACE_ALIAS = "BackofficeAutoLocalizer.Workspace";
const COLLECTION_ALIAS = "BackofficeAutoLocalizer.Collection";
const COLLECTION_REPOSITORY_ALIAS = "BackofficeAutoLocalizer.Collection.Repository";
const collectionCondition = [{ alias: "Umb.Condition.CollectionAlias", match: COLLECTION_ALIAS }];

export const manifests: Array<UmbExtensionManifest> = [
  // English is the fallback for every other backoffice language; add a culture by adding a file next to these.
  {
    type: "localization",
    alias: "BackofficeAutoLocalizer.Localization.En",
    name: "Backoffice Auto Localizer English",
    meta: { culture: "en" },
    js: () => import("./lang/en.js"),
  },
  {
    type: "localization",
    alias: "BackofficeAutoLocalizer.Localization.Sv",
    name: "Backoffice Auto Localizer Swedish",
    meta: { culture: "sv" },
    js: () => import("./lang/sv.js"),
  },
  {
    type: "localization",
    alias: "BackofficeAutoLocalizer.Localization.Ja",
    name: "Backoffice Auto Localizer Japanese",
    meta: { culture: "ja" },
    js: () => import("./lang/ja.js"),
  },
  {
    type: "backofficeEntryPoint",
    alias: "BackofficeAutoLocalizer.EntryPoint",
    name: "Backoffice Auto Localizer Entry Point",
    js: () => import("./entry-point.js"),
  },
  // Settings → Advanced → Auto Localizer, same shape as Extension Insights and Log Viewer.
  {
    type: "menuItem",
    alias: "BackofficeAutoLocalizer.MenuItem",
    name: "Backoffice Auto Localizer Menu Item",
    weight: 100,
    meta: {
      label: "#autoLocalizerLabels_autoLocalizer",
      icon: "icon-globe",
      entityType: WORKSPACE_ENTITY_TYPE,
      menus: ["Umb.Menu.AdvancedSettings"],
    },
  },
  {
    type: "workspace",
    kind: "default",
    alias: WORKSPACE_ALIAS,
    name: "Backoffice Auto Localizer Workspace",
    meta: { entityType: WORKSPACE_ENTITY_TYPE, headline: "#autoLocalizerLabels_autoLocalizer" },
  },
  {
    type: "workspaceView",
    kind: "collection",
    alias: "BackofficeAutoLocalizer.WorkspaceView.Collection",
    name: "Backoffice Auto Localizer Collection View",
    meta: { label: "#autoLocalizerLabels_types", pathname: TYPES_VIEW_PATHNAME, icon: "icon-globe", collectionAlias: COLLECTION_ALIAS },
    conditions: [{ alias: "Umb.Condition.WorkspaceAlias", match: WORKSPACE_ALIAS }],
  },
  {
    type: "collection",
    kind: "default",
    alias: COLLECTION_ALIAS,
    name: "Backoffice Auto Localizer Collection",
    element: () => import("./collection/collection.element.js"),
    meta: { repositoryAlias: COLLECTION_REPOSITORY_ALIAS },
  },
  {
    type: "repository",
    alias: COLLECTION_REPOSITORY_ALIAS,
    name: "Backoffice Auto Localizer Collection Repository",
    api: () => import("./collection/repository.js"),
  },
  {
    type: "collectionView",
    alias: "BackofficeAutoLocalizer.CollectionView.Table",
    name: "Backoffice Auto Localizer Table View",
    element: () => import("./collection/table-view.element.js"),
    meta: { label: "Table", icon: "icon-list", pathName: "table" },
    conditions: collectionCondition,
  },
  {
    type: "entityBulkAction",
    kind: "default",
    alias: "BackofficeAutoLocalizer.BulkAction.Localize",
    name: "Backoffice Auto Localizer Make Translatable",
    api: () => import("./collection/bulk-action.js"),
    forEntityTypes: [UMB_DOCUMENT_TYPE_ENTITY_TYPE],
    meta: { icon: "icon-globe", label: "#autoLocalizerActions_makeTranslatable" },
    conditions: collectionCondition,
  },
  {
    type: "workspaceView",
    alias: "BackofficeAutoLocalizer.WorkspaceView.Usage",
    name: "Backoffice Auto Localizer Dictionary Usage",
    element: () => import("./usage-view.element.js"),
    weight: 10,
    meta: { label: "#autoLocalizerLabels_usage", pathname: "usage", icon: "icon-link" },
    conditions: [{ alias: "Umb.Condition.WorkspaceAlias", match: "Umb.Workspace.Dictionary" }],
  },
  {
    type: "entityAction",
    kind: "default",
    alias: "BackofficeAutoLocalizer.EntityAction.Localize",
    name: "Backoffice Auto Localizer Localize Labels",
    weight: 150,
    api: () => import("./localize-action.js"),
    forEntityTypes: [UMB_DOCUMENT_TYPE_ENTITY_TYPE, UMB_DOCUMENT_TYPE_ROOT_ENTITY_TYPE],
    meta: { icon: "icon-globe", label: "#autoLocalizerActions_localize" },
  },
  {
    type: "modal",
    alias: "BackofficeAutoLocalizer.Modal",
    name: "Backoffice Auto Localizer Modal",
    element: () => import("./localize-modal.element.js"),
  },
];
