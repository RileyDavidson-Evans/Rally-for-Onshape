import {
	IconAngle,
	IconBinaryTree2,
	IconBorderRadius,
	IconBox,
	IconChartArrowsVertical,
	IconCircle,
	IconCircleDot,
	IconCut,
	IconDimensions,
	IconFlipHorizontal,
	IconLine,
	IconPencil,
	IconPlane,
	IconPoint,
	IconRectangle,
	IconRotate,
	IconRoute,
	IconScissors,
	IconShovel,
	IconSquareDot,
	IconSquareRounded,
	IconTransform,
	IconTransitionTop,
	IconTriangle,
	IconVector,
	IconVectorBezier2,
} from "@tabler/icons-react";

export const TOOL_ICON_MAP = {
	// Part Studio
	newSketch: IconPencil,
	extrude: IconBox,
	revolve: IconRotate,
	sweep: IconRoute,
	loft: IconTransitionTop,
	fillet: IconBorderRadius,
	chamfer: IconTriangle,
	draft: IconAngle,
	shell: IconShovel,
	hole: IconCircle,
	mirror: IconFlipHorizontal,
	booleanBodies: IconBinaryTree2,
	splitPart: IconCut,
	transform: IconTransform,
	cPlane: IconPlane,

	// Sketch
	LINESEGMENT: IconLine,
	RECTANGLE_TWO_CORNERS: IconRectangle,
	RECTANGLE_CENTER: IconSquareDot,
	CIRCLE_CENTER_RADIUS: IconCircleDot,
	ARC_START_END_RADIUS: IconRotate,
	SPLINE: IconVectorBezier2,
	POINT: IconPoint,
	USE: IconVector,
	TRIM: IconScissors,
	SKETCHMIRROR: IconFlipHorizontal,
	TRANSFORM: IconTransform,
	DIMENSION: IconDimensions,
} as const;

import { IconTool } from "@tabler/icons-react";

export function getToolIcon(command: string) {
	return TOOL_ICON_MAP[command as keyof typeof TOOL_ICON_MAP] ?? IconTool;
}
