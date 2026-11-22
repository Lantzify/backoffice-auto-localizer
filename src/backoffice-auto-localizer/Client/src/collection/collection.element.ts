import { customElement, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbCollectionDefaultElement } from "@umbraco-cms/backoffice/collection";
import { UmbModalRouteRegistrationController, type UmbModalRouteBuilder } from "@umbraco-cms/backoffice/router";
import { ALL_TYPES, LOCALIZE_MODAL, LOCALIZE_PATH, OPEN_LOCALIZE_EVENT } from "../localize-action.js";

/** The default collection, plus a search field and the sidebar's route. */
@customElement("backoffice-auto-localizer-collection")
export class BackofficeAutoLocalizerCollectionElement extends UmbCollectionDefaultElement {
  #localizePath?: UmbModalRouteBuilder;

  constructor() {
    super();
    // A URL for the sidebar, so Umbraco's dictionary editor can open on top of it and Back closes it.
    new UmbModalRouteRegistrationController(this, LOCALIZE_MODAL)
      .addAdditionalPath(LOCALIZE_PATH)
      .onSetup(({ uniques }) => ({
        data: { uniques: uniques === ALL_TYPES ? null : uniques.split(",") },
        value: { changed: false },
      }))
      .observeRouteBuilder((builder) => (this.#localizePath = builder));

    // Rows and the selection bar ask for the sidebar with an event, since only this element knows its route.
    this.addEventListener(OPEN_LOCALIZE_EVENT, (e) => {
      const path = this.#localizePath?.({ uniques: (e as CustomEvent<string[]>).detail.join(",") });
      if (path) window.history.pushState({}, "", path);
    });
  }

  protected override renderToolbar() {
    return html`<umb-collection-toolbar slot="header"><umb-collection-filter-field></umb-collection-filter-field></umb-collection-toolbar>`;
  }
}

export { BackofficeAutoLocalizerCollectionElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "backoffice-auto-localizer-collection": BackofficeAutoLocalizerCollectionElement;
  }
}
