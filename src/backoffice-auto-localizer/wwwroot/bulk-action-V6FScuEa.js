import { c as e } from "./localize-action-VJW6qG6O.js";
import { UmbEntityBulkActionBase as t } from "@umbraco-cms/backoffice/entity-bulk-action";
// src/collection/bulk-action.ts
var n = class extends t {
	async execute() {
		let t = this.getHostElement();
		t && e(t, this.selection);
	}
};
export { n as LocalizeBulkAction, n as api };

//# sourceMappingURL=bulk-action-V6FScuEa.js.map