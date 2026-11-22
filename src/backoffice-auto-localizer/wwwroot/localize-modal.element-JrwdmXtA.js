import { t as e } from "./api-mPl3T_PU.js";
import { t } from "./decorate-DsqXQ0nF.js";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE as n } from "@umbraco-cms/backoffice/document-type";
import { UmbEntityUpdatedEvent as r, UmbRequestReloadStructureForEntityEvent as i } from "@umbraco-cms/backoffice/entity-action";
import { UmbModalBaseElement as a, umbConfirmModal as o } from "@umbraco-cms/backoffice/modal";
import { UmbModalRouteRegistrationController as s } from "@umbraco-cms/backoffice/router";
import { css as c, customElement as l, html as u, nothing as d, repeat as f, state as p } from "@umbraco-cms/backoffice/external/lit";
import { tryExecute as m } from "@umbraco-cms/backoffice/resources";
import { UmbTextStyles as h } from "@umbraco-cms/backoffice/style";
import { UMB_NOTIFICATION_CONTEXT as g } from "@umbraco-cms/backoffice/notification";
import { UMB_ACTION_EVENT_CONTEXT as _ } from "@umbraco-cms/backoffice/action";
import { UMB_DICTIONARY_ENTITY_TYPE as v, UMB_EDIT_DICTIONARY_WORKSPACE_PATH_PATTERN as y } from "@umbraco-cms/backoffice/dictionary";
import { UMB_WORKSPACE_MODAL as b } from "@umbraco-cms/backoffice/workspace";
// src/localize-modal.element.ts
var x = (e) => `${e.ownerKey}|${e.field}|${e.targetAlias}`, S = class extends a {
	constructor() {
		super(), this._checked = /* @__PURE__ */ new Set(), this._busy = !1, this._expanded = /* @__PURE__ */ new Set(), new s(this, b).addAdditionalPath(v).onSetup(() => ({ data: {
			entityType: v,
			preset: {}
		} })).observeRouteBuilder((e) => this._dictionaryPath = e({}));
	}
	firstUpdated() {
		this.#t();
	}
	get #e() {
		return this.data?.uniques ?? null;
	}
	async #t() {
		let { data: t } = await m(this, e.plan({ body: { typeKeys: this.#e } }));
		if (!t) return;
		this._rows = t;
		let n = t.filter((e) => e.action !== "Skip");
		this._checked = new Set(n.map(x));
		let r = [...new Set(t.map((e) => e.ownerKey))], i = this.#e;
		this._expanded = new Set(r.length === 1 ? r : i?.length === 1 ? i : []);
	}
	#n(e) {
		let t = new Set(this._expanded);
		t.delete(e) || t.add(e), this._expanded = t;
	}
	async #r() {
		let t = this._rows.filter((e) => this._checked.has(x(e)));
		this._busy = !0;
		let { data: n } = await m(this, e.apply({ body: {
			typeKeys: this.#e,
			rows: t.map(({ ownerKey: e, field: t, targetAlias: n }) => ({
				ownerKey: e,
				field: t,
				targetAlias: n
			}))
		} }));
		this._busy = !1, n && await this.#a(this.localize.term("autoLocalizerNotifications_madeTranslatable", t.length), `${this.localize.term("autoLocalizerNotifications_created", n.created, n.reused)} ${this.localize.term("autoLocalizerNotifications_reload")}`);
	}
	async #i() {
		if (!await o(this, {
			headline: this.localize.term("autoLocalizerMessages_restoreHeadline"),
			content: this.localize.term("autoLocalizerMessages_restoreContent"),
			confirmLabel: this.localize.term("general_restore"),
			color: "danger"
		}).then(() => !0, () => !1)) return;
		this._busy = !0;
		let { data: t } = await m(this, e.revert({ body: { typeKeys: this.#e } }));
		this._busy = !1, t && await this.#a(this.localize.term("autoLocalizerNotifications_restored", t.restored), this.localize.term("autoLocalizerNotifications_reload"));
	}
	async #a(e, t) {
		(await this.getContext(g))?.peek("positive", { data: {
			headline: e,
			message: t
		} });
		let a = await this.getContext(_);
		for (let e of this.#e ?? []) {
			let t = {
				unique: e,
				entityType: n
			};
			a?.dispatchEvent(new r(t)), a?.dispatchEvent(new i(t));
		}
		this.updateValue({ changed: !0 }), this._submitModal();
	}
	#o(e, t) {
		let n = t.target.checked, r = new Set(this._checked);
		for (let t of e) n ? r.add(x(t)) : r.delete(x(t));
		this._checked = r;
	}
	render() {
		let e = this._rows ?? [], t = e.filter((e) => e.action !== "Skip"), n = e.filter((e) => e.reason === "converted").length, r = this._checked.size;
		return u`
      <umb-body-layout headline=${this.localize.term("autoLocalizerLabels_makeLabelsTranslatable")}>
        ${this._rows ? this.#s() : u`<uui-loader></uui-loader>`}
        <uui-button slot="actions" label=${this.localize.term("general_close")} @click=${() => this._rejectModal()}></uui-button>
        ${n ? u`<uui-button
              slot="actions"
              look="secondary"
              label=${this.localize.term("autoLocalizerActions_restoreLabels")}
              ?disabled=${this._busy}
              @click=${this.#i}></uui-button>` : d}
        ${t.length ? u`<uui-button
              slot="actions"
              look="primary"
              color="positive"
              label=${this.localize.term("autoLocalizerActions_makeCountTranslatable", r)}
              ?disabled=${!r || this._busy}
              .state=${this._busy ? "waiting" : void 0}
              @click=${this.#r}></uui-button>` : d}
      </umb-body-layout>
    `;
	}
	#s() {
		let e = /* @__PURE__ */ new Map();
		for (let t of this._rows) e.set(t.ownerKey, [...e.get(t.ownerKey) ?? [], t]);
		return u`
      <p class="intro">${this.localize.term("autoLocalizerMessages_intro")}</p>
      ${e.size ? d : u`<p class="note">${this.localize.term("autoLocalizerMessages_noLabels")}</p>`}
      ${f(e.values(), (e) => e[0].ownerKey, (e) => this.#c(e))}
    `;
	}
	#c(e) {
		let t = e[0], n = e.filter((e) => e.action !== "Skip"), r = n.filter((e) => this._checked.has(x(e))).length, i = e.filter((e) => e.reason === "converted").length, a = e.length, o = this.#e, s = /* @__PURE__ */ new Map();
		for (let t of e.filter((e) => e.field === "Name" || e.field === "Description")) {
			let e = s.get(t.targetAlias) ?? {};
			e[t.field === "Name" ? "name" : "description"] = t, s.set(t.targetAlias, e);
		}
		let c = this.localize.string(t.ownerName), l = this._expanded.has(t.ownerKey);
		return u`
      <uui-box class=${l ? "" : "collapsed"}>
        <uui-checkbox
          slot="headline"
          label=${c}
          .checked=${n.length ? r === n.length : i > 0}
          .indeterminate=${r > 0 && r < n.length}
          ?disabled=${!n.length}
          @change=${(e) => this.#o(n, e)}>
          <b>${c}</b>
          ${o && !o.includes(t.ownerKey) ? u`<span class="hint">${this.localize.term("create_composition")}</span>` : d}
        </uui-checkbox>
        <uui-button
          slot="header-actions"
          compact
          label=${this.localize.term(l ? "autoLocalizerActions_hideLabels" : "autoLocalizerActions_showLabels", c)}
          aria-expanded=${l}
          @click=${() => this.#n(t.ownerKey)}>
          <span class="hint">${this.localize.term("autoLocalizerLabels_translatableProgress", i, a)}</span>
          <uui-symbol-expand ?open=${l}></uui-symbol-expand>
        </uui-button>
        ${l ? this.#l(e, s) : d}
      </uui-box>
    `;
	}
	#l(e, t) {
		let n = this.localize.term("general_description");
		return u`
        ${this.#u(this.localize.term("content_documentType"), e.filter((e) => e.field === "TypeName" || e.field === "TypeDescription"), (e) => e.field === "TypeName" ? this.localize.term("general_name") : n)}
        ${t.size ? u`<div class="section">${this.localize.term("general_properties")}</div>
              ${[...t].map(([e, { name: t, description: r }]) => u`
                  <div class="row">${t ? this.#d(t) : u`<span class="hint">${e}</span>`}</div>
                  ${r ? u`<div class="row sub">${this.#d(r, n)}</div>` : d}
                `)}` : d}
        ${this.#u(this.localize.term("settings_tabs"), e.filter((e) => e.field === "Tab"))}
        ${this.#u(this.localize.term("general_groups"), e.filter((e) => e.field === "Group"))}
    `;
	}
	#u(e, t, n) {
		return t.length ? u`<div class="section">${e}</div>
      ${t.map((e) => u`<div class="row">${this.#d(e, n?.(e))}</div>`)}` : d;
	}
	#d(e, t) {
		if (e.action === "Skip") {
			let n = e.reason === "converted", r = n ? this.localize.string(e.text.replace(/\{(#\w+)\}/g, "$1")) : e.text;
			return u`
        <uui-checkbox label=${r} title=${n ? e.text : ""} disabled .checked=${n}>
          ${t ? u`<span class="prefix">${t}</span>` : d}${r}
        </uui-checkbox>
        ${n ? this.#p(e) : this.#f(e)}
      `;
		}
		return u`
      <uui-checkbox
        label=${e.text}
        title="${e.targetAlias} → ${e.key}"
        .checked=${this._checked.has(x(e))}
        @change=${(t) => this.#o([e], t)}>
        ${t ? u`<span class="prefix">${t}</span>` : d}${e.text}
      </uui-checkbox>
      ${e.action === "Reuse" ? u`<uui-tag look="secondary" title=${this.localize.term("autoLocalizerMessages_existingHint")}
            >${this.localize.term("autoLocalizerLabels_existing")}</uui-tag
          >` : d}
      ${e.shared && e.action === "Create" ? u`<uui-tag look="secondary" title=${this.localize.term("autoLocalizerMessages_sharedHint")}
            >${this.localize.term("autoLocalizerLabels_shared")}</uui-tag
          >` : d}
    `;
	}
	#f(e) {
		let t = this.localize.term("autoLocalizerMessages_formattingHint"), n = `why-${e.ownerKey}-${e.targetAlias}`;
		return u`
      <uui-tag look="secondary" color="warning" title=${t}>${this.localize.term("autoLocalizerLabels_notTranslatable")}</uui-tag>
      <uui-button compact label=${this.localize.term("autoLocalizerLabels_whyNotTranslatable")} popovertarget=${n}>
        <uui-icon name="icon-info"></uui-icon>
      </uui-button>
      <uui-popover-container id=${n} placement="bottom-end">
        <umb-popover-layout><p class="why">${t}</p></umb-popover-layout>
      </uui-popover-container>
    `;
	}
	#p(e) {
		return !e.dictionaryId || this._dictionaryPath === void 0 ? u`<uui-tag look="secondary" color="positive">${this.localize.term("autoLocalizerLabels_translatable")}</uui-tag>` : u`<uui-button
      class="dictionary-link"
      look="secondary"
      label=${this.localize.term("autoLocalizerActions_openDictionaryItem")}
      title=${e.key ?? ""}
      href=${this._dictionaryPath + y.generateLocal({ unique: e.dictionaryId })}>
      <uui-icon name="icon-book-alt"></uui-icon>
      ${this.localize.term("autoLocalizerActions_openDictionaryItem")}
    </uui-button>`;
	}
	static {
		this.styles = [h, c`
      .intro {
        margin-top: 0;
      }
      .note {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        color: var(--uui-color-text-alt);
      }
      uui-box {
        margin-top: var(--uui-size-space-4);
      }
      uui-box.collapsed {
        --uui-box-default-padding: 0;
      }
      uui-symbol-expand {
        margin-left: var(--uui-size-space-2);
      }
      .section {
        margin: var(--uui-size-space-3) 0 var(--uui-size-space-1);
        color: var(--uui-color-text-alt);
        font-size: var(--uui-type-small-size);
        font-weight: bold;
      }
      .section:first-child {
        margin-top: 0;
      }
      .row {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        padding: var(--uui-size-space-1) 0;
        border-top: 1px solid var(--uui-color-divider);
      }
      .row uui-checkbox {
        flex: 1;
      }
      .why {
        margin: 0;
        padding: var(--uui-size-space-4);
        max-width: 320px;
      }
      .dictionary-link {
        margin: var(--uui-size-space-2) 0;
      }
      .dictionary-link uui-icon {
        margin-right: var(--uui-size-space-2);
      }
      .row.sub {
        border-top: none;
        padding-top: 0;
        padding-left: var(--uui-size-space-6);
      }
      .prefix,
      .hint {
        color: var(--uui-color-text-alt);
        font-size: var(--uui-type-small-size);
        font-weight: normal;
      }
      .prefix {
        margin-right: var(--uui-size-space-2);
      }
      .hint {
        margin-left: var(--uui-size-space-2);
      }
    `];
	}
};
t([p()], S.prototype, "_rows", void 0), t([p()], S.prototype, "_checked", void 0), t([p()], S.prototype, "_busy", void 0), t([p()], S.prototype, "_expanded", void 0), t([p()], S.prototype, "_dictionaryPath", void 0), S = t([l("backoffice-auto-localizer-modal")], S);
export { S as BackofficeAutoLocalizerModalElement, S as element };

//# sourceMappingURL=localize-modal.element-JrwdmXtA.js.map