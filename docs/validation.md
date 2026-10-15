# Validation

Validated locally on 2026-10-15.

- `npm run check` for v0.1.1: 14 tests passed; production bundle built successfully.
- Patch checks cover all eight combinations of feature toggles, no implicit fixed height after disabling the outlook, explicit height preservation, compact-mode restoration without mutating saved configuration, and missing UV source hints.
- Slim was checked at 280 and 360 px with compact mode: no clipped value text and no horizontal value scroll row. At 360 px with all three outlook flags off, the outlook element was absent and the simulated card measured about 160 px high. The forecast heading is absent; the details button retains a 44 px touch target. Home's free scene ends above the outlook.
- Updated [Slim preview without the heading](preview-slim-v0.1.1.jpg). The older screenshots below document v0.1.0.
- Tests cover hourly sorting and time bounds, gaps, zero versus missing data, DST ordering, unsupported hourly forecasts, subscription cleanup and late responses, retry after errors, reused `hass` updates, UV source changes, quick editor switches and all six original layout presets.
- Browser preview checked at 280, 360, 440 and 480 px card widths, in light/dark themes, with German/English labels and metric/imperial units.
- Browser interactions checked: precipitation and UV visibility switches, missing forecast values, connection errors, and restoration of complete data. No warnings or errors observed in the browser console during those checks.
- Reading order keeps current conditions before the five-hour outlook.
- Overview/details disclosure verified by click, Enter and Space; collapsed details are excluded from focus/accessibility using inert and aria-hidden. Live updates preserve the open state. Always-open mode was also checked in the browser.
- Reduced-motion support stops the canvas animation loop, pauses SVG animations and disables CSS animation. This is implemented but was not verified against an OS-level reduced-motion setting during this run.
- Screenshot examples: [compact overview](preview-overview.jpg), [light details](preview-light.jpg), [dark details at 280 px](preview-dark-narrow.jpg).

All preview data and HA components are simulated. Real Home Assistant editor startup, provider-specific forecast behavior and installation still require testing in the target environment. GitHub workflow results are available under the repository's Actions tab; they are separate from these local checks.
