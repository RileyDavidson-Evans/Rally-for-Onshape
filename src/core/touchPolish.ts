(() => {
	if (window.__onshapeTouchPolishLoaded) return;
	window.__onshapeTouchPolishLoaded = true;

	let lastTouchTime = 0;

	function touchNavBlocker(e) {
		if (e.pointerType === "touch") {
			lastTouchTime = Date.now();
			return;
		}

		const recentlyTouched = Date.now() - lastTouchTime < 700;

		if (
			recentlyTouched &&
			["mousedown", "mouseup", "click", "dblclick", "contextmenu"].includes(
				e.type,
			)
		) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}

	[
		"pointerdown",
		"pointermove",
		"pointerup",
		"mousedown",
		"mouseup",
		"click",
		"dblclick",
		"contextmenu",
	].forEach((type) => {
		window.addEventListener(type, touchNavBlocker, true);
	});
})();
