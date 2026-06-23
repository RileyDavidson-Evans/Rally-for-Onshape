import browser from "webextension-polyfill";
import type { OnshapeToolbarMode } from "@/types";

export type FloatingNumpadMode = "auto" | "always" | "off";

export type Theme = "light" | "dark";

export type ToolbarQuickActionsConfig = Record<OnshapeToolbarMode, string[]>;

export type RadialMenuConfig = {
	singleFace: string[];
	singleEdge: string[];
	multipleFaces: string[];
	multipleEdges: string[];
};

export type ToolbarPosition = {
	x: number;
	y: number;
};

export type Migrations = {
	initialToolbarActionsMigrated: boolean;
};

export type OnshapePlusStorageSchema = {
	settingsVersion: number;
	smartActionsEnabled: boolean;
	hasSeenWelcomeDialog: boolean;
	theme: Theme;
	floatingNumpadMode: FloatingNumpadMode;
	radialMenuConfig: RadialMenuConfig;
	toolbarPosition: ToolbarPosition;
	toolbarQuickActions: ToolbarQuickActionsConfig;
	migrations: Migrations;
};

export const DEFAULT_STORAGE_VALUES: OnshapePlusStorageSchema = {
	settingsVersion: 2,

	theme: "dark",

	smartActionsEnabled: true,

	hasSeenWelcomeDialog: false,

	floatingNumpadMode: "auto",

	radialMenuConfig: {
		singleFace: ["extrude", "newSketch", "moveFace", "offsetSurface", "cPlane"],
		singleEdge: ["fillet", "chamfer", "cPlane"],
		multipleFaces: [
			"extrude",
			"loft",
			"booleanBodies",
			"deleteFace",
			"moveFace",
			"offsetSurface",
		],
		multipleEdges: ["fillet", "chamfer", "loft"],
	},

	toolbarPosition: {
		x: 290,
		y: 100,
	},

	// intentionally empty
	// migration will populate from the user's
	// existing Onshape S shortcut configuration
	toolbarQuickActions: {
		Sketch: [
			"DIMENSION",
			"LINESEGMENT",
			"RECTANGLE_TWO_CORNERS",
			"CIRCLE_CENTER_RADIUS",
			"ARC_START_END_RADIUS",
			"TRIM",
			"OFFSET",
			"TOGGLE_CONSTRUCTION",
		],

		"Part Studio": [
			"newSketch",
			"extrude",
			"fillet",
			"hole",
			"linearPattern",
			"mirror",
		],

		Assembly: [],

		Drawing: [
			"drawing-insert-view",
			"drawing-projected-view",
			"drawing-smart-dim",
			"drawing-note",
			"drawing-centermark",
			"drawing-section-view",
		],
	},

	migrations: {
		initialToolbarActionsMigrated: false,
	},
};

export type StorageKey = keyof OnshapePlusStorageSchema;

export async function getStorageItem<K extends StorageKey>(
	key: K,
): Promise<OnshapePlusStorageSchema[K]> {
	const result = await browser.storage.local.get(key);

	return (
		(result[key] as OnshapePlusStorageSchema[K] | undefined) ??
		DEFAULT_STORAGE_VALUES[key]
	);
}

export async function setStorageItem<K extends StorageKey>(
	key: K,
	value: OnshapePlusStorageSchema[K],
): Promise<void> {
	await browser.storage.local.set({
		[key]: value,
	});
}

export async function updateStorageItem<K extends StorageKey>(
	key: K,
	updater: (
		current: OnshapePlusStorageSchema[K],
	) => OnshapePlusStorageSchema[K],
): Promise<void> {
	const current = await getStorageItem(key);

	await setStorageItem(key, updater(current));
}

export async function removeStorageItem<K extends StorageKey>(
	key: K,
): Promise<void> {
	await browser.storage.local.remove(key);
}

export async function hasStorageItem<K extends StorageKey>(
	key: K,
): Promise<boolean> {
	const result = await browser.storage.local.get(key);

	return result[key] !== undefined;
}

export async function clearStorage(): Promise<void> {
	await browser.storage.local.clear();
}

export function watchStorageItem<K extends StorageKey>(
	key: K,
	callback: (
		newValue: OnshapePlusStorageSchema[K],
		oldValue: OnshapePlusStorageSchema[K],
	) => void,
): () => void {
	const listener = (
		changes: Record<string, browser.Storage.StorageChange>,
		areaName: string,
	) => {
		if (areaName !== "local" || !changes[key]) {
			return;
		}

		callback(
			(changes[key].newValue ??
				DEFAULT_STORAGE_VALUES[key]) as OnshapePlusStorageSchema[K],
			(changes[key].oldValue ??
				DEFAULT_STORAGE_VALUES[key]) as OnshapePlusStorageSchema[K],
		);
	};

	browser.storage.onChanged.addListener(listener);

	return () => {
		browser.storage.onChanged.removeListener(listener);
	};
}
