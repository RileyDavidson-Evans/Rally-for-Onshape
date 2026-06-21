import { Button } from "@/components/ui/button";
import { ACTION_DELAY, type CadKey } from "./keyboardTypes";
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
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				// onBeforePress();

				onPress(keyConfig);
			}}
			onPointerUp={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			{keyConfig.label}
		</Button>
	);
}
