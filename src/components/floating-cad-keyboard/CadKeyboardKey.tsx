import { Button } from "@/components/ui/button";
import type { CadKey } from "./keyboardTypes";
import { cadKeyClassName } from "./keyboardUtils";

type CadKeyboardKeyProps = {
	keyConfig: CadKey;
	onPress: (key: CadKey) => void;
	className?: string;
};

export function CadKeyboardKey({
	keyConfig,
	onPress,
	className,
}: CadKeyboardKeyProps) {
	return (
		<Button
			className={`rounded-md cursor-pointer transition-all duration-150 active:scale-95 py-5 ${cadKeyClassName(keyConfig)}`}
			variant="secondary"
			tabIndex={-1}
			type="button"
			// Prevent browser focus / touch behavior
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();

				// Stronger than stopPropagation for native listeners
				e.nativeEvent.stopImmediatePropagation?.();

				onPress(keyConfig);
			}}
			onPointerUp={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onPointerCancel={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onMouseDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onMouseUp={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onDoubleClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onTouchStart={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onTouchEnd={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onTouchCancel={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onContextMenu={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onAuxClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onFocus={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.currentTarget.blur();
			}}
			onBlur={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onKeyDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			onKeyUp={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation?.();
			}}
			draggable={false}
			aria-hidden={false}
			style={{
				WebkitTouchCallout: "none",
				WebkitUserSelect: "none",
				userSelect: "none",
				touchAction: "none",
			}}
		>
			{keyConfig.label}
		</Button>
	);
}
