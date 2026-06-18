# Security Overview

## Purpose

Rally for Onshape is intended to improve the Onshape browser experience through local UI/UX enhancements.

Examples include:

* Floating toolbar actions
* Touch and pen improvements
* Floating numeric keypad
* Fullscreen interface improvements
* Context-aware quick actions
* Local user settings

## Scope

The extension runs on:

```text
https://cad.onshape.com/*
```

It does not run globally across all websites.

## Permissions

| Permission                  | Why it is needed                                                   |
| --------------------------- | ------------------------------------------------------------------ |
| `storage`                   | Saves local Rally for Onshape settings in the browser.                  |
| `https://cad.onshape.com/*` | Allows the extension to inject its UI only into Onshape CAD pages. |

## Data Flow

```text
User browser
  ↓
Onshape page
  ↓
Rally for Onshape local content script
  ↓
Local UI enhancements and local settings storage
```

No Onshape data is sent from the extension to an external server.

## What the Extension Does Not Do

Rally for Onshape does not:

* Read or export CAD files
* Upload CAD data
* Send document data to external services
* Access cookies directly
* Access authentication tokens
* Use Onshape API keys
* Add analytics or telemetry
* Add crash reporting
* Load remotely hosted extension code
* Track users across websites

## Local Storage

The extension uses browser extension storage for user preferences only.

Examples may include:

* Whether a feature is enabled
* Toolbar configuration
* UI layout preferences
* Floating numpad settings

These settings remain local to the user's browser unless the browser itself syncs extension storage.

## Write Actions

Rally for Onshape is primarily a UI/UX extension.

Some features can trigger existing Onshape UI commands, such as Undo, Redo, Delete, Confirm, Cancel, Fit View, Normal To, Extrude, Fillet, Chamfer, or similar commands.

These actions are equivalent to a user clicking existing Onshape buttons or using keyboard shortcuts. Users remain responsible for any actions they trigger inside Onshape.

## Third-Party Dependencies

The extension uses open-source frontend dependencies. Dependencies should be reviewed through the repository lockfile and package manifest.

Recommended checks:

```bash
npm audit
npm install
npm run build
```

## Enterprise Evaluation

For companies evaluating Rally for Onshape, recommended review steps include:

1. Review `manifest.json`.
2. Confirm the requested permissions.
3. Review source code for network requests.
4. Review dependency list and lockfile.
5. Build locally from source.
6. Compare the generated extension package with the published package where possible.
7. Test in a non-production Onshape environment first.
