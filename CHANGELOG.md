# Changelog

## 0.1.3

- Match hourly and precipitation panels to Slim's translucent glass surfaces, with the existing border, corner, blur and shadow tokens.
- Preserve the animated weather background and smooth detail disclosure.

## 0.1.2

- Add **Always dark / Immer dunkel** and use it when no color mode is configured, keeping the default daytime card as dark as the night palette.
- Keep astronomical day/night, weather animations, explicit sun/theme modes and custom palette variables independent from the fixed dark palette.
- Preserve explicit color-mode selections through editor cleanup and layout preset changes.

## 0.1.1

- Remove the visible five-hour heading while retaining accessible forecast labels and the details control.
- Remove the implicit 200 px fallback when all outlook features are disabled without a configured height.
- Add a reversible compact tablet mode with wrapped horizontal value rows, smaller gaps and content-driven height.
- Constrain value groups to the card width and reserve space for absolute-only scenes above the outlook.
- Explain missing current UV data in the editor and document weather attributes and OpenUV setup.
- Add regression coverage for all feature combinations, compact-mode restoration and UV availability.

## 0.1.0

- Independent project based on Origami Weather, retaining original layouts and animations.
- Added five-hour forecast, precipitation summary, optional current UV and quick editor toggles.
- Added a touch-friendly overview/details transition, an always-open editor option and tablet setup guidance.
- Added a local runtime bundle, tests, simulated preview, CI/release workflows and reusable design documentation.
