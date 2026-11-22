import { t as e } from "./client.gen-BndEfhoM.js";
// src/api/sdk.gen.ts
var t = class {
	static apply(t) {
		return (t?.client ?? e).post({
			security: [{
				scheme: "bearer",
				type: "http"
			}],
			url: "/umbraco/backoffice-auto-localizer/api/v1/apply",
			...t,
			headers: {
				"Content-Type": "application/json",
				...t?.headers
			}
		});
	}
	static plan(t) {
		return (t?.client ?? e).post({
			security: [{
				scheme: "bearer",
				type: "http"
			}],
			url: "/umbraco/backoffice-auto-localizer/api/v1/plan",
			...t,
			headers: {
				"Content-Type": "application/json",
				...t?.headers
			}
		});
	}
	static revert(t) {
		return (t?.client ?? e).post({
			security: [{
				scheme: "bearer",
				type: "http"
			}],
			url: "/umbraco/backoffice-auto-localizer/api/v1/revert",
			...t,
			headers: {
				"Content-Type": "application/json",
				...t?.headers
			}
		});
	}
	static types(t) {
		return (t?.client ?? e).get({
			security: [{
				scheme: "bearer",
				type: "http"
			}],
			url: "/umbraco/backoffice-auto-localizer/api/v1/types",
			...t
		});
	}
	static usage(t) {
		return (t?.client ?? e).get({
			security: [{
				scheme: "bearer",
				type: "http"
			}],
			url: "/umbraco/backoffice-auto-localizer/api/v1/usage",
			...t
		});
	}
};
export { t };

//# sourceMappingURL=api-mPl3T_PU.js.map