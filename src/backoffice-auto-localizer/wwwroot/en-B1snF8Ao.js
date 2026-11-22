// src/lang/en.ts
var e = {
	autoLocalizerLabels: {
		autoLocalizer: "Auto Localizer",
		types: "Types",
		usage: "Usage",
		usedBy: "Used by",
		contentType: "Content type",
		propertyName: "Property name",
		documentTypeName: "Document type name",
		documentTypeDescription: "Document type description",
		hasCompositions: "Has compositions",
		usesCompositions: "Uses {0}",
		translatableLabels: "Translatable labels",
		progress: "{0} of {1}",
		translatableProgress: "{0} of {1} translatable",
		makeLabelsTranslatable: "Make labels translatable",
		shared: "Shared",
		existing: "Existing",
		translatable: "Translatable",
		notTranslatable: "Not translatable",
		whyNotTranslatable: "Why isn't this translatable?"
	},
	autoLocalizerActions: {
		localize: "Localize...",
		makeTranslatable: "Make translatable...",
		makeCountTranslatable: (e) => e === 1 ? "Make 1 label translatable" : `Make ${e} labels translatable`,
		restoreLabels: "Restore original labels",
		openDictionaryItem: "Open dictionary item",
		showLabels: "Show labels on {0}",
		hideLabels: "Hide labels on {0}"
	},
	autoLocalizerMessages: {
		intro: "Each label you select becomes a dictionary item under Backoffice in the Translation section.",
		noLabels: "There are no labels here.",
		notUsed: "No document or element type uses this dictionary item.",
		sharedHint: "Other labels have the same text, so they share one dictionary item",
		existingHint: "Points to a dictionary item that already has this text",
		formattingHint: "Formatting like bold, links or line breaks can't be kept in a dictionary item, so this description stays as it is. Remove the formatting from the description to make it translatable.",
		restoreHeadline: "Restore original labels?",
		restoreContent: "These labels get their text back. The dictionary items stay in the Translation section."
	},
	autoLocalizerNotifications: {
		madeTranslatable: (e) => e === 1 ? "1 label is now translatable" : `${e} labels are now translatable`,
		created: (e, t) => {
			let n = e === 1 ? "1 dictionary item" : `${e} dictionary items`;
			return t ? `Created ${n} and reused ${t}.` : `Created ${n}.`;
		},
		restored: (e) => e === 1 ? "1 label restored" : `${e} labels restored`,
		reload: "Reload the backoffice to see the change."
	}
};
export { e as default };

//# sourceMappingURL=en-B1snF8Ao.js.map