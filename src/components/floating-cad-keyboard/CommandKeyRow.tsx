import { COMMAND_KEYS } from "./keyboardConstants";
import type { CadKey } from "./keyboardTypes";
import { CadKeyboardKey } from "./CadKeyboardKey";

type CommandKeyRowProps = {
	onBeforeKeyPress: () => void;
	onKeyPress: (key: CadKey) => void;
};

export function CommandKeyRow({ onBeforeKeyPress, onKeyPress }: CommandKeyRowProps) {
	return (
		<div className="grid grid-cols-5 gap-1.5">
			{COMMAND_KEYS.map((key) => (
				<CadKeyboardKey
					key={`${key.label}-${key.value ?? key.key}`}
					keyConfig={key}
					onBeforePress={onBeforeKeyPress}
					onPress={onKeyPress}
				/>
			))}
		</div>
	);
}
