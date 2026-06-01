export type PressKeyOptions = {
	code?: string;
	keyCode?: number;
	which?: number;
	target?: EventTarget | null;
	ctrlKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
};

export type OnshapeRoute = {
	href: string;
	pathname: string;
	isDocumentPage: boolean;
	documentId: string | null;
};

export type FeatureState = {
	dialog: HTMLElement | null;
	isFeatureOpen: boolean;
	featureType: string | null;
};

export type Unsubscribe = () => void;

export function executeOnshapeCommand(
  command: string,
  commandDetails?: unknown,
): boolean {
  window.postMessage(
    {
      type: "OS_EXECUTE_BROADCAST_EVENT",
      name: command,
      args: [commandDetails],
    },
    window.location.origin,
  );

  return true;
}

export type ExecuteOnshapeCommandOptions = {
	namespace: string;
	command: string;
	commandDetails?: unknown;
	ignoreNamespace?: boolean;
};

export function executeOnshapeShortcutCommand(
	tool: ExecuteOnshapeCommandOptions,
): boolean {
  window.postMessage(
		{
			type: "OS_EXECUTE_COMMAND",
			namespace: tool.namespace,
			command: tool.command,
			commandDetails: tool.commandDetails,
		},
		window.location.origin,
	);

	return true;
}

function showKeyboard() {
	try {
		const nav = navigator as Navigator & {
			virtualKeyboard?: { show?: () => void };
		};

		nav.virtualKeyboard?.show?.();
	} catch {}

	try {
		window.location.href = "ms-inputapp://";
	} catch {}
}

function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen?.();
	} else {
		document.exitFullscreen?.();
	}
}

export function pressKey(key: string, opts: PressKeyOptions = {}): void {
	const isLetter = /^[a-z]$/i.test(key);
	const isDigit = /^[0-9]$/.test(key);
	const upperKey = key.toUpperCase();

	const keyCode =
		opts.keyCode ??
		(isLetter ? upperKey.charCodeAt(0) : isDigit ? key.charCodeAt(0) : 0);

	const code =
		opts.code ?? (isLetter ? `Key${upperKey}` : isDigit ? `Digit${key}` : key);

	const eventOptions: KeyboardEventInit = {
		key,
		code,
		keyCode,
		which: opts.which ?? keyCode,
		bubbles: true,
		cancelable: true,
		composed: true,
		ctrlKey: !!opts.ctrlKey,
		shiftKey: !!opts.shiftKey,
		altKey: !!opts.altKey,
		metaKey: !!opts.metaKey,
	};

	const targets: EventTarget[] = [
		opts.target,
		window,
		document,
		document.body,
		document.querySelector("canvas"),
		document.activeElement,
	].filter((target): target is EventTarget => !!target);

	for (const target of targets) {
		target.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
		target.dispatchEvent(new KeyboardEvent("keypress", eventOptions));

		window.setTimeout(() => {
			target.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
		}, 35);
	}
}


export function setNativeValue(
	el: HTMLInputElement | HTMLTextAreaElement,
	value: string,
): void {
	const valueSetter = Object.getOwnPropertyDescriptor(el, "value")?.set;
	const prototypeSetter = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(el),
		"value",
	)?.set;

	if (prototypeSetter && valueSetter !== prototypeSetter) {
		prototypeSetter.call(el, value);
	} else if (valueSetter) {
		valueSetter.call(el, value);
	} else {
		el.value = value;
	}
}

export function fireInputEvents(
	el: HTMLElement,
	inputType: InputEvent["inputType"] = "insertText",
	data: string | null = null,
): void {
	el.dispatchEvent(
		new InputEvent("input", {
			bubbles: true,
			cancelable: true,
			inputType,
			data,
		}),
	);

	el.dispatchEvent(
		new Event("change", {
			bubbles: true,
		}),
	);
}