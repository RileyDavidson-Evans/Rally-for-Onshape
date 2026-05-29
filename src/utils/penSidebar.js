(function () {
  'use strict';

  if (window.__onshapePenSidebarRegistered) return;
  window.__onshapePenSidebarRegistered = true;

  const STORAGE_KEY = 'onshapePenSidebarPosition';
  const LABEL_MODE_KEY = 'onshapePenSidebarLabelsAlwaysVisible';

  function ready(fn) {
    if (window.OnshapeTablet) fn();
    else setTimeout(() => ready(fn), 100);
  }

  ready(() => {
    window.OnshapeTablet.runWhenDocumentPage(
      () => initPenSidebar(),
      () => destroyPenSidebar(),
    );
  });

  function initPenSidebar() {
    if (document.querySelector('#os-pen-shortcut-sidebar')) return;

    const { pressKey, icon } = window.OnshapeTablet;

    function makeButton(iconName, title, action) {
      const btn = document.createElement('button');
      btn.className = 'os-pen-btn';
      btn.dataset.tooltip = title;

      btn.innerHTML = `
                ${icon(iconName)}
                <span class="os-pen-btn-label">${title}</span>
            `;

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        setTimeout(() => {
          action?.();
        }, 100);
      });

      return btn;
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }

    function showKeyboard() {
      try {
        navigator.virtualKeyboard?.show?.();
      } catch {}

      try {
        window.location.href = 'ms-inputapp://';
      } catch {}
    }

    function confirmAction() {
      pressKey('Enter', {
        code: 'Enter',
        keyCode: 13,
        which: 13,
      });

      setTimeout(() => {
        const okButton = document.querySelector(
          '.ns-dialog-button-ok.button-ok',
        );

        okButton?.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        );

        okButton?.dispatchEvent(
          new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        );

        okButton?.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        );
      }, 40);
    }

    const sidebar = document.createElement('div');
    sidebar.id = 'os-pen-shortcut-sidebar';

    sidebar.innerHTML = `
            <div class="os-pen-drag-handle">
                <div class="os-pen-dots">••</div>
            </div>
            <div class="os-pen-buttons"></div>
        `;

    function toggleLabels() {
      const isAlwaysVisible = sidebar.classList.toggle(
        'os-labels-always-visible',
      );
      localStorage.setItem(LABEL_MODE_KEY, String(isAlwaysVisible));
    }

    if (localStorage.getItem(LABEL_MODE_KEY) === 'true') {
      sidebar.classList.add('os-labels-always-visible');
    }

    const buttons = sidebar.querySelector('.os-pen-buttons');

    buttons.appendChild(makeButton('panelLeft', 'Toggle Labels', toggleLabels));
    buttons.appendChild(
      makeButton('keyboard', 'Keyboard', () => setTimeout(showKeyboard, 100)),
    );
    buttons.appendChild(
      makeButton('fullscreen', 'Fullscreen', toggleFullscreen),
    );

    buttons.appendChild(
      makeButton('home', 'Home', () => {
        window.location.href = 'https://cad.onshape.com/documents';
      }),
    );

    buttons.appendChild(
      makeButton('space', 'Clear', () => {
        pressKey(' ', {
          code: 'Space',
          keyCode: 32,
          which: 32,
        });
      }),
    );

    buttons.appendChild(
      makeButton('esc', 'Cancel', () => {
        pressKey('Escape', {
          code: 'Escape',
          keyCode: 27,
          which: 27,
        });
      }),
    );

    buttons.appendChild(
      makeButton('check', 'Confirm', () => {
        setTimeout(confirmAction, 100);
      }),
    );

    buttons.appendChild(
      makeButton('search', 'Shortcut Menu', () => {
        pressKey('s', {
          code: 'KeyS',
          keyCode: 83,
          which: 83,
        });
      }),
    );

    buttons.appendChild(
      makeButton('normal', 'Normal To', () => {
        pressKey('n', {
          code: 'KeyN',
          keyCode: 78,
          which: 78,
        });
      }),
    );

    buttons.appendChild(
      makeButton('undo', 'Undo', () => {
        pressKey('z', {
          code: 'KeyZ',
          keyCode: 90,
          which: 90,
          ctrlKey: true,
        });
      }),
    );

    buttons.appendChild(
      makeButton('redo', 'Redo', () => {
        pressKey('y', {
          code: 'KeyY',
          keyCode: 89,
          which: 89,
          ctrlKey: true,
        });
      }),
    );

    buttons.appendChild(
      makeButton('delete', 'Delete', () => {
        pressKey('Delete', {
          code: 'Delete',
          keyCode: 46,
          which: 46,
        });
      }),
    );

    document.body.appendChild(sidebar);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    if (saved) {
      sidebar.style.left = saved.left + 'px';
      sidebar.style.top = saved.top + 'px';
      sidebar.style.transform = 'none';
    } else {
      sidebar.style.left = '12px';
      sidebar.style.top = '50%';
      sidebar.style.transform = 'translateY(-50%)';
    }

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const dragHandle = sidebar.querySelector('.os-pen-drag-handle');

    dragHandle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      dragging = true;
      sidebar.classList.add('is-dragging');

      startX = e.clientX;
      startY = e.clientY;

      const rect = sidebar.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      sidebar.style.transform = 'none';
      sidebar.setPointerCapture(e.pointerId);
    });

    sidebar.addEventListener('pointermove', (e) => {
      if (!dragging) return;

      const nextLeft = startLeft + e.clientX - startX;
      const nextTop = startTop + e.clientY - startY;

      const maxLeft = window.innerWidth - sidebar.offsetWidth - 8;
      const maxTop = window.innerHeight - sidebar.offsetHeight - 8;

      sidebar.style.left = Math.max(8, Math.min(nextLeft, maxLeft)) + 'px';
      sidebar.style.top = Math.max(8, Math.min(nextTop, maxTop)) + 'px';
    });

    sidebar.addEventListener('pointerup', (e) => {
      if (!dragging) return;

      dragging = false;
      sidebar.classList.remove('is-dragging');

      const rect = sidebar.getBoundingClientRect();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          left: Math.round(rect.left),
          top: Math.round(rect.top),
        }),
      );

      try {
        sidebar.releasePointerCapture(e.pointerId);
      } catch {}
    });
  }

  function destroyPenSidebar() {
    document.querySelector('#os-pen-shortcut-sidebar')?.remove();
  }
})();
