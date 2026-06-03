# Onshape Tablet UI

[Chrome Extension](https://chromewebstore.google.com/detail/onshape-tablet-ui/hanbmgaepnkkmmgafdpfocnjhfccckoh)

A browser extension that adds tablet and pen-friendly UI enhancements for Onshape.

It injects a custom React-based sidebar and floating numeric keypad into the Onshape workspace, making pen users more efficient with quick access to toolbar actions and numeric entry.

## Features

- Floating pen sidebar with quick-access Onshape toolbar commands
- Dynamic toolbar buttons driven by Onshape shortcut configuration
- Draggable sidebar with persistent position using local storage
- Floating numeric keypad for precise numeric input inside Onshape
- Dark theme integration and icon sprite injection for a native feel

## Technology

- React + TypeScript
- Vite
- Tailwind CSS
- Chrome Manifest V3 extension
- Uses Onshape page bridge script injection and shadow DOM for safe UI overlay

## Project structure

- `public/`
  - `manifest.json` — browser extension manifest
  - `background.js` — extension service worker
  - `onshape-page-bridge.js` — page bridge script injected into Onshape
- `src/`
  - `main.tsx` — extension entry point and DOM injection logic
  - `components/` — UI components including `PenSidebar` and `FloatingNumberPad`
  - `core/`, `services/`, `hooks/` — shared helpers and extension logic
  - `styles/` — extension and theme CSS

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run Build:
   ```bash
   npm run build
   ```
4. Load the extension into Chrome/Edge:
   - Open `chrome://extensions`
   - Enable `Developer mode`
   - Click `Load unpacked`
   - Select the project folder or the built `dist` folder if using a production build

## Notes

- The extension targets Onshape pages at `https://cad.onshape.com/*`.
- Shortcut and toolbar items are loaded from your Onshape account settings.
- The sidebar is hidden until Onshape finishes loading its UI elements.

## License

This project is available under the terms of the repository license.
