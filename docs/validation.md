# Validation

Validated locally on 2026-10-15.

- `npm run check`: 11 tests passed; production bundle built successfully.
- Tests cover hourly sorting and time bounds, gaps, zero versus missing data, DST ordering, unsupported hourly forecasts, subscription cleanup and late responses, retry after errors, reused `hass` updates, UV source changes, quick editor switches and all six original layout presets.
- Browser preview checked at 280, 360, 440 and 480 px card widths, in light/dark themes, with German/English labels and metric/imperial units.
- Browser interactions checked: precipitation and UV visibility switches, missing forecast values, connection errors, and restoration of complete data. No warnings or errors observed in the browser console during those checks.
- Reading order keeps current conditions before the five-hour outlook.
- Reduced-motion support stops the canvas animation loop, pauses SVG animations and disables CSS animation. This is implemented but was not verified against an OS-level reduced-motion setting during this run.
- Screenshot examples: [light](preview-light.jpg), [dark at 280 px](preview-dark-narrow.jpg).

All preview data and HA components are simulated. Real Home Assistant editor startup, provider-specific forecast behavior and HACS installation/validation still require testing in the target environment. No GitHub publication or release was performed.
