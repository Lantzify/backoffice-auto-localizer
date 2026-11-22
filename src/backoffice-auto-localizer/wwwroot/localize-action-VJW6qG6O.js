import { UmbEntityActionBase as e } from "@umbraco-cms/backoffice/entity-action";
import { UmbModalToken as t } from "@umbraco-cms/backoffice/modal";
import { encodeFolderName as n } from "@umbraco-cms/backoffice/router";
// \0rolldown/runtime.js
var r = Object.defineProperty, i = /* @__PURE__ */ ((e, t) => {
	let n = {};
	for (var i in e) r(n, i, {
		get: e[i],
		enumerable: !0
	});
	return t || r(n, Symbol.toStringTag, { value: "Module" }), n;
})({
	ALL_TYPES: () => "all",
	LOCALIZE_MODAL: () => s,
	LOCALIZE_PATH: () => c,
	LocalizeEntityAction: () => f,
	OPEN_LOCALIZE_EVENT: () => u,
	TYPES_VIEW_PATHNAME: () => o,
	WORKSPACE_ENTITY_TYPE: () => a,
	api: () => f,
	openLocalize: () => d
}), a = "backoffice-auto-localizer", o = "types", s = new t("BackofficeAutoLocalizer.Modal", { modal: {
	type: "sidebar",
	size: "large"
} }), c = "localize/:uniques", l = "all", u = "backoffice-auto-localizer-open", d = (e, t) => e.dispatchEvent(new CustomEvent(u, {
	detail: t,
	bubbles: !0,
	composed: !0
})), f = class extends e {
	async getHref() {
		return `${`section/settings/workspace/${a}/view/${o}`}/modal/${n(s.toString())}/localize/${this.args.unique ?? "all"}`;
	}
};
export { o as a, d as c, u as i, s as n, a as o, c as r, i as s, l as t };

//# sourceMappingURL=localize-action-VJW6qG6O.js.map