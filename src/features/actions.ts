import { pressKey } from "@/core/utils";

export const actions = {
	line: () => pressKey("l"),
	circle: () => pressKey("c"),
	rectangle: () => pressKey("r"),
	dimension: () => pressKey("d"),
	trim: () => pressKey("t"),
	offset: () => pressKey("o"),

	clear: () =>
		pressKey(" ", {
			code: "Space",
			keyCode: 32,
			which: 32,
		}),

	search: () => pressKey("s"),
	normalTo: () => pressKey("n"),

	delete: () =>
		pressKey("Delete", {
			code: "Delete",
			keyCode: 46,
			which: 46,
		}),
};
