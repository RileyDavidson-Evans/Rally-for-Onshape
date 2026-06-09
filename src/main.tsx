import React from "react";
import { createRoot } from "react-dom/client";
import cssText from "@/styles/extension.css?inline";
import onshapeThemeCss from "@/styles/onshape-theme.css?inline";
import { SettingsDialog } from "./components/dialogs/Settings";
import { FloatingNumpad } from "./components/FloatingNumberPad";
import { PenSidebar } from "./components/PenSidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { SettingsDialogProvider } from "./contexts/SettingsDialogContext";
import { copyOnshapeIconSpriteToShadowRoot } from "./core/utils";
import { PortalContainerProvider } from "./extensions/PortalContainerContext";

function injectOnshapeBridge(): void {
	if (document.getElementById("os-onshape-page-bridge")) return;

	const script = document.createElement("script");
	script.id = "os-onshape-page-bridge";
	script.src = chrome.runtime.getURL("onshape-page-bridge.js");

	document.documentElement.appendChild(script);
}

function injectGlobalStyle(id: string, css: string) {
	if (document.getElementById(id)) return;

	const style = document.createElement("style");
	style.id = id;
	style.textContent = css;
	document.documentElement.appendChild(style);
}

injectOnshapeBridge();
injectGlobalStyle("os-onshape-theme", onshapeThemeCss);

document.documentElement.dataset.osTheme = "dark";
document.body.dataset.osTheme = "dark";
document.body.dataset.bsTheme = "dark";

if (!document.getElementById("onshape-extension-host")) {
	const host = document.createElement("div");
	host.id = "onshape-extension-host";
	document.documentElement.appendChild(host);

	const shadow = host.attachShadow({ mode: "open" });
	setTimeout(() => {
		copyOnshapeIconSpriteToShadowRoot(shadow);
	}, 2000);

	const style = document.createElement("style");
	style.textContent = cssText;

	const root = document.createElement("div");
	root.id = "onshape-extension-root";
	root.className = "dark font-sans";

	const portalRoot = document.createElement("div");
	portalRoot.id = "onshape-extension-portal-root";
	portalRoot.className = "dark font-sans";

	shadow.appendChild(style);
	shadow.appendChild(root);
	shadow.appendChild(portalRoot);

	createRoot(root).render(
		<React.StrictMode>
			<SettingsDialogProvider>
				<PortalContainerProvider container={portalRoot}>
					<TooltipProvider
						delayDuration={350}
						skipDelayDuration={0}
						disableHoverableContent
					>
						<PenSidebar />
						<FloatingNumpad />
						<SettingsDialog />
					</TooltipProvider>
				</PortalContainerProvider>
			</SettingsDialogProvider>
		</React.StrictMode>,
	);
}
