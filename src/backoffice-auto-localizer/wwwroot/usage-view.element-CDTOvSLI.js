import { t as e } from "./api-mPl3T_PU.js";
import { t } from "./decorate-DsqXQ0nF.js";
import { UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN as n } from "@umbraco-cms/backoffice/document-type";
import { css as r, customElement as i, html as a, repeat as o, state as s } from "@umbraco-cms/backoffice/external/lit";
import { tryExecute as c } from "@umbraco-cms/backoffice/resources";
import { UmbLitElement as l } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as u } from "@umbraco-cms/backoffice/style";
import { UMB_DICTIONARY_WORKSPACE_CONTEXT as d } from "@umbraco-cms/backoffice/dictionary";
// src/labels.ts
var f = {
	TypeName: "autoLocalizerLabels_documentTypeName",
	TypeDescription: "autoLocalizerLabels_documentTypeDescription",
	Name: "autoLocalizerLabels_propertyName",
	Description: "general_description",
	Tab: "settings_tab",
	Group: "general_group"
}, p = class extends l {
	constructor() {
		super(), this.consumeContext(d, (e) => {
			this.observe(e?.name, (e) => this.#e(e), "_observeName");
		});
	}
	async #e(t) {
		if (!t) return;
		let { data: n } = await c(this, e.usage({ query: { key: t } }));
		this._rows = n ?? [];
	}
	render() {
		return this._rows ? a`
      <uui-box headline=${this.localize.term("autoLocalizerLabels_usedBy")}>
        ${this._rows.length === 0 ? a`<p>${this.localize.term("autoLocalizerMessages_notUsed")}</p>` : a`<uui-table>
              <uui-table-head>
                <uui-table-head-cell>${this.localize.term("autoLocalizerLabels_contentType")}</uui-table-head-cell>
                <uui-table-head-cell>${this.localize.term("general_field")}</uui-table-head-cell>
                <uui-table-head-cell>${this.localize.term("general_alias")}</uui-table-head-cell>
              </uui-table-head>
              ${o(this._rows, (e) => `${e.contentTypeKey}|${e.field}|${e.targetAlias}`, (e) => a`
                  <uui-table-row>
                    <uui-table-cell>
                      <a href=${n.generateAbsolute({ unique: e.contentTypeKey })}>
                        <umb-icon name=${e.contentTypeIcon ?? "icon-document"}></umb-icon>
                        ${this.localize.string(e.contentTypeName)}
                      </a>
                    </uui-table-cell>
                    <uui-table-cell>${this.localize.term(f[e.field])}</uui-table-cell>
                    <uui-table-cell>${e.targetAlias}</uui-table-cell>
                  </uui-table-row>
                `)}
            </uui-table>`}
      </uui-box>
    ` : a`<uui-loader></uui-loader>`;
	}
	static {
		this.styles = [u, r`
      :host {
        display: block;
        padding: var(--uui-size-layout-1);
      }
      a {
        display: inline-flex;
        align-items: center;
        gap: var(--uui-size-space-2);
      }
    `];
	}
};
t([s()], p.prototype, "_rows", void 0), p = t([i("backoffice-auto-localizer-usage-view")], p);
export { p as BackofficeAutoLocalizerUsageViewElement, p as element };

//# sourceMappingURL=usage-view.element-CDTOvSLI.js.map