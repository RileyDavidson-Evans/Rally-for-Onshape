(function () {
  'use strict';

  if (window.OnshapeTablet) return;

  window.OnshapeTablet = {
    pressKey(key, opts = {}) {
      const eventOptions = {
        key,
        code: opts.code || key,
        keyCode: opts.keyCode || 0,
        which: opts.which || opts.keyCode || 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: !!opts.ctrlKey,
        shiftKey: !!opts.shiftKey,
        altKey: !!opts.altKey,
        metaKey: !!opts.metaKey,
      };

      const target = document.activeElement || document.body;
      target.dispatchEvent(new KeyboardEvent('keydown', eventOptions));

      setTimeout(() => {
        target.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
      }, 35);
    },

    setNativeValue(el, value) {
      const valueSetter = Object.getOwnPropertyDescriptor(el, 'value')?.set;
      const prototypeSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(el),
        'value',
      )?.set;

      if (prototypeSetter && valueSetter !== prototypeSetter) {
        prototypeSetter.call(el, value);
      } else if (valueSetter) {
        valueSetter.call(el, value);
      } else {
        el.value = value;
      }
    },

    fireInputEvents(el, inputType = 'insertText', data = null) {
      el.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType,
          data,
        }),
      );

      el.dispatchEvent(
        new Event('change', {
          bubbles: true,
        }),
      );
    },

    getRoute() {
      const pathname = window.location.pathname;
      const documentMatch = pathname.match(/^\/documents\/([^/]+)/);

      return {
        href: window.location.href,
        pathname,
        isDocumentPage: !!documentMatch,
        documentId: documentMatch?.[1] || null,
      };
    },

    isDocumentPage() {
      return this.getRoute().isDocumentPage;
    },

    onRouteChange(callback) {
      const handler = (event) => callback(event.detail);

      window.addEventListener('onshape-tablet:urlchange', handler);

      return () => {
        window.removeEventListener('onshape-tablet:urlchange', handler);
      };
    },

    runWhenDocumentPage(init, destroy) {
      let isRunning = false;

      const evaluate = (route) => {
        if (route.isDocumentPage && !isRunning) {
          isRunning = true;
          init(route);
          return;
        }

        if (!route.isDocumentPage && isRunning) {
          isRunning = false;
          destroy?.(route);
        }
      };

      evaluate(this.getRoute());

      return this.onRouteChange(evaluate);
    },

    installUrlWatcher() {
      if (window.__onshapeTabletUrlWatcherInstalled) return;
      window.__onshapeTabletUrlWatcherInstalled = true;

      let lastHref = window.location.href;

      const checkUrl = () => {
        const currentHref = window.location.href;

        if (currentHref === lastHref) return;

        lastHref = currentHref;

        window.dispatchEvent(
          new CustomEvent('onshape-tablet:urlchange', {
            detail: this.getRoute(),
          }),
        );
      };

      setInterval(checkUrl, 250);

      window.addEventListener('hashchange', checkUrl);
      window.addEventListener('popstate', checkUrl);
    },

    getFeatureDialog() {
      return document.querySelector('#feature-dialog.feature-dialog');
    },

    getFeatureType() {
      return this.getFeatureDialog()?.getAttribute('feature-type') || null;
    },

    getFeatureState() {
      const dialog = this.getFeatureDialog();

      return {
        dialog,
        isFeatureOpen: !!dialog,
        featureType: dialog?.getAttribute('feature-type') || null,
      };
    },

    onFeatureChange(callback) {
      const handler = (event) => callback(event.detail);

      window.addEventListener('onshape-tablet:featurechange', handler);

      return () => {
        window.removeEventListener('onshape-tablet:featurechange', handler);
      };
    },

    installFeatureWatcher() {
      if (window.__onshapeTabletFeatureWatcherInstalled) return;
      window.__onshapeTabletFeatureWatcherInstalled = true;

      let lastFeatureType = undefined;
      let lastIsFeatureOpen = undefined;
      let debounceTimer = null;

      const emitIfChanged = () => {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          const state = this.getFeatureState();

          if (
            state.featureType === lastFeatureType &&
            state.isFeatureOpen === lastIsFeatureOpen
          ) {
            return;
          }

          lastFeatureType = state.featureType;
          lastIsFeatureOpen = state.isFeatureOpen;

          window.dispatchEvent(
            new CustomEvent('onshape-tablet:featurechange', {
              detail: state,
            }),
          );
        }, 50);
      };

      const observer = new MutationObserver(emitIfChanged);

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['feature-type', 'class', 'style'],
      });

      emitIfChanged();
    },

    icon(name) {
      const icons = {
        check: `
<svg viewBox="0 0 24 24">
  <path d="M20 6 9 17l-5-5"></path>
</svg>
`,
        listCollapse: `
<svg viewBox="0 0 24 24">
  <path d="M3 6h13"></path>
  <path d="M3 12h9"></path>
  <path d="M3 18h13"></path>
  <path d="m16 15 3 3 3-3"></path>
</svg>
`,
        panelLeft: `
<svg viewBox="0 0 24 24">
  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
  <path d="M9 3v18"></path>
</svg>
`,
        home: `<svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7"/><path d="M9 22V12h6v10"/><path d="M5 10v12h14V10"/></svg>`,
        fullscreen: `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`,
        space: `<svg viewBox="0 0 24 24"><path d="M4 17h16"/><path d="M6 17v-4"/><path d="M18 17v-4"/></svg>`,
        esc: `<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
        enter: `<svg viewBox="0 0 24 24"><path d="M9 18 3 12l6-6"/><path d="M3 12h12a4 4 0 0 0 4-4V6"/></svg>`,
        search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
        normal: `<svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="m6 9 6-6 6 6"/><path d="M5 21h14"/></svg>`,
        undo: `<svg viewBox="0 0 24 24"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>`,
        redo: `<svg viewBox="0 0 24 24"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></svg>`,
        keyboard: `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="M6 8h.01"/>
    <path d="M10 8h.01"/>
    <path d="M14 8h.01"/>
    <path d="M18 8h.01"/>
    <path d="M8 12h.01"/>
    <path d="M12 12h.01"/>
    <path d="M16 12h.01"/>
    <path d="M7 16h10"/>
</svg>
`,
        delete: `<svg viewBox="0 0 24 24"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
      };

      return icons[name] || '';
    },
  };
  window.OnshapeTablet.installUrlWatcher();
  window.OnshapeTablet.installFeatureWatcher();
})();
