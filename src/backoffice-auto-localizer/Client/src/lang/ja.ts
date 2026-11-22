import type en from "./en.js";
export default {
  autoLocalizerLabels: {
    autoLocalizer: "Auto Localizer",
    types: "タイプ",
    usage: "使用状況",
    usedBy: "使用箇所",
    contentType: "コンテンツタイプ",
    propertyName: "プロパティ名",
    documentTypeName: "ドキュメントタイプ名",
    documentTypeDescription: "ドキュメントタイプの説明",
    hasCompositions: "構成あり",
    usesCompositions: "{0} を使用",
    translatableLabels: "翻訳可能なラベル",
    progress: "{0} / {1}",
    translatableProgress: "{1} 件中 {0} 件が翻訳可能",
    makeLabelsTranslatable: "ラベルを翻訳可能にする",
    shared: "共有",
    existing: "既存",
    translatable: "翻訳可能",
    notTranslatable: "翻訳不可",
    whyNotTranslatable: "翻訳できない理由",
  },
  autoLocalizerActions: {
    localize: "ローカライズ...",
    makeTranslatable: "翻訳可能にする...",
    makeCountTranslatable: (n: number) => `${n} 件のラベルを翻訳可能にする`,
    restoreLabels: "元のラベルに戻す",
    openDictionaryItem: "ディクショナリのアイテムを開く",
    showLabels: "{0} のラベルを表示",
    hideLabels: "{0} のラベルを非表示",
  },
  autoLocalizerMessages: {
    intro:
      "選択した各ラベルは、翻訳セクションの Backoffice の下にディクショナリのアイテムとして作成されます。",
    noLabels: "ここにはラベルがありません。",
    notUsed: "このディクショナリのアイテムを使用しているドキュメントタイプやエレメントタイプはありません。",
    sharedHint: "同じテキストのラベルが他にもあるため、1 つのディクショナリのアイテムを共有します",
    existingHint: "このテキストを持つ既存のディクショナリのアイテムを参照します",
    formattingHint:
      "太字、リンク、改行などの書式はディクショナリのアイテムに保持できないため、この説明はそのまま残ります。翻訳可能にするには、説明から書式を削除してください。",
    restoreHeadline: "元のラベルに戻しますか？",
    restoreContent: "これらのラベルに元のテキストが戻ります。ディクショナリのアイテムは翻訳セクションに残ります。",
  },
  autoLocalizerNotifications: {
    madeTranslatable: (n: number) => `${n} 件のラベルが翻訳可能になりました`,
    created: (created: number, reused: number) =>
      reused
        ? `ディクショナリのアイテムを ${created} 件作成し、${reused} 件を再利用しました。`
        : `ディクショナリのアイテムを ${created} 件作成しました。`,
    restored: (n: number) => `${n} 件のラベルを元に戻しました`,
    reload: "変更を表示するには、バックオフィスを再読み込みしてください。",
  },
} satisfies typeof en;
