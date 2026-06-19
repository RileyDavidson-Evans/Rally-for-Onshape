import type { Theme } from "@/storage/extensionStorage";

export const applyTheme = (t: Theme) => {
	const extensionHost = document.getElementById("onshape-extension-host");

	extensionHost?.setAttribute("rally-for-onshape-theme", t);
	document.body.setAttribute("rally-for-onshape-theme", t);
	document.body.setAttribute("data-os-theme", t);
	document.documentElement.setAttribute("data-os-theme", t);
};
