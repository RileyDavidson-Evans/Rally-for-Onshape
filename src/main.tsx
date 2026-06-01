import React from "react";
import { createRoot } from "react-dom/client";
import cssText from "@/styles.css?inline";
import { FloatingNumpad } from "./components/FloatingNumberPad";
import { PenSidebar } from "./components/PenSidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { PortalContainerProvider } from "./extensions/PortalContainerContext";

function injectOnshapeBridge(): void {
	if (document.getElementById("os-onshape-page-bridge")) return;

	const script = document.createElement("script");
	script.id = "os-onshape-page-bridge";
	script.src = chrome.runtime.getURL("onshape-page-bridge.js");

	document.documentElement.appendChild(script);
}

injectOnshapeBridge();

if (!document.getElementById("onshape-extension-host")) {
	const host = document.createElement("div");
	host.id = "onshape-extension-host";
	document.documentElement.appendChild(host);

	const shadow = host.attachShadow({ mode: "open" });

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
			<PortalContainerProvider container={portalRoot}>
				<TooltipProvider delayDuration={120} skipDelayDuration={0}>
					<PenSidebar />
					<FloatingNumpad />
				</TooltipProvider>
			</PortalContainerProvider>
		</React.StrictMode>,
	);
}
