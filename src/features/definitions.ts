import type { FeatureDefinition } from "@/features/types";

export const featureDefinitions: Record<string, FeatureDefinition> = {
	newSketch: {
		label: "Sketch",
		tools: [
			{
				id: "line",
				iconName: "line",
				title: "Line",
				action: "line",
				tone: "primary",
			},
			{
				id: "circle",
				iconName: "circle",
				title: "Circle",
				action: "circle",
			},
			{
				id: "rectangle",
				iconName: "rectangle",
				title: "Rectangle",
				action: "rectangle",
			},
			{
				id: "dimension",
				iconName: "dimension",
				title: "Dimension",
				action: "dimension",
				tone: "primary",
			},
			{
				id: "trim",
				iconName: "trim",
				title: "Trim",
				action: "trim",
			},
			{
				id: "offset",
				iconName: "offset",
				title: "Offset",
				action: "offset",
			},
		],
	},

	extrude: {
		label: "Extrude",
		tools: [],
	},

	fillet: {
		label: "Fillet",
		tools: [],
	},

	chamfer: {
		label: "Chamfer",
		tools: [],
	},
};
