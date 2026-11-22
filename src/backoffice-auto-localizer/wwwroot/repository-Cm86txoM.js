import { t as e } from "./api-mPl3T_PU.js";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE as t } from "@umbraco-cms/backoffice/document-type";
import { UmbRepositoryBase as n } from "@umbraco-cms/backoffice/repository";
import { tryExecute as r } from "@umbraco-cms/backoffice/resources";
import { UmbLocalizationController as i } from "@umbraco-cms/backoffice/localization-api";
// src/collection/repository.ts
var a = class extends n {
	#e = new i(this);
	async requestCollection(n) {
		let { data: i, error: a } = await r(this, e.types());
		if (!i) return { error: a };
		let o = (e) => this.#e.string(e), s = n.filter?.toLowerCase() ?? "", c = i.map((e) => ({
			unique: e.key,
			entityType: t,
			name: o(e.name),
			icon: e.icon ?? void 0,
			isElement: e.isElement,
			compositions: e.compositions.map(o),
			done: e.translatable,
			total: e.total
		})).filter((e) => e.name.toLowerCase().includes(s)).sort((e, t) => e.name.localeCompare(t.name)), l = n.skip ?? 0;
		return { data: {
			items: c.slice(l, l + (n.take ?? 100)),
			total: c.length
		} };
	}
};
export { a as BackofficeAutoLocalizerCollectionRepository, a as api };

//# sourceMappingURL=repository-Cm86txoM.js.map