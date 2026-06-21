import { useEffect } from "react";
import { SettingsDialog } from "./components/dialogs/Settings";
import { FloatingNumpad } from "./components/floating-cad-keyboard";
import { PenSidebar } from "./components/PenSidebar";
import { SmartFloatingActions } from "./components/SmartFloatingActions";
import { useExtensionSettings } from "./contexts/ExtensionSettingsContext";
import { useOnshapeBridge } from "./contexts/OnshapeBridgeContext";
import { shouldUseFloatingNumpad } from "./core/settings";

export function App() {
	const { isDocumentLoaded } = useOnshapeBridge();
	const { settings } = useExtensionSettings();

	useEffect(() => {
		const patchInput = (input) => {
			input.inputMode = "none";
			input.readOnly = true;
			input.blur();

			input.addEventListener("pointerdown", (e) => {
				e.preventDefault();
				e.stopPropagation();
			});
		};

		// Existing inputs
		document.querySelectorAll("input").forEach(patchInput);

		// New inputs
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (!(node instanceof Element)) continue;

					if (node instanceof HTMLInputElement) {
						patchInput(node);
					}

					node.querySelectorAll("input").forEach(patchInput);
				}
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}, []);

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

			{/* {renderFloatingNumberPad && <FloatingNumpad />} */}
			{settings.smartActionsEnabled && <SmartFloatingActions />}
		</>
	);
}
