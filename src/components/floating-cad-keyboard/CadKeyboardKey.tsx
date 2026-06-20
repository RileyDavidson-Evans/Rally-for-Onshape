import { Button } from "@/components/ui/button";
import { ACTION_DELAY, type CadKey } from "./keyboardTypes";
import { cadKeyClassName } from "./keyboardUtils";

type CadKeyboardKeyProps = {
	keyConfig: CadKey;
	onPress: (key: CadKey) => void;
	onBeforePress: () => void;
	className?: string;
};

export function CadKeyboardKey({
	keyConfig,
	onBeforePress,
	onPress,
	className,
}: CadKeyboardKeyProps) {
	return (
		<Button
			className="rounded-md cursor-pointer transition-all duration-150 active:scale-95 py-5"
			variant="secondary"
			tabIndex={-1}
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onBeforePress();

				window.setTimeout(() => {
					onPress(keyConfig);
				}, ACTION_DELAY);
			}}
		>
			{keyConfig.label}
		</Button>
	);
}
