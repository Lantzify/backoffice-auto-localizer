import { i as e, n as t, r as n } from "./localize-action-VJW6qG6O.js";
import { t as r } from "./decorate-DsqXQ0nF.js";
import { UmbModalRouteRegistrationController as i } from "@umbraco-cms/backoffice/router";
import { customElement as a, html as o } from "@umbraco-cms/backoffice/external/lit";
import { UmbCollectionDefaultElement as s } from "@umbraco-cms/backoffice/collection";
// src/collection/collection.element.ts
var c = class extends s {
	#e;
	constructor() {
		super(), new i(this, t).addAdditionalPath(n).onSetup(({ uniques: e }) => ({
			data: { uniques: e === "all" ? null : e.split(",") },
			value: { changed: !1 }
		})).observeRouteBuilder((e) => this.#e = e), this.addEventListener(e, (e) => {
			let t = this.#e?.({ uniques: e.detail.join(",") });
			t && window.history.pushState({}, "", t);
		});
	}
	renderToolbar() {
		return o`<umb-collection-toolbar slot="header"><umb-collection-filter-field></umb-collection-filter-field></umb-collection-toolbar>`;
	}
};
c = r([a("backoffice-auto-localizer-collection")], c);
export { c as BackofficeAutoLocalizerCollectionElement, c as element };

//# sourceMappingURL=collection.element-B9k-BOox.js.map