import { useEffect, useRef, useState } from "react";
import {
  fireInputEvents,
  pressKey,
  setNativeValue,
  subscribeToRoute,
} from "../core/utils";

const ACTION_DELAY = 40;
const AUTO_HIDE_DELAY = 600;

const KEYS = [
  ["7", "7"],
  ["8", "8"],
  ["9", "9"],
  ["+", "+"],

  ["4", "4"],
  ["5", "5"],
  ["6", "6"],
  ["−", "-"],

  ["1", "1"],
  ["2", "2"],
  ["3", "3"],
  ["×", "*"],

  ["0", "0"],
  [".", "."],
  ["/", "/"],
  ["⌫", "Backspace"],

  ["Enter", "Enter", "wide"],
];

function isUsefulInput(el) {
  return (
    el &&
    (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
  );
}

function getNumpadPosition(input, numpad) {
  const rect = input.getBoundingClientRect();
  const margin = 12;

  const padWidth = numpad?.offsetWidth || 230;
  const padHeight = numpad?.offsetHeight || 330;

  let left = rect.right + margin;
  let top = rect.top;

  if (left + padWidth > window.innerWidth - margin) {
    left = rect.left - padWidth - margin;
  }

  if (left < margin) {
    left = window.innerWidth - padWidth - margin;
  }

  if (top + padHeight > window.innerHeight - margin) {
    top = window.innerHeight - padHeight - margin;
  }

  if (top < margin) {
    top = margin;
  }

  return { left, top };
}

export function FloatingNumpad() {
  const numpadRef = useRef(null);
  const activeInputRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [isDocumentPage, setIsDocumentPage] = useState(() =>
    window.location.pathname.startsWith("/documents/"),
  );

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  function cancelPendingHide() {
    if (!hideTimerRef.current) return;

    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }

  function hideNumpad() {
    setIsVisible(false);
    activeInputRef.current = null;
    hideTimerRef.current = null;
  }

  function scheduleAutoHide() {
    cancelPendingHide();

    hideTimerRef.current = setTimeout(() => {
      const focused = document.activeElement;
      const activeInput = activeInputRef.current;
      const numpad = numpadRef.current;

      if (
        activeInput &&
        focused !== activeInput &&
        focused !== document.body &&
        focused !== document.documentElement &&
        !numpad?.contains(focused)
      ) {
        hideNumpad();
      }
    }, AUTO_HIDE_DELAY);
  }

  function sendInputKey(key) {
    const el = activeInputRef.current;
    if (!el) return;

    cancelPendingHide();
    el.focus();

    if (key === "Enter") {
      pressKey("Enter", {
        code: "Enter",
        keyCode: 13,
        which: 13,
      });

      setTimeout(() => {
        hideNumpad();
      }, ACTION_DELAY);

      return;
    }

    if (key === "Tab") {
      pressKey("Tab", {
        code: "Tab",
        keyCode: 9,
        which: 9,
      });

      return;
    }

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const oldValue = el.value ?? "";

      let newValue;
      let nextPos;

      if (key === "Backspace") {
        if (start === end && start > 0) {
          newValue = oldValue.slice(0, start - 1) + oldValue.slice(end);
          nextPos = start - 1;
        } else {
          newValue = oldValue.slice(0, start) + oldValue.slice(end);
          nextPos = start;
        }

        setNativeValue(el, newValue);
        el.setSelectionRange?.(nextPos, nextPos);
        fireInputEvents(el, "deleteContentBackward", null);
      } else {
        newValue = oldValue.slice(0, start) + key + oldValue.slice(end);
        nextPos = start + key.length;

        setNativeValue(el, newValue);
        el.setSelectionRange?.(nextPos, nextPos);
        fireInputEvents(el, "insertText", key);
      }

      return;
    }

    if (el.isContentEditable) {
      if (key === "Backspace") {
        document.execCommand("delete");
      } else {
        document.execCommand("insertText", false, key);
      }
    }
  }

  useEffect(() => {
    return subscribeToRoute((route) => {
      setIsDocumentPage(route.isDocumentPage);

      if (!route.isDocumentPage) {
        hideNumpad();
      }
    });
  }, []);

  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      const numpad = numpadRef.current;

      if (!isUsefulInput(target)) return;
      if (numpad?.contains(target)) return;

      cancelPendingHide();

      activeInputRef.current = target;

      requestAnimationFrame(() => {
        setPosition(getNumpadPosition(target, numpadRef.current));
        setIsVisible(true);
      });
    };

    const handleFocusOut = (e) => {
      const activeInput = activeInputRef.current;
      const numpad = numpadRef.current;

      if (!activeInput) return;

      if (e.relatedTarget && numpad?.contains(e.relatedTarget)) {
        return;
      }

      scheduleAutoHide();
    };

    window.addEventListener("focusin", handleFocusIn, true);
    window.addEventListener("focusout", handleFocusOut, true);

    return () => {
      window.removeEventListener("focusin", handleFocusIn, true);
      window.removeEventListener("focusout", handleFocusOut, true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  if (!isDocumentPage) return null;

  return (
    <div
      ref={numpadRef}
      id="os-floating-numpad"
      className={isVisible ? "is-visible" : ""}
      tabIndex={-1}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelPendingHide();
      }}
    >
      <div className="os-numpad-header">
        <span>NUM</span>
        <button
          className="os-numpad-close"
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();

            cancelPendingHide();

            setTimeout(() => {
              hideNumpad();
            }, ACTION_DELAY);
          }}
        >
          ×
        </button>
      </div>

      <div className="os-numpad-grid">
        {KEYS.map(([label, key, className]) => (
          <button
            key={`${label}-${key}`}
            className={`os-numpad-btn${className ? ` ${className}` : ""}`}
            tabIndex={-1}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();

              cancelPendingHide();

              setTimeout(() => {
                activeInputRef.current?.focus();
                sendInputKey(key);
              }, ACTION_DELAY);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}