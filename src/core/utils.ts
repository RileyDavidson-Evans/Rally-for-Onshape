export function pressKey(key, opts = {}) {
  const isLetter = /^[a-z]$/i.test(key);
  const isDigit = /^[0-9]$/.test(key);
  const upperKey = key.toUpperCase();

  const keyCode =
    opts.keyCode ||
    (isLetter ? upperKey.charCodeAt(0) : isDigit ? key.charCodeAt(0) : 0);

  const eventOptions = {
    key,
    code: opts.code || (isLetter ? `Key${upperKey}` : isDigit ? `Digit${key}` : key),
    keyCode,
    which: opts.which || keyCode,
    bubbles: true,
    cancelable: true,
    ctrlKey: !!opts.ctrlKey,
    shiftKey: !!opts.shiftKey,
    altKey: !!opts.altKey,
    metaKey: !!opts.metaKey,
  };

  const targets = [
    opts.target,
    document.activeElement,
    document.querySelector("canvas"),
    document.body,
    document,
    window,
  ].filter(Boolean);

  targets.forEach((target) => {
    target.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
    target.dispatchEvent(new KeyboardEvent("keypress", eventOptions));

    setTimeout(() => {
      target.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
    }, 35);
  });
}

export function getRoute() {
  const pathname = window.location.pathname;
  const documentMatch = pathname.match(/^\/documents\/([^/]+)/);

  return {
    href: window.location.href,
    pathname,
    isDocumentPage: !!documentMatch,
    documentId: documentMatch?.[1] || null,
  };
}

export function getFeatureState() {
  const dialog = document.querySelector("#feature-dialog.feature-dialog");

  return {
    dialog,
    isFeatureOpen: !!dialog,
    featureType: dialog?.getAttribute("feature-type") || null,
  };
}

export function subscribeToRoute(callback) {
  let lastHref = window.location.href;

  const check = () => {
    if (window.location.href === lastHref) return;

    lastHref = window.location.href;
    callback(getRoute());
  };

  const interval = setInterval(check, 250);

  window.addEventListener("hashchange", check);
  window.addEventListener("popstate", check);

  callback(getRoute());

  return () => {
    clearInterval(interval);
    window.removeEventListener("hashchange", check);
    window.removeEventListener("popstate", check);
  };
}

export function subscribeToFeature(callback) {
  let lastFeatureType;
  let lastIsFeatureOpen;
  let timer;

  const emitIfChanged = () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      const state = getFeatureState();

      if (
        state.featureType === lastFeatureType &&
        state.isFeatureOpen === lastIsFeatureOpen
      ) {
        return;
      }

      lastFeatureType = state.featureType;
      lastIsFeatureOpen = state.isFeatureOpen;

      callback(state);
    }, 50);
  };

  const observer = new MutationObserver(emitIfChanged);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["feature-type", "class", "style"],
  });

  emitIfChanged();

  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}

export function setNativeValue(el, value) {
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

export function fireInputEvents(el, inputType = "insertText", data = null) {
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