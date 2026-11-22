import type en from "./en.js";
export default {
  autoLocalizerLabels: {
    autoLocalizer: "Auto Localizer",
    types: "Typer",
    usage: "Användning",
    usedBy: "Används av",
    contentType: "Innehållstyp",
    propertyName: "Egenskapsnamn",
    documentTypeName: "Dokumenttypens namn",
    documentTypeDescription: "Dokumenttypens beskrivning",
    hasCompositions: "Har kompositioner",
    usesCompositions: "Använder {0}",
    translatableLabels: "Översättningsbara etiketter",
    progress: "{0} av {1}",
    translatableProgress: "{0} av {1} översättningsbara",
    makeLabelsTranslatable: "Gör etiketter översättningsbara",
    shared: "Delad",
    existing: "Befintlig",
    translatable: "Översättningsbar",
    notTranslatable: "Inte översättningsbar",
    whyNotTranslatable: "Varför är den inte översättningsbar?",
  },
  autoLocalizerActions: {
    localize: "Lokalisera...",
    makeTranslatable: "Gör översättningsbar...",
    makeCountTranslatable: (n: number) =>
      n === 1 ? "Gör 1 etikett översättningsbar" : `Gör ${n} etiketter översättningsbara`,
    restoreLabels: "Återställ ursprungliga etiketter",
    openDictionaryItem: "Öppna ordboksobjekt",
    showLabels: "Visa etiketter för {0}",
    hideLabels: "Dölj etiketter för {0}",
  },
  autoLocalizerMessages: {
    intro:
      "Varje etikett du väljer blir ett ordboksobjekt under Backoffice i sektionen Översättning.",
    noLabels: "Det finns inga etiketter här.",
    notUsed: "Ingen dokument- eller elementtyp använder det här ordboksobjektet.",
    sharedHint: "Andra etiketter har samma text, så de delar ett ordboksobjekt",
    existingHint: "Pekar på ett ordboksobjekt som redan har den här texten",
    formattingHint:
      "Formatering som fetstil, länkar eller radbrytningar kan inte behållas i ett ordboksobjekt, så den här beskrivningen lämnas som den är. Ta bort formateringen från beskrivningen för att göra den översättningsbar.",
    restoreHeadline: "Återställa ursprungliga etiketter?",
    restoreContent: "Etiketterna får tillbaka sin text. Ordboksobjekten finns kvar i sektionen Översättning.",
  },
  autoLocalizerNotifications: {
    madeTranslatable: (n: number) =>
      n === 1 ? "1 etikett är nu översättningsbar" : `${n} etiketter är nu översättningsbara`,
    created: (created: number, reused: number) => {
      const items = created === 1 ? "1 ordboksobjekt" : `${created} ordboksobjekt`;
      return reused ? `Skapade ${items} och återanvände ${reused}.` : `Skapade ${items}.`;
    },
    restored: (n: number) => (n === 1 ? "1 etikett återställd" : `${n} etiketter återställda`),
    reload: "Ladda om backoffice för att se ändringen.",
  },
} satisfies typeof en;
