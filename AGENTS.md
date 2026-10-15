# Home Assistant Weather Card

- Independent extension of hazymorning/origami_weather. Preserve GPL-3.0, upstream attribution and the Lucide icon notices. Keep upstream Git history.
- Preserve the original sleek layouts, animated backgrounds, theme variables and advanced editor. New features should improve everyday readability.
- Use real Home Assistant forecast subscriptions and entity attributes. Missing precipitation or UV values are unavailable, never zero. Do not substitute daily data for hourly forecasts.
- Keep new UI text in English and German, respecting HA locale, time zone and entity units. Use accessible labels, keyboard controls and reduced motion.
- Keep runtime dependencies bundled locally. Run npm run check and commit package-lock.json and dist/homeassistant-weather-card.js with implementation changes.
- Cover forecast timing, subscription cleanup/races, missing data, editor settings and updates when HA reuses its hass object. Clearly distinguish simulated preview tests from real HA verification.
- Preserve unknown configuration fields and user choices when editing. Bootstrap native HA editor components before creating the editor.
- See docs/design-style.md and docs/design-adaptation-prompt.md for the reusable visual language.
- Use repository-local Git name jancrab and preserve the inherited email. Do not rewrite history or publish without task authorization.
