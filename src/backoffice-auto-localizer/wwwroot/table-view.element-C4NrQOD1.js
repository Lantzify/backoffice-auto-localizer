import { c as e } from "./localize-action-VJW6qG6O.js";
import { t } from "./decorate-DsqXQ0nF.js";
import { customElement as n, html as r, nothing as i, state as a } from "@umbraco-cms/backoffice/external/lit";
import { UMB_COLLECTION_CONTEXT as o } from "@umbraco-cms/backoffice/collection";
import { UmbLitElement as s } from "@umbraco-cms/backoffice/lit-element";
// src/collection/table-view.element.ts
var c = "color: var(--uui-color-text-alt); font-size: var(--uui-type-small-size)", l = "width: 120px; height: 6px; border-radius: 3px; background: var(--uui-color-surface-alt); overflow: hidden", u = class extends s {
	#e;
	#t;
	constructor() {
		super(), this._types = [], this._selection = [], this.#t = { allowSelection: !0 }, this.consumeContext(o, (e) => {
			this.#e = e, this.observe(e?.items, (e) => this._types = e ?? [], "_items"), this.observe(e?.selection.selection, (e) => this._selection = e ?? [], "_selection");
		});
	}
	get #n() {
		return [
			{
				name: this.localize.term("general_type"),
				alias: "name"
			},
			{
				name: this.localize.term("autoLocalizerLabels_hasCompositions"),
				alias: "compositions",
				align: "center"
			},
			{
				name: this.localize.term("autoLocalizerLabels_translatableLabels"),
				alias: "progress"
			}
		];
	}
	#r(e) {
		let t = e.compositions.join(", ");
		return {
			id: e.unique,
			icon: e.icon ?? "icon-document",
			data: [
				{
					columnAlias: "name",
					value: r`<uui-button compact style="text-align: left" label=${e.name} @click=${() => this.#i(e.unique)}></uui-button>
            ${e.isElement ? r`<span style=${c}>${this.localize.term("contentTypeEditor_elementType")}</span>` : i}`
				},
				{
					columnAlias: "compositions",
					value: e.compositions.length ? r`<uui-icon
                name="icon-check"
                style="color: var(--uui-color-positive)"
                role="img"
                aria-label=${this.localize.term("autoLocalizerLabels_usesCompositions", t)}
                title=${t}></uui-icon>` : r`<uui-icon name="icon-wrong" style=${c} role="img" aria-label=${this.localize.term("general_no")}></uui-icon>`
				},
				{
					columnAlias: "progress",
					value: r`<div style="display: flex; align-items: center; gap: var(--uui-size-space-3); white-space: nowrap">
            <div style=${l}>
              <div style="height: 100%; width: ${e.done / e.total * 100}%; background: var(--uui-color-positive)"></div>
            </div>
            ${this.localize.term("autoLocalizerLabels_progress", e.done, e.total)}
          </div>`
				}
			]
		};
	}
	#i(t) {
		e(this, [t]);
	}
	#a(e) {
		e.stopPropagation(), this.#e?.selection.setSelection(e.target.selection);
	}
	render() {
		return r`<umb-table
      .config=${this.#t}
      .columns=${this.#n}
      .items=${this._types.map((e) => this.#r(e))}
      .selection=${this._selection}
      @selected=${this.#a}
      @deselected=${this.#a}></umb-table>`;
	}
};
t([a()], u.prototype, "_types", void 0), t([a()], u.prototype, "_selection", void 0), u = t([n("backoffice-auto-localizer-table-view")], u);
export { u as BackofficeAutoLocalizerTableViewElement, u as element };

//# sourceMappingURL=table-view.element-C4NrQOD1.js.map