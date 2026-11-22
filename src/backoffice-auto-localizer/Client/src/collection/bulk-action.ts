import { UmbEntityBulkActionBase } from "@umbraco-cms/backoffice/entity-bulk-action";
import { openLocalize } from "../localize-action.js";

/** "Make translatable…" in the selection bar: the sidebar for every selected type. */
export class LocalizeBulkAction extends UmbEntityBulkActionBase<never> {
  override async execute() {
    const host = this.getHostElement();
    if (host) openLocalize(host, this.selection);
  }
}

export { LocalizeBulkAction as api };
