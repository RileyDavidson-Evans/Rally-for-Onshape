(function () {
    'use strict';

    if (window.__onshapeFloatingNumpadLoaded) return;
    window.__onshapeFloatingNumpadLoaded = true;

    let activeInput = null;
    let numpad = null;
    let hideTimer = null;

    const ACTION_DELAY = 40;
    const AUTO_HIDE_DELAY = 600;

    function ready(fn) {
        if (window.OnshapeTablet) fn();
        else setTimeout(() => ready(fn), 100);
    }

    ready(() => {
        const { pressKey, setNativeValue, fireInputEvents } = window.OnshapeTablet;

        function hideNumpad() {
            numpad?.classList.remove('is-visible');
            activeInput = null;
            hideTimer = null;
        }

        function cancelPendingHide() {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
        }

        function scheduleAutoHide() {
            cancelPendingHide();

            hideTimer = setTimeout(() => {
                const focused = document.activeElement;

                if (
                    activeInput &&
                    focused !== activeInput &&
                    focused !== document.body &&
                    focused !== document.documentElement &&
                    !numpad.contains(focused)
                ) {
                    hideNumpad();
                }
            }, AUTO_HIDE_DELAY);
        }

        function sendInputKey(key) {
            if (!activeInput) return;

            cancelPendingHide();

            const el = activeInput;
            el.focus();

            if (key === 'Enter') {
                pressKey('Enter', { code: 'Enter', keyCode: 13, which: 13 });

                setTimeout(() => {
                    hideNumpad();
                }, ACTION_DELAY);

                return;
            }

            if (key === 'Tab') {
                pressKey('Tab', { code: 'Tab', keyCode: 9, which: 9 });
                return;
            }

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const start = el.selectionStart ?? el.value.length;
                const end = el.selectionEnd ?? el.value.length;
                const oldValue = el.value ?? '';

                let newValue;
                let nextPos;

                if (key === 'Backspace') {
                    if (start === end && start > 0) {
                        newValue = oldValue.slice(0, start - 1) + oldValue.slice(end);
                        nextPos = start - 1;
                    } else {
                        newValue = oldValue.slice(0, start) + oldValue.slice(end);
                        nextPos = start;
                    }

                    setNativeValue(el, newValue);
                    el.setSelectionRange?.(nextPos, nextPos);
                    fireInputEvents(el, 'deleteContentBackward', null);
                } else {
                    newValue = oldValue.slice(0, start) + key + oldValue.slice(end);
                    nextPos = start + key.length;

                    setNativeValue(el, newValue);
                    el.setSelectionRange?.(nextPos, nextPos);
                    fireInputEvents(el, 'insertText', key);
                }

                return;
            }

            if (el.isContentEditable) {
                if (key === 'Backspace') document.execCommand('delete');
                else document.execCommand('insertText', false, key);
            }
        }

        function createNumpadButton(label, action, className) {
            const btn = document.createElement('button');
            btn.className = 'os-numpad-btn';
            btn.textContent = label;
            btn.tabIndex = -1;
            btn.type = 'button';

            if (className) {
                btn.classList.add(className);
            }

            btn.addEventListener('pointerdown', e => {
                e.preventDefault();
                e.stopPropagation();

                cancelPendingHide();

                setTimeout(() => {
                    activeInput?.focus();
                    action();
                }, ACTION_DELAY);
            });

            return btn;
        }

        numpad = document.createElement('div');
        numpad.id = 'os-floating-numpad';
        numpad.tabIndex = -1;

        numpad.addEventListener('pointerdown', e => {
            e.preventDefault();
            e.stopPropagation();
            cancelPendingHide();
        });

        numpad.innerHTML = `
            <div class="os-numpad-header">
                <span>NUM</span>
                <button class="os-numpad-close" type="button" tabindex="-1">×</button>
            </div>
            <div class="os-numpad-grid"></div>
        `;

        const numpadGrid = numpad.querySelector('.os-numpad-grid');

        [
            ['7', () => sendInputKey('7')],
            ['8', () => sendInputKey('8')],
            ['9', () => sendInputKey('9')],
            ['+', () => sendInputKey('+')],

            ['4', () => sendInputKey('4')],
            ['5', () => sendInputKey('5')],
            ['6', () => sendInputKey('6')],
            ['−', () => sendInputKey('-')],

            ['1', () => sendInputKey('1')],
            ['2', () => sendInputKey('2')],
            ['3', () => sendInputKey('3')],
            ['×', () => sendInputKey('*')],

            ['0', () => sendInputKey('0')],
            ['.', () => sendInputKey('.')],
            ['/', () => sendInputKey('/')],
            ['⌫', () => sendInputKey('Backspace')],

            ['Enter', () => sendInputKey('Enter'), 'wide']
        ].forEach(([label, action, className]) => {
            numpadGrid.appendChild(createNumpadButton(label, action, className));
        });

        document.body.appendChild(numpad);

        numpad.querySelector('.os-numpad-close').addEventListener('pointerdown', e => {
            e.preventDefault();
            e.stopPropagation();

            cancelPendingHide();

            setTimeout(() => {
                hideNumpad();
            }, ACTION_DELAY);
        });

        function isUsefulInput(el) {
            return el && (
                el.tagName === 'INPUT' ||
                el.tagName === 'TEXTAREA' ||
                el.isContentEditable
            );
        }

        function positionNumpadNearInput(input) {
            const rect = input.getBoundingClientRect();
            const margin = 12;

            const padWidth = numpad.offsetWidth || 230;
            const padHeight = numpad.offsetHeight || 330;

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

            numpad.style.left = `${left}px`;
            numpad.style.top = `${top}px`;
        }

        window.addEventListener('focusin', e => {
            if (!isUsefulInput(e.target)) return;
            if (numpad.contains(e.target)) return;

            cancelPendingHide();

            activeInput = e.target;
            positionNumpadNearInput(activeInput);
            numpad.classList.add('is-visible');
        }, true);

        window.addEventListener('focusout', e => {
            if (!activeInput) return;

            if (e.relatedTarget && numpad.contains(e.relatedTarget)) {
                return;
            }

            scheduleAutoHide();
        }, true);
    });
})();