import { customElement, html, nothing, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT } from "@umbraco-cms/backoffice/collection";
import type { UmbTableColumn, UmbTableConfig, UmbTableElement, UmbTableItem } from "@umbraco-cms/backoffice/components";
import { openLocalize } from "../localize-action.js";
import type { TypeItem } from "./repository.js";

// Cells render inside umb-table's shadow root, so they're styled inline.
const hint = "color: var(--uui-color-text-alt); font-size: var(--uui-type-small-size)";
const track = "width: 120px; height: 6px; border-radius: 3px; background: var(--uui-color-surface-alt); overflow: hidden";

@customElement("backoffice-auto-localizer-table-view")
export class BackofficeAutoLocalizerTableViewElement extends UmbLitElement {
  @state() private _types: TypeItem[] = [];
  @state() private _selection: string[] = [];

  #collection?: typeof UMB_COLLECTION_CONTEXT.TYPE;
  #config: UmbTableConfig = { allowSelection: true };

  constructor() {
    super();
    this.consumeContext(UMB_COLLECTION_CONTEXT, (context) => {
      this.#collection = context;
      this.observe(context?.items, (items) => (this._types = (items ?? []) as TypeItem[]), "_items");
      this.observe(context?.selection.selection, (selection) => (this._selection = (selection ?? []) as string[]), "_selection");
    });
  }

  // Built on render, so the texts follow the backoffice language.
  get #columns(): UmbTableColumn[] {
    return [
      { name: this.localize.term("general_type"), alias: "name" },
      { name: this.localize.term("autoLocalizerLabels_hasCompositions"), alias: "compositions", align: "center" },
      { name: this.localize.term("autoLocalizerLabels_translatableLabels"), alias: "progress" },
    ];
  }

  #item(t: TypeItem): UmbTableItem {
    const compositions = t.compositions.join(", ");
    return {
      id: t.unique,
      icon: t.icon ?? "icon-document",
      data: [
        {
          columnAlias: "name",
          value: html`<uui-button compact style="text-align: left" label=${t.name} @click=${() => this.#open(t.unique)}></uui-button>
            ${t.isElement ? html`<span style=${hint}>${this.localize.term("contentTypeEditor_elementType")}</span>` : nothing}`,
        },
        {
          columnAlias: "compositions",
          value: t.compositions.length
            ? html`<uui-icon
                name="icon-check"
                style="color: var(--uui-color-positive)"
                role="img"
                aria-label=${this.localize.term("autoLocalizerLabels_usesCompositions", compositions)}
                title=${compositions}></uui-icon>`
            : html`<uui-icon name="icon-wrong" style=${hint} role="img" aria-label=${this.localize.term("general_no")}></uui-icon>`,
        },
        {
          columnAlias: "progress",
          value: html`<div style="display: flex; align-items: center; gap: var(--uui-size-space-3); white-space: nowrap">
            <div style=${track}>
              <div style="height: 100%; width: ${(t.done / t.total) * 100}%; background: var(--uui-color-positive)"></div>
            </div>
            ${this.localize.term("autoLocalizerLabels_progress", t.done, t.total)}
          </div>`,
        },
      ],
    };
  }

  // The sidebar asks the collection to reload when it changes something.
  #open(unique: string) {
    openLocalize(this, [unique]);
  }

  #onSelection(e: Event) {
    e.stopPropagation();
    this.#collection?.selection.setSelection((e.target as UmbTableElement).selection);
  }

  override render() {
    return html`<umb-table
      .config=${this.#config}
      .columns=${this.#columns}
      .items=${this._types.map((t) => this.#item(t))}
      .selection=${this._selection}
      @selected=${this.#onSelection}
      @deselected=${this.#onSelection}></umb-table>`;
  }
}

export { BackofficeAutoLocalizerTableViewElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "backoffice-auto-localizer-table-view": BackofficeAutoLocalizerTableViewElement;
  }
}
