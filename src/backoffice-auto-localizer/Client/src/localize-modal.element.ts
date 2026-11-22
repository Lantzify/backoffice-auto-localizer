import { css, customElement, html, nothing, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement, umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { UMB_ACTION_EVENT_CONTEXT } from "@umbraco-cms/backoffice/action";
import { UmbEntityUpdatedEvent, UmbRequestReloadStructureForEntityEvent } from "@umbraco-cms/backoffice/entity-action";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE } from "@umbraco-cms/backoffice/document-type";
import { UMB_DICTIONARY_ENTITY_TYPE, UMB_EDIT_DICTIONARY_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/dictionary";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_MODAL } from "@umbraco-cms/backoffice/workspace";
import { Localizer, type PlanRow, type RowRef } from "./api/index.js";
import type { LocalizeModalData, LocalizeModalValue } from "./localize-action.js";

const rowId = (r: RowRef) => `${r.ownerKey}|${r.field}|${r.targetAlias}`;

/** The labels on one or more types, to select and make translatable (or restore). */
@customElement("backoffice-auto-localizer-modal")
export class BackofficeAutoLocalizerModalElement extends UmbModalBaseElement<LocalizeModalData, LocalizeModalValue> {
  @state() private _rows?: PlanRow[];
  @state() private _checked = new Set<string>();
  @state() private _busy = false;
  @state() private _expanded = new Set<string>();
  @state() private _dictionaryPath?: string;

  constructor() {
    super();
    // Umbraco's own dictionary editor, opened on top of this sidebar (infinite editing).
    new UmbModalRouteRegistrationController(this, UMB_WORKSPACE_MODAL)
      .addAdditionalPath(UMB_DICTIONARY_ENTITY_TYPE)
      .onSetup(() => ({ data: { entityType: UMB_DICTIONARY_ENTITY_TYPE, preset: {} } }))
      .observeRouteBuilder((routeBuilder) => (this._dictionaryPath = routeBuilder({})));
  }

  override firstUpdated() {
    this.#load();
  }

  get #typeKeys() {
    return this.data?.uniques ?? null;
  }

  async #load() {
    const { data } = await tryExecute(this, Localizer.plan({ body: { typeKeys: this.#typeKeys } }));
    if (!data) return;
    this._rows = data;
    const open = data.filter((r) => r.action !== "Skip");
    this._checked = new Set(open.map(rowId));
    // Several types would mean a lot of scrolling, so only the one type asked for starts open.
    const owners = [...new Set(data.map((r) => r.ownerKey))];
    const asked = this.#typeKeys;
    this._expanded = new Set(owners.length === 1 ? owners : asked?.length === 1 ? asked : []);
  }

  #toggleExpanded(ownerKey: string) {
    const expanded = new Set(this._expanded);
    if (!expanded.delete(ownerKey)) expanded.add(ownerKey);
    this._expanded = expanded;
  }

  async #convert() {
    const rows = this._rows!.filter((r) => this._checked.has(rowId(r)));
    this._busy = true;
    const { data } = await tryExecute(
      this,
      Localizer.apply({
        body: {
          typeKeys: this.#typeKeys,
          rows: rows.map(({ ownerKey, field, targetAlias }) => ({ ownerKey, field, targetAlias })),
        },
      }),
    );
    this._busy = false;
    if (!data) return;

    await this.#done(
      this.localize.term("autoLocalizerNotifications_madeTranslatable", rows.length),
      `${this.localize.term("autoLocalizerNotifications_created", data.created, data.reused)} ${this.localize.term("autoLocalizerNotifications_reload")}`,
    );
  }

  async #revert() {
    const ok = await umbConfirmModal(this, {
      headline: this.localize.term("autoLocalizerMessages_restoreHeadline"),
      content: this.localize.term("autoLocalizerMessages_restoreContent"),
      confirmLabel: this.localize.term("general_restore"),
      color: "danger",
    }).then(() => true, () => false);
    if (!ok) return;

    this._busy = true;
    const { data } = await tryExecute(this, Localizer.revert({ body: { typeKeys: this.#typeKeys } }));
    this._busy = false;
    if (!data) return;

    await this.#done(
      this.localize.term("autoLocalizerNotifications_restored", data.restored),
      this.localize.term("autoLocalizerNotifications_reload"),
    );
  }

  async #done(headline: string, message: string) {
    (await this.getContext(UMB_NOTIFICATION_CONTEXT))?.peek("positive", { data: { headline, message } });
    // An open document type editor reloads on the first, so saving it can't put the old labels back.
    // The Auto Localizer collection and the tree reload on the second.
    const events = await this.getContext(UMB_ACTION_EVENT_CONTEXT);
    for (const unique of this.#typeKeys ?? []) {
      const args = { unique, entityType: UMB_DOCUMENT_TYPE_ENTITY_TYPE };
      events?.dispatchEvent(new UmbEntityUpdatedEvent(args));
      events?.dispatchEvent(new UmbRequestReloadStructureForEntityEvent(args));
    }
    this.updateValue({ changed: true });
    this._submitModal();
  }

  #setChecked(rows: PlanRow[], e: Event) {
    const on = (e.target as HTMLInputElement).checked;
    const checked = new Set(this._checked);
    for (const row of rows) on ? checked.add(rowId(row)) : checked.delete(rowId(row));
    this._checked = checked;
  }

  override render() {
    const rows = this._rows ?? [];
    const open = rows.filter((r) => r.action !== "Skip");
    const converted = rows.filter((r) => r.reason === "converted").length;
    const n = this._checked.size;

    return html`
      <umb-body-layout headline=${this.localize.term("autoLocalizerLabels_makeLabelsTranslatable")}>
        ${this._rows ? this.#renderBody() : html`<uui-loader></uui-loader>`}
        <uui-button slot="actions" label=${this.localize.term("general_close")} @click=${() => this._rejectModal()}></uui-button>
        ${converted
          ? html`<uui-button
              slot="actions"
              look="secondary"
              label=${this.localize.term("autoLocalizerActions_restoreLabels")}
              ?disabled=${this._busy}
              @click=${this.#revert}></uui-button>`
          : nothing}
        ${open.length
          ? html`<uui-button
              slot="actions"
              look="primary"
              color="positive"
              label=${this.localize.term("autoLocalizerActions_makeCountTranslatable", n)}
              ?disabled=${!n || this._busy}
              .state=${this._busy ? "waiting" : undefined}
              @click=${this.#convert}></uui-button>`
          : nothing}
      </umb-body-layout>
    `;
  }

  #renderBody() {
    const groups = new Map<string, PlanRow[]>();
    for (const row of this._rows!) groups.set(row.ownerKey, [...(groups.get(row.ownerKey) ?? []), row]);

    return html`
      <p class="intro">${this.localize.term("autoLocalizerMessages_intro")}</p>
      ${groups.size ? nothing : html`<p class="note">${this.localize.term("autoLocalizerMessages_noLabels")}</p>`}
      ${repeat(groups.values(), (group) => group[0].ownerKey, (group) => this.#renderGroup(group))}
    `;
  }

  // Already translatable and formatted rows are listed too, so it's clear which ones they are, but can't be selected.
  #renderGroup(rows: PlanRow[]) {
    const owner = rows[0];
    const open = rows.filter((r) => r.action !== "Skip");
    const on = open.filter((r) => this._checked.has(rowId(r))).length;
    const done = rows.filter((r) => r.reason === "converted").length;
    // Every label counts, so labels that can't be translated show up as the gap.
    const total = rows.length;
    const keys = this.#typeKeys;
    // A property's name and description are separate rows; show them as one property.
    const properties = new Map<string, { name?: PlanRow; description?: PlanRow }>();
    for (const row of rows.filter((r) => r.field === "Name" || r.field === "Description")) {
      const entry = properties.get(row.targetAlias) ?? {};
      entry[row.field === "Name" ? "name" : "description"] = row;
      properties.set(row.targetAlias, entry);
    }
    // The name may already be a #key; after a reload the backoffice can translate it.
    const ownerName = this.localize.string(owner.ownerName);
    const expanded = this._expanded.has(owner.ownerKey);

    return html`
      <uui-box class=${expanded ? "" : "collapsed"}>
        <uui-checkbox
          slot="headline"
          label=${ownerName}
          .checked=${open.length ? on === open.length : done > 0}
          .indeterminate=${on > 0 && on < open.length}
          ?disabled=${!open.length}
          @change=${(e: Event) => this.#setChecked(open, e)}>
          <b>${ownerName}</b>
          ${keys && !keys.includes(owner.ownerKey)
            ? html`<span class="hint">${this.localize.term("create_composition")}</span>`
            : nothing}
        </uui-checkbox>
        <uui-button
          slot="header-actions"
          compact
          label=${this.localize.term(expanded ? "autoLocalizerActions_hideLabels" : "autoLocalizerActions_showLabels", ownerName)}
          aria-expanded=${expanded}
          @click=${() => this.#toggleExpanded(owner.ownerKey)}>
          <span class="hint">${this.localize.term("autoLocalizerLabels_translatableProgress", done, total)}</span>
          <uui-symbol-expand ?open=${expanded}></uui-symbol-expand>
        </uui-button>
        ${expanded ? this.#renderLabels(rows, properties) : nothing}
      </uui-box>
    `;
  }

  #renderLabels(rows: PlanRow[], properties: Map<string, { name?: PlanRow; description?: PlanRow }>) {
    const description = this.localize.term("general_description");
    return html`
        ${this.#renderSection(
          this.localize.term("content_documentType"),
          rows.filter((r) => r.field === "TypeName" || r.field === "TypeDescription"),
          (row) => (row.field === "TypeName" ? this.localize.term("general_name") : description),
        )}
        ${properties.size
          ? html`<div class="section">${this.localize.term("general_properties")}</div>
              ${[...properties].map(
                ([alias, { name, description: desc }]) => html`
                  <div class="row">${name ? this.#renderCheck(name) : html`<span class="hint">${alias}</span>`}</div>
                  ${desc ? html`<div class="row sub">${this.#renderCheck(desc, description)}</div>` : nothing}
                `,
              )}`
          : nothing}
        ${this.#renderSection(this.localize.term("settings_tabs"), rows.filter((r) => r.field === "Tab"))}
        ${this.#renderSection(this.localize.term("general_groups"), rows.filter((r) => r.field === "Group"))}
    `;
  }

  #renderSection(title: string, rows: PlanRow[], prefix?: (row: PlanRow) => string) {
    if (!rows.length) return nothing;
    return html`<div class="section">${title}</div>
      ${rows.map((row) => html`<div class="row">${this.#renderCheck(row, prefix?.(row))}</div>`)}`;
  }

  #renderCheck(row: PlanRow, prefix?: string) {
    if (row.action === "Skip") {
      const done = row.reason === "converted";
      // A converted label holds #key, or {#key} for a property description; show the loaded translation.
      const text = done ? this.localize.string(row.text.replace(/\{(#\w+)\}/g, "$1")) : row.text;
      return html`
        <uui-checkbox label=${text} title=${done ? row.text : ""} disabled .checked=${done}>
          ${prefix ? html`<span class="prefix">${prefix}</span>` : nothing}${text}
        </uui-checkbox>
        ${done ? this.#renderDictionaryLink(row) : this.#renderNotTranslatable(row)}
      `;
    }

    return html`
      <uui-checkbox
        label=${row.text}
        title="${row.targetAlias} → ${row.key}"
        .checked=${this._checked.has(rowId(row))}
        @change=${(e: Event) => this.#setChecked([row], e)}>
        ${prefix ? html`<span class="prefix">${prefix}</span>` : nothing}${row.text}
      </uui-checkbox>
      ${row.action === "Reuse"
        ? html`<uui-tag look="secondary" title=${this.localize.term("autoLocalizerMessages_existingHint")}
            >${this.localize.term("autoLocalizerLabels_existing")}</uui-tag
          >`
        : nothing}
      ${row.shared && row.action === "Create"
        ? html`<uui-tag look="secondary" title=${this.localize.term("autoLocalizerMessages_sharedHint")}
            >${this.localize.term("autoLocalizerLabels_shared")}</uui-tag
          >`
        : nothing}
    `;
  }

  // Says why, and what to do about it: on hover over the tag, or on click of the info button.
  #renderNotTranslatable(row: PlanRow) {
    const why = this.localize.term("autoLocalizerMessages_formattingHint");
    const popover = `why-${row.ownerKey}-${row.targetAlias}`;
    return html`
      <uui-tag look="secondary" color="warning" title=${why}>${this.localize.term("autoLocalizerLabels_notTranslatable")}</uui-tag>
      <uui-button compact label=${this.localize.term("autoLocalizerLabels_whyNotTranslatable")} popovertarget=${popover}>
        <uui-icon name="icon-info"></uui-icon>
      </uui-button>
      <uui-popover-container id=${popover} placement="bottom-end">
        <umb-popover-layout><p class="why">${why}</p></umb-popover-layout>
      </uui-popover-container>
    `;
  }

  #renderDictionaryLink(row: PlanRow) {
    // No id means the label points to a key that isn't ours or whose item was deleted.
    if (!row.dictionaryId || this._dictionaryPath === undefined)
      return html`<uui-tag look="secondary" color="positive">${this.localize.term("autoLocalizerLabels_translatable")}</uui-tag>`;
    return html`<uui-button
      class="dictionary-link"
      look="secondary"
      label=${this.localize.term("autoLocalizerActions_openDictionaryItem")}
      title=${row.key ?? ""}
      href=${this._dictionaryPath + UMB_EDIT_DICTIONARY_WORKSPACE_PATH_PATTERN.generateLocal({ unique: row.dictionaryId })}>
      <uui-icon name="icon-book-alt"></uui-icon>
      ${this.localize.term("autoLocalizerActions_openDictionaryItem")}
    </uui-button>`;
  }

  static override styles = [
    UmbTextStyles,
    css`
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
    `,
  ];
}

export { BackofficeAutoLocalizerModalElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "backoffice-auto-localizer-modal": BackofficeAutoLocalizerModalElement;
  }
}
