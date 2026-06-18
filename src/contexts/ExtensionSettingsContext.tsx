import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { getUserShortcutCommands } from "@/core/userShortcuts";
import {
	DEFAULT_STORAGE_VALUES,
	getStorageItem,
	type OnshapePlusStorageSchema,
	type StorageKey,
	setStorageItem,
	updateStorageItem,
	watchStorageItem,
} from "@/storage/extensionStorage";
import { ONSHAPE_TOOLBAR_MODES, type OnshapeToolbarMode } from "@/types";

type ExtensionSettingsContextValue = {
	settings: OnshapePlusStorageSchema;
	isLoading: boolean;
	setSetting: <K extends StorageKey>(
		key: K,
		value: OnshapePlusStorageSchema[K],
	) => Promise<void>;
	updateSetting: <K extends StorageKey>(
		key: K,
		updater: (
			current: OnshapePlusStorageSchema[K],
		) => OnshapePlusStorageSchema[K],
	) => Promise<void>;
	resetSetting: <K extends StorageKey>(key: K) => Promise<void>;
	resetAllSettings: () => Promise<void>;
};

const ExtensionSettingsContext =
	createContext<ExtensionSettingsContextValue | null>(null);

type ExtensionSettingsProviderProps = {
	children: ReactNode;
};

export function ExtensionSettingsProvider({
	children,
}: ExtensionSettingsProviderProps) {
	const [settings, setSettings] = useState<OnshapePlusStorageSchema>(
		DEFAULT_STORAGE_VALUES,
	);

	const [isLoading, setIsLoading] = useState(true);

	const migrateUserToolbarShortcuts = async (
		settingsConfig: OnshapePlusStorageSchema,
	): Promise<OnshapePlusStorageSchema> => {
		if (settingsConfig.migrations.initialToolbarActionsMigrated) {
			return settingsConfig;
		}

		try {
			const currentUserShortcuts = await getUserShortcutCommands();

			const toolbarQuickActions = {
				...DEFAULT_STORAGE_VALUES.toolbarQuickActions,
				...Object.fromEntries(
					currentUserShortcuts
						.filter((mode) =>
							ONSHAPE_TOOLBAR_MODES.includes(
								mode.tabType as OnshapeToolbarMode,
							),
						)
						.map((mode) => [
							mode.tabType,
							mode.commands.map((command) => command.command),
						]),
				),
			} as OnshapePlusStorageSchema["toolbarQuickActions"];

			const migrations = {
				...settingsConfig.migrations,
				initialToolbarActionsMigrated: true,
			};

			await Promise.all([
				setStorageItem("toolbarQuickActions", toolbarQuickActions),
				setStorageItem("migrations", migrations),
			]);

			return {
				...settingsConfig,
				toolbarQuickActions,
				migrations,
			};
		} catch (error) {
			return settingsConfig;
		}
	};

	useEffect(() => {
		async function loadSettings() {
			const entries = await Promise.all(
				(Object.keys(DEFAULT_STORAGE_VALUES) as StorageKey[]).map(
					async (key) => {
						const value = await getStorageItem(key);

						return [key, value] as const;
					},
				),
			);

			const settingsConfig = Object.fromEntries(
				entries,
			) as OnshapePlusStorageSchema;

			const migratedSettings =
				await migrateUserToolbarShortcuts(settingsConfig);

			setSettings(migratedSettings);
			setIsLoading(false);
		}

		loadSettings();
	}, []);

	useEffect(() => {
		const unsubscribers = (
			Object.keys(DEFAULT_STORAGE_VALUES) as StorageKey[]
		).map((key) =>
			watchStorageItem(key, (newValue) => {
				setSettings((current) => ({
					...current,
					[key]: newValue,
				}));
			}),
		);

		return () => {
			for (const unsubscribe of unsubscribers) {
				unsubscribe();
			}
		};
	}, []);

	const setSetting = useCallback(
		async <K extends StorageKey>(
			key: K,
			value: OnshapePlusStorageSchema[K],
		) => {
			setSettings((current) => ({
				...current,
				[key]: value,
			}));

			await setStorageItem(key, value);
		},
		[],
	);

	const updateSetting = useCallback(
		async <K extends StorageKey>(
			key: K,
			updater: (
				current: OnshapePlusStorageSchema[K],
			) => OnshapePlusStorageSchema[K],
		) => {
			const nextValue = updater(settings[key]);

			setSettings((current) => ({
				...current,
				[key]: nextValue,
			}));

			await updateStorageItem(key, updater);
		},
		[settings],
	);

	const resetSetting = useCallback(async <K extends StorageKey>(key: K) => {
		const defaultValue = DEFAULT_STORAGE_VALUES[key];

		setSettings((current) => ({
			...current,
			[key]: defaultValue,
		}));

		await setStorageItem(key, defaultValue);
	}, []);

	const resetAllSettings = useCallback(async () => {
		setSettings(DEFAULT_STORAGE_VALUES);

		await Promise.all(
			(Object.keys(DEFAULT_STORAGE_VALUES) as StorageKey[]).map((key) =>
				setStorageItem(key, DEFAULT_STORAGE_VALUES[key]),
			),
		);
	}, []);

	const value = useMemo<ExtensionSettingsContextValue>(
		() => ({
			settings,
			isLoading,
			setSetting,
			updateSetting,
			resetSetting,
			resetAllSettings,
		}),
		[
			settings,
			isLoading,
			setSetting,
			updateSetting,
			resetSetting,
			resetAllSettings,
		],
	);

	if (isLoading) return null;

	return (
		<ExtensionSettingsContext.Provider value={value}>
			{children}
		</ExtensionSettingsContext.Provider>
	);
}

export function useExtensionSettings() {
	const context = useContext(ExtensionSettingsContext);

	if (!context) {
		throw new Error(
			"useExtensionSettings must be used within an ExtensionSettingsProvider",
		);
	}

	return context;
}
