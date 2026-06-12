import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OnshapeIcon } from "@/components/shared/OnShapeIcon";
import { RadialContextMenu } from "@/components/shared/RadialContextMenu";
import { FORWARDED_ONSHAPE_EVENTS } from "@/constants/onshapeEvents";
import {
	useOnshapeBridge,
	useOnshapeBridgeSubscription,
} from "@/contexts/OnshapeBridgeContext";
import { executeOnshapeShortcutCommand } from "@/core/utils";
import type { ClassifiedOnshapeSelection } from "@/types/onshape/selection";

type Position = {
	left: number;
	top: number;
};

const SMART_COMMANDS = {
	singleEdge: ["fillet", "chamfer"],
	singleFace: ["extrude", "newSketch", "moveFace", "offsetSurface"],
} as const;

function isFromSmartFloatingActions(event: Event) {
	return event.composedPath().some((target) => {
		return (
			target instanceof HTMLElement &&
			target.classList.contains("os-smart-floating-actions")
		);
	});
}

function getSmartCommandNames(selections: ClassifiedOnshapeSelection[]) {
	if (selections.length !== 1) return [];

	const selection = selections[0];

	if (selection.kind === "edge") return SMART_COMMANDS.singleEdge;
	if (selection.kind === "face") return SMART_COMMANDS.singleFace;

	return [];
}

function commandMatches(toolCommand: string, wantedCommand: string) {
	return toolCommand.toLowerCase().includes(wantedCommand.toLowerCase());
}

function getSelectionSignature(selections: ClassifiedOnshapeSelection[]) {
	return selections
		.map((selection) => {
			const id =
				"id" in selection && typeof selection.id === "string"
					? selection.id
					: JSON.stringify(selection);

			return `${selection.kind}:${id}`;
		})
		.sort()
		.join("|");
}

export function SmartFloatingActions() {
	const { allAvailableTools, toolbarType } = useOnshapeBridge();

	const lastPointerPositionRef = useRef<Position | null>(null);
	const selectionSignatureRef = useRef("");

	const [selections, setSelections] = useState<ClassifiedOnshapeSelection[]>(
		[],
	);
	const [position, setPosition] = useState<Position | null>(null);

	const modeTools = allAvailableTools.find((c) => c.tabType === toolbarType);

	const triggerFetchOfSelections = useMemo(
		() =>
			debounce(() => {
				window.postMessage(
					{
						type: "GET_CURRENT_USER_SELECTIONS",
					},
					window.location.origin,
				);
			}, 200),
		[],
	);

	useEffect(() => {
		const updateLastPointerPosition = (event: PointerEvent | MouseEvent) => {
			if (isFromSmartFloatingActions(event)) return;

			lastPointerPositionRef.current = {
				left: event.clientX,
				top: event.clientY - 50,
			};
		};

		const handlePointerEvent = (event: PointerEvent) => {
			if (isFromSmartFloatingActions(event)) return;

			updateLastPointerPosition(event);

			triggerFetchOfSelections();
			window.setTimeout(triggerFetchOfSelections, 125);
			window.setTimeout(triggerFetchOfSelections, 250);
		};

		const handleMouseEvent = (event: MouseEvent) => {
			if (isFromSmartFloatingActions(event)) return;

			updateLastPointerPosition(event);

			triggerFetchOfSelections();
			window.setTimeout(triggerFetchOfSelections, 125);
		};

		const handleKeyUp = () => {
			triggerFetchOfSelections();
			window.setTimeout(triggerFetchOfSelections, 125);
		};

		window.addEventListener("pointerdown", handlePointerEvent, true);
		window.addEventListener("pointerup", handlePointerEvent, true);
		window.addEventListener("click", handleMouseEvent, true);
		window.addEventListener("mouseup", handleMouseEvent, true);
		window.addEventListener("keyup", handleKeyUp, true);

		return () => {
			window.removeEventListener("pointerdown", handlePointerEvent, true);
			window.removeEventListener("pointerup", handlePointerEvent, true);
			window.removeEventListener("click", handleMouseEvent, true);
			window.removeEventListener("mouseup", handleMouseEvent, true);
			window.removeEventListener("keyup", handleKeyUp, true);

			triggerFetchOfSelections.cancel();
		};
	}, [triggerFetchOfSelections]);

	useOnshapeBridgeSubscription(
		useCallback((event) => {
			if (event.name !== FORWARDED_ONSHAPE_EVENTS.SELECTION_UPDATED) return;

			const nextSelections = Array.isArray(event.data)
				? (event.data as ClassifiedOnshapeSelection[])
				: [];

			const nextSignature = getSelectionSignature(nextSelections);
			const selectionChanged = nextSignature !== selectionSignatureRef.current;

			selectionSignatureRef.current = nextSignature;
			setSelections(nextSelections);

			if (nextSelections.length === 0) {
				setPosition(null);
				return;
			}

			if (!selectionChanged) return;

			setPosition(
				lastPointerPositionRef.current ?? {
					left: window.innerWidth / 2,
					top: window.innerHeight / 2,
				},
			);
		}, []),
	);

	const items = useMemo(() => {
		if (!modeTools) return [];

		const smartCommandNames = getSmartCommandNames(selections);

		return smartCommandNames
			.map((commandName) => {
				const tool = modeTools.commands.find((candidate) =>
					commandMatches(candidate.command, commandName),
				);

				if (!tool) return null;

				return {
					id: tool.id,
					label: tool.command,
					icon: <OnshapeIcon icon={tool.icon as string} />,
					onClick: () => {
						executeOnshapeShortcutCommand(tool);
					},
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null);
	}, [modeTools, selections]);

	if (selections.length === 0 || !position || items.length === 0) return null;

	return (
		<RadialContextMenu
			position={position}
			items={items}
			className="os-smart-floating-actions"
		/>
	);
}
