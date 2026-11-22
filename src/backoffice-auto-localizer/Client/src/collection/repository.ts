import { UmbRepositoryBase } from "@umbraco-cms/backoffice/repository";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { UmbLocalizationController } from "@umbraco-cms/backoffice/localization-api";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE } from "@umbraco-cms/backoffice/document-type";
import { Localizer } from "../api/index.js";

export interface TypeItem {
  unique: string;
  entityType: string;
  name: string;
  icon?: string;
  isElement: boolean;
  compositions: string[];
  done: number;
  total: number;
}

/** Every document and element type, with how many of its labels are translatable. */
export class BackofficeAutoLocalizerCollectionRepository extends UmbRepositoryBase {
  #localize = new UmbLocalizationController(this);

  async requestCollection(query: { skip?: number; take?: number; filter?: string }) {
    // ponytail: plans every type on each search; cache the result here if large sites feel slow.
    const { data, error } = await tryExecute(this, Localizer.types());
    if (!data) return { error };

    // A converted type name is a #key; show the translation.
    const name = (text: string) => this.#localize.string(text);
    const search = query.filter?.toLowerCase() ?? "";
    const items: TypeItem[] = data
      .map((t) => ({
        unique: t.key,
        entityType: UMB_DOCUMENT_TYPE_ENTITY_TYPE,
        name: name(t.name),
        icon: t.icon ?? undefined,
        isElement: t.isElement,
        compositions: t.compositions.map(name),
        done: t.translatable,
        total: t.total,
      }))
      .filter((t) => t.name.toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name));

    const skip = query.skip ?? 0;
    return { data: { items: items.slice(skip, skip + (query.take ?? 100)), total: items.length } };
  }
}

export { BackofficeAutoLocalizerCollectionRepository as api };
