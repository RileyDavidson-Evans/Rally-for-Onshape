import type { Theme } from "@/storage/extensionStorage";

export const applyTheme = (t: Theme) => {
	const extensionHost = document.getElementById("onshape-extension-host");

	extensionHost?.setAttribute("rally-for-onshape-theme", t);
	document.body.setAttribute("rally-for-onshape-theme", t);
	document.body.setAttribute("data-os-theme", t);
	document.body.setAttribute("data-bs-theme", t);
	document.documentElement.setAttribute("data-os-theme", t);

  const extensionRoot = extensionHost?.shadowRoot?.getElementById(
		"onshape-extension-root",
	);
	const extensionPortal = extensionHost?.shadowRoot?.getElementById(
		"onshape-extension-portal-root",
	);
	if (t === "dark") {
		extensionPortal?.classList.add("dark");
		extensionRoot?.classList.add("dark");
	} else {
		extensionPortal?.classList.remove("dark");
		extensionRoot?.classList.remove("dark");
	}
};
