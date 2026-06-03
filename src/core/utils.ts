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
export function suppressVirtualKeyboard(): void {
	if (navigator.maxTouchPoints === 0) return;

	const patchInput = (
		input: HTMLInputElement | HTMLTextAreaElement
	): void => {
		if (input.dataset.osKeyboardSuppressed) return;

		input.dataset.osKeyboardSuppressed = "true";
		input.setAttribute("inputmode", "none");

		input.addEventListener("focus", () => {
			navigator.virtualKeyboard?.hide?.();
		});
	};

	const patchNode = (node: Node): void => {
		if (!(node instanceof HTMLElement)) return;

		if (
			node instanceof HTMLInputElement ||
			node instanceof HTMLTextAreaElement
		) {
			patchInput(node);
			return;
		}

		node
			.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
				"input, textarea"
			)
			.forEach(patchInput);
	};

	// Patch inputs that already exist.
	document
		.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
			"input, textarea"
		)
		.forEach(patchInput);

	// Patch only newly-added inputs instead of rescanning the full DOM.
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				patchNode(node);
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});

	(window as any).__onshapeVirtualKeyboardCleanup = () => {
		observer.disconnect();
	};
}

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

const ON_SHAPE_ICON_SPRITE_SELECTOR =
	"osc-icons-min.osc-svgmin-container";

export async function waitForOnshapeIconSprite(
	timeoutMs = 5000,
): Promise<HTMLElement | null> {
	const existing = document.querySelector<HTMLElement>(
		ON_SHAPE_ICON_SPRITE_SELECTOR,
	);

	if (existing?.querySelector("svg")) {
		return existing;
	}

	return new Promise((resolve) => {
		const timeout = window.setTimeout(() => {
			observer.disconnect();
			resolve(null);
		}, timeoutMs);

		const observer = new MutationObserver(() => {
			const sprite = document.querySelector<HTMLElement>(
				ON_SHAPE_ICON_SPRITE_SELECTOR,
			);

			if (sprite?.querySelector("svg")) {
				window.clearTimeout(timeout);
				observer.disconnect();
				resolve(sprite);
			}
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
	});
}

export async function copyOnshapeIconSpriteToShadowRoot(
	shadowRoot: ShadowRoot,
) {
	if (shadowRoot.querySelector("[data-onshape-icon-sprite]")) return;

	const source = await waitForOnshapeIconSprite();

	if (!source) {
		console.warn("[OnshapeIcon] Timed out waiting for Onshape icon sprite");
		return;
	}

	const clone = source.cloneNode(true) as HTMLElement;
	clone.setAttribute("data-onshape-icon-sprite", "true");

	clone.style.width = "0";
	clone.style.height = "0";
	clone.style.display = "block";
	clone.style.position = "absolute";
	clone.style.pointerEvents = "none";
	clone.style.overflow = "hidden";

	shadowRoot.prepend(clone);
}

export function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen?.();
	} else {
		document.exitFullscreen?.();
	}
}

export function clickElement(
	selector: string,
	root: ParentNode = document,
): boolean {
	const element = root.querySelector<HTMLElement>(selector);

	if (!element) {
		console.warn(`Element not found: ${selector}`);
		return false;
	}

	element.click();
	return true;
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