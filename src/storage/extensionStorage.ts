import browser from "webextension-polyfill";

export type FloatingNumpadMode = "auto" | "always" | "off";

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

export type OnshapePlusStorageSchema = {
	smartActionsEnabled: boolean;
	hasSeenWelcomeDialog: boolean;
	floatingNumpadMode: FloatingNumpadMode;
	radialMenuConfig: RadialMenuConfig;
	toolbarPosition: ToolbarPosition;
};

export const DEFAULT_STORAGE_VALUES: OnshapePlusStorageSchema = {
	smartActionsEnabled: true,
	hasSeenWelcomeDialog: false,
	floatingNumpadMode: "auto",
	radialMenuConfig: {
		singleFace: ["extrude", "newSketch", "moveFace"],
		singleEdge: ["fillet", "chamfer", "measure"],
		multipleFaces: ["extrude", "loft", "boolean"],
		multipleEdges: ["fillet", "chamfer", "measure"],
	},
	toolbarPosition: {
		x: 290,
		y: 100,
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
