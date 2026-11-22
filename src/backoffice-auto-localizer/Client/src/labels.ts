import type { Field } from "./api/index.js";

/** Localization key for each field, reusing Umbraco's own words where they exist. */
export const FIELD_KEYS: Record<Field, string> = {
  TypeName: "autoLocalizerLabels_documentTypeName",
  TypeDescription: "autoLocalizerLabels_documentTypeDescription",
  Name: "autoLocalizerLabels_propertyName",
  Description: "general_description",
  Tab: "settings_tab",
  Group: "general_group",
};
