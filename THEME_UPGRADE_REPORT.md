# Appearance and mobile upgrade — 2026-10-25

- Implemented persistent white/black modes, cyan/violet/green presets and arbitrary accent colors, with safe validation and cross-tab synchronization.
- Kept foreground text independent of arbitrary custom colors for readable body text. Applied theme tokens across chat, navigation, intro, settings and authentication surfaces.
- Replaced the disabled theme selector with keyboard-accessible radio previews and a labeled native color picker.
- Hardened narrow layouts, long messages/URLs/filenames, flexible settings rows, composer height and short landscape screens. Inputs remain at least 16px to avoid iOS focus zoom; user zoom remains enabled.
- Fixed a preexisting closed mobile drawer shadow leak; closed drawer controls are now hidden from focus/navigation.
- Removed an unused, misspelled external font stylesheet link; system font stack remains in use.

## Verification
Lint, 27 Node tests, 16 UI tests, build, production smoke checks and dependency audit pass (zero vulnerabilities).
Chromium checked at 1440×1000, 390×844, 320×568, 280×653 and 844×390. At each size all five themes, custom accent persistence/reload, settings/chat overflow, long unbroken user/AI text and composer visibility passed. No runtime exceptions. White-mode screenshots inspected.

No physical iPhone/Safari or every possible device was tested. Dynamic viewport sizing and 16px form inputs are implemented, but this is not a claim of universal device testing. Backend behavior is unchanged; live DB/provider configuration remains separate.
