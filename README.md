# Home Assistant Weather Card

An independent extension of [Origami Weather by hazymorning](https://github.com/hazymorning/origami_weather), preserving its sleek UI, animated skies and six original layouts.

## Everyday weather at a glance

- Next five hourly forecast timestamps: condition, temperature, precipitation probability and amount.
- Precipitation summary: five-hour total and highest hourly probability. Missing data stays unknown; incomplete totals are not presented as complete.
- Optional **current UV index**, enabled with a switch in the visual editor. Uses the weather entity or an explicitly chosen sensor.
- Three quick editor switches above the original advanced editor. New UI labels support German and English.
- Own element name allows installation alongside the original card.
- Compact overview by default; tap the **hourly forecast** to smoothly reveal or hide precipitation and optional UV without leaving the card. There is no separate details toolbar. Enter/Space works on the same focusable target. The choice stays open during live updates. Set `details_mode: always` to keep details visible. When the hourly overview is disabled or unavailable, enabled details are shown directly.

## Install with HACS

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jancrab&repository=homeassistant-weather-card&category=plugin)

Add `https://github.com/jancrab/homeassistant-weather-card` to HACS custom repositories with type **Dashboard**, then download **Home Assistant Weather Card**. Reload your browser. If HACS has not registered the resource automatically, add `/hacsfiles/homeassistant-weather-card/homeassistant-weather-card.js` as a JavaScript module.

The [latest release](https://github.com/jancrab/homeassistant-weather-card/releases/latest) includes the single-file bundle for manual installation. The repository is a HACS custom repository; it is not part of the default HACS catalog.

## Local installation

Copy `dist/homeassistant-weather-card.js` to `config/www/homeassistant-weather-card.js`. Register `/local/homeassistant-weather-card.js` as a JavaScript module in your dashboard resources, then reload the browser.

```yaml
type: custom:homeassistant-weather-card
weather_entity: weather.home
color_mode: dark # dark palette all day; sun/moon and weather remain live
show_hourly: true
show_precipitation: true
show_uv: false
details_mode: toggle # tap the hourly forecast; use always for permanently visible details
compact: true # wrap horizontal value rows and reduce spacing on tablets
```

To enable an optional UV sensor:

```yaml
show_uv: true
uv_entity: sensor.outdoor_uv_index
```

Omit `uv_entity` to use the weather entity's `uv_index`; no separate sensor is needed when the provider supplies that attribute. Values from missing or unavailable sensors are shown as unavailable. A missing selected sensor does not silently fall back to a different source. The editor explains when the source has no current UV value. See [UV data sources](docs/tablet-setup.md#uv-datenquelle) for setup options.

From v0.1.2, an omitted `color_mode` uses the dark palette during both day and night. Select **Always dark / Immer dunkel** in the editor, or set `color_mode: dark` on an existing card. The actual sun/moon and astronomical night effects still follow the sun entity. `color_mode: sun` restores the original bright-day/dark-night palette; `color_mode: theme` follows Home Assistant. Explicit saved color modes and custom palette variables remain supported.

The selected weather integration must support **hourly forecasts**. Daily forecasts are not substituted. Five hours means five successive hourly timestamps beginning with the provider's next forecast, within the next five hours. Sparse data displays gaps. This is an hourly precipitation forecast, not a minute-by-minute rain radar. Home Assistant's precipitation amount can include snow or other precipitation, so it is labelled **Precipitation / Niederschlag**.

Probabilities remain hourly probabilities; their maximum is not the probability of rain anywhere in the whole five-hour window. Amounts use the weather entity's precipitation unit and are summed only when all five values exist. Current UV is not a forecast or a medical recommendation.

All original advanced layout options remain available. Existing YAML can be reused by changing `type`. The new overview uses content-driven height. Disabling all three overview switches removes the whole section, including its heading and spacing. Without an explicit `card_height`, the card continues to fit its content instead of falling back to 200 px.

Enable **Compact tablet layout** (`compact: true`) in the editor for existing cards: horizontal value rows wrap, text can break, spacing shrinks and normal flow layouts use content height. The starter enables it by default. `compact: false` restores the configured scrolling and height without changing saved button settings. Freely positioned scenes retain their geometry; Home and Arc reserve scene space above the outlook (260 px when no fixed scene height is available). In Sections dashboards, use `grid_options: { columns: 12, rows: auto }` to avoid a dashboard-imposed empty area.

## Development

Requires Node.js 22 or later.

```sh
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:8124/demo/index.html` for a clearly labelled simulated preview. Build after source edits. Tests use mocked HA state, editor components and forecast subscriptions; they do not replace verification in a real Home Assistant dashboard.

The build bundles the editor, Lit and animation assets into one locally hosted JS file, without runtime CDN imports. Commit the lockfile and `dist` with changes.

## HACS and releases

HACS metadata and validation/release workflows are included. [Tablet setup](docs/tablet-setup.md) contains a ready-to-paste configuration and a lighter animation variant.

For a release, update the package and lock version and changelog, run checks, commit the built file, and push a matching `vX.Y.Z` tag to the authorized repository. The workflow checks that version and publishes the JS asset.

## Design reuse

- [Design style guide (German)](docs/design-style.md)
- [Copy-ready adaptation prompt (German)](docs/design-adaptation-prompt.md)
- [Upstream provenance](docs/upstream.md)
- [Original advanced layout reference](docs/upstream-reference.md)
- [Validation results and screenshots](docs/validation.md)

GPL-3.0. Preserve the original license and icon notices when reusing the source.
