import { SettingsDialog } from "./components/dialogs/Settings";
import { FloatingNumpad } from "./components/FloatingNumberPad";
import { PenSidebar } from "./components/PenSidebar";
import { SmartFloatingActions } from "./components/SmartFloatingActions";
import { useExtensionSettings } from "./contexts/ExtensionSettingsContext";
import { useOnshapeBridge } from "./contexts/OnshapeBridgeContext";
import { shouldUseFloatingNumpad } from "./core/settings";

export function App() {
	const { isDocumentLoaded } = useOnshapeBridge();
	const { settings } = useExtensionSettings();

	if (!isDocumentLoaded) {
		return null;
	}

	const renderFloatingNumberPad = shouldUseFloatingNumpad(
		settings.floatingNumpadMode,
	);

	return (
		<>
			<PenSidebar />
			<SettingsDialog />

			{renderFloatingNumberPad && <FloatingNumpad />}
			{settings.smartActionsEnabled && <SmartFloatingActions />}
		</>
	);
}
