import { css, customElement, html, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { UMB_DICTIONARY_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/dictionary";
import { UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/document-type";
import { Localizer, type UsageRow } from "./api/index.js";
import { FIELD_KEYS } from "./labels.js";

/** "Usage" tab on a dictionary item: which content type labels point to it. */
@customElement("backoffice-auto-localizer-usage-view")
export class BackofficeAutoLocalizerUsageViewElement extends UmbLitElement {
  @state() private _rows?: UsageRow[];

  constructor() {
    super();
    this.consumeContext(UMB_DICTIONARY_WORKSPACE_CONTEXT, (context) => {
      this.observe(context?.name, (name) => this.#load(name), "_observeName");
    });
  }

  async #load(key?: string) {
    if (!key) return;
    const { data } = await tryExecute(this, Localizer.usage({ query: { key } }));
    this._rows = data ?? [];
  }

  override render() {
    if (!this._rows) return html`<uui-loader></uui-loader>`;

    return html`
      <uui-box headline=${this.localize.term("autoLocalizerLabels_usedBy")}>
        ${this._rows.length === 0
          ? html`<p>${this.localize.term("autoLocalizerMessages_notUsed")}</p>`
          : html`<uui-table>
              <uui-table-head>
                <uui-table-head-cell>${this.localize.term("autoLocalizerLabels_contentType")}</uui-table-head-cell>
                <uui-table-head-cell>${this.localize.term("general_field")}</uui-table-head-cell>
                <uui-table-head-cell>${this.localize.term("general_alias")}</uui-table-head-cell>
              </uui-table-head>
              ${repeat(
                this._rows,
                (row) => `${row.contentTypeKey}|${row.field}|${row.targetAlias}`,
                (row) => html`
                  <uui-table-row>
                    <uui-table-cell>
                      <a href=${UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN.generateAbsolute({ unique: row.contentTypeKey })}>
                        <umb-icon name=${row.contentTypeIcon ?? "icon-document"}></umb-icon>
                        ${this.localize.string(row.contentTypeName)}
                      </a>
                    </uui-table-cell>
                    <uui-table-cell>${this.localize.term(FIELD_KEYS[row.field])}</uui-table-cell>
                    <uui-table-cell>${row.targetAlias}</uui-table-cell>
                  </uui-table-row>
                `,
              )}
            </uui-table>`}
      </uui-box>
    `;
  }

  static override styles = [
    UmbTextStyles,
    css`
      :host {
        display: block;
        padding: var(--uui-size-layout-1);
      }
      a {
        display: inline-flex;
        align-items: center;
        gap: var(--uui-size-space-2);
      }
    `,
  ];
}

export { BackofficeAutoLocalizerUsageViewElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "backoffice-auto-localizer-usage-view": BackofficeAutoLocalizerUsageViewElement;
  }
}
