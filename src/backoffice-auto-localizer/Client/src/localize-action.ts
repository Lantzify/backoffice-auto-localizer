import { UmbEntityActionBase } from "@umbraco-cms/backoffice/entity-action";
import { UmbModalToken } from "@umbraco-cms/backoffice/modal";
import { encodeFolderName } from "@umbraco-cms/backoffice/router";

export const WORKSPACE_ENTITY_TYPE = "backoffice-auto-localizer";
export const TYPES_VIEW_PATHNAME = "types";

/** `uniques` is null for all types (the Document Types root). */
export interface LocalizeModalData {
  uniques: string[] | null;
}

export interface LocalizeModalValue {
  changed: boolean;
}

export const LOCALIZE_MODAL = new UmbModalToken<LocalizeModalData, LocalizeModalValue>("BackofficeAutoLocalizer.Modal", {
  modal: { type: "sidebar", size: "large" },
});

// The sidebar is a routed modal on the Auto Localizer collection, so the dictionary editor can open on top of it.
export const LOCALIZE_PATH = "localize/:uniques";
export const ALL_TYPES = "all";

/** Asks the Auto Localizer collection to open the sidebar for these types. */
export const OPEN_LOCALIZE_EVENT = "backoffice-auto-localizer-open";
export const openLocalize = (from: EventTarget, uniques: string[]) =>
  from.dispatchEvent(new CustomEvent(OPEN_LOCALIZE_EVENT, { detail: uniques, bubbles: true, composed: true }));

/** "Localize…" on a document type (or the root, for all types): opens Auto Localizer with that type's sidebar. */
export class LocalizeEntityAction extends UmbEntityActionBase<never> {
  // ponytail: rebuilds the URL of the collection's modal route by hand; update it if LOCALIZE_PATH or the view moves.
  override async getHref() {
    const view = `section/settings/workspace/${WORKSPACE_ENTITY_TYPE}/view/${TYPES_VIEW_PATHNAME}`;
    return `${view}/modal/${encodeFolderName(LOCALIZE_MODAL.toString())}/localize/${this.args.unique ?? ALL_TYPES}`;
  }
}

export { LocalizeEntityAction as api };
