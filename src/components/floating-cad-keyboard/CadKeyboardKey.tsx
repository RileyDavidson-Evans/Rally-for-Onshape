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
			className={[cadKeyClassName(keyConfig), className ?? ""].join(" ")}
			variant="ghost"
			tabIndex={-1}
			type="button"
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
