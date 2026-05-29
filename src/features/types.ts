export type ToolTone = "default" | "primary" | "success" | "danger";

export type IconName =
	| "check"
	| "circle"
	| "delete"
	| "dimension"
	| "esc"
	| "fullscreen"
	| "home"
	| "keyboard"
	| "line"
	| "normal"
	| "offset"
	| "panelLeft"
	| "rectangle"
	| "redo"
	| "search"
	| "space"
	| "trim"
	| "undo";

export type ToolDefinition = {
	id: string;
	iconName: IconName;
	title: string;
	action: string;
	tone?: ToolTone;
};

export type FeatureDefinition = {
	label: string;
	tools: ToolDefinition[];
};
