import { t as e } from "./client.gen-BndEfhoM.js";
import { UMB_AUTH_CONTEXT as t } from "@umbraco-cms/backoffice/auth";
// src/entry-point.ts
var n = (n) => {
	n.consumeContext(t, (t) => {
		if (!t) return;
		let n = t.getOpenApiConfiguration();
		e.setConfig({
			baseUrl: n.base,
			credentials: n.credentials,
			auth: n.token
		});
	});
}, r = () => {};
export { n as onInit, r as onUnload };

//# sourceMappingURL=entry-point-DcRVOs2-.js.map