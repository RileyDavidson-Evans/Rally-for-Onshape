import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { applyTheme } from "@/core/theme";
import { useExtensionSettings } from "./ExtensionSettingsContext";

type SettingsDialogContextValue = {
	isSettingsOpen: boolean;
	openSettings: () => void;
	closeSettings: () => void;
	setSettingsOpen: (open: boolean) => void;
};

const SettingsDialogContext = createContext<SettingsDialogContextValue | null>(
	null,
);

export function SettingsDialogProvider({ children }: { children: ReactNode }) {
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const { settings, setSetting } = useExtensionSettings();
	const openSettings = useCallback(() => {
		setSettingsOpen(true);
	}, []);

	useEffect(() => {
		if (!settings.hasSeenWelcomeDialog) {
			setTimeout(() => {
				openSettings();
				setSetting("hasSeenWelcomeDialog", true);
			}, 1000);
		}
	}, []);

	useEffect(() => {
		applyTheme(settings.theme);
	}, [settings.theme]);

	const closeSettings = useCallback(() => {
		setSettingsOpen(false);
	}, []);

	const value = useMemo(
		() => ({
			isSettingsOpen,
			openSettings,
			closeSettings,
			setSettingsOpen,
		}),
		[isSettingsOpen, openSettings, closeSettings],
	);

	return (
		<SettingsDialogContext.Provider value={value}>
			{children}
		</SettingsDialogContext.Provider>
	);
}

export function useSettingsDialog() {
	const context = useContext(SettingsDialogContext);

	if (!context) {
		throw new Error(
			"useSettingsDialog must be used inside SettingsDialogProvider",
		);
	}

	return context;
}
