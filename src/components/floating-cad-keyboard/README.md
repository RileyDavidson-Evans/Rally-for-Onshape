# Floating CAD Keyboard split

Drop this folder wherever your existing `FloatingNumpad` component lives, then import it from `./floating-cad-keyboard` or directly from `./floating-cad-keyboard/FloatingNumpad`.

## Files

- `FloatingNumpad.tsx` — main shell/card layout.
- `useFloatingCadKeyboard.ts` — focus tracking, positioning, input mutation, keyboard dispatching, and hide behavior.
- `CadKeyboardHeader.tsx` — title, settings button, close button.
- `CadKeyboardTabs.tsx` — Numbers/Text/Symbols tab content.
- `CadKeyboardKey.tsx` — reusable key button.
- `CommandKeyRow.tsx` — bottom command row.
- `keyboardConstants.ts` — number/unit/function/symbol/command key definitions.
- `keyboardTypes.ts` — shared types and timing constants.
- `keyboardUtils.ts` — editable target checks, positioning, key class names.
- `index.ts` — barrel export.

The imports still assume your current aliases exist:

```ts
@/components/ui/button
@/components/ui/card
@/components/ui/separator
@/components/ui/tabs
@/contexts/SettingsDialogContext
@/core/utils
```
