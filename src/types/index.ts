export type OnshapeToolbarMode =
	| "Sketch"
	| "Part Studio"
	| "Assembly"
	| "Drawing";

export const ONSHAPE_TOOLBAR_MODES: OnshapeToolbarMode[] = [
	"Sketch",
	"Part Studio",
	"Assembly",
	"Drawing",
] as const;

export interface OnshapeShortcutCommand {
	id: string;

	tabType: OnshapeToolbarMode;
	tabId: number;

	showLabel?: boolean;

	namespace: string;
	command: string;
	commandDetails?: unknown;

	tooltipKey?: string;
	expandedTooltipKey?: string;

	icon?: string;
	name?: string;

	context?: number;
	nodeType?: number;
	ownerType?: number;

	ownerId?: string;

	display?: boolean;
	disabled?: boolean;
	useDynamicSnippet?: boolean;
	isGeneralTool?: boolean;
	ignoreNamespace?: boolean;
	isFsVersionCompatible?: boolean;
}

export interface OnshapeShortcutMode {
	tabType: OnshapeToolbarMode | string;
	tabId: number;
	commands: OnshapeShortcutCommand[];
}

export interface OnshapeShortcutCommandsResponse {
	tabType: OnshapeToolbarMode;
	commands: OnshapeShortcutCommand[];
}

export type UtilityAction = {
	id: string;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	onClick: () => void;
	className?: string;
};
