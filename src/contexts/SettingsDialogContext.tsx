import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

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

	const openSettings = useCallback(() => {
		setSettingsOpen(true);
	}, []);

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
