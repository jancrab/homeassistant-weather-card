import { LitElement, html, css, nothing } from 'lit';
import { nextFiveHours, precipitationSummary, currentUV, HourlyForecastSubscription } from './weather-outlook-model.js';

export const OUTLOOK_LABELS = {
    en: {
        heading: 'The next 5 hours', hourly: 'Hourly forecast', precipitation: 'Precipitation',
        show_hourly: 'Show the next 5 hours', show_precipitation: 'Show precipitation', show_uv: 'Show UV index',
        uv_entity: 'Optional UV sensor', uv_help: 'Uses the weather entity’s UV index unless a sensor is selected.',
        loading: 'Loading hourly forecast…', unsupported: 'This weather entity does not provide hourly forecasts.',
        unavailable: 'Weather entity or connection unavailable.', error: 'Hourly forecast could not be loaded.',
        empty: 'No forecast for the next hour is available.', retry: 'Try again', missing: 'No data',
        chance: 'Probability', amount: 'Amount', total: 'Total over 5 hours', maximum: 'Highest hourly probability',
        partial: 'Some hours have no data', unitMissing: 'Precipitation unit unavailable', uv: 'UV index', current: 'Current',
        source: 'Weather entity', details: 'Weather details', from: 'Precipitation from',
        expand: 'Show details', collapse: 'Hide details', details_short: 'Details', less: 'Less',
        always_details: 'Always show details', native_details: 'Open weather entity',
        sunny: 'Sunny', cloudy: 'Cloudy', partlycloudy: 'Partly cloudy', rainy: 'Rain', pouring: 'Heavy rain',
        snowy: 'Snow', 'snowy-rainy': 'Sleet', 'clear-night': 'Clear night', fog: 'Fog', hail: 'Hail',
        lightning: 'Thunderstorms', 'lightning-rainy': 'Rain and thunderstorms', windy: 'Windy', 'windy-variant': 'Wind and clouds', exceptional: 'Exceptional'
    },
    de: {
        heading: 'Die nächsten 5 Stunden', hourly: 'Stündliche Vorhersage', precipitation: 'Niederschlag',
        show_hourly: 'Die nächsten 5 Stunden anzeigen', show_precipitation: 'Niederschlag anzeigen', show_uv: 'UV-Index anzeigen',
        uv_entity: 'Optionaler UV-Sensor', uv_help: 'Verwendet den UV-Index der Wetterentität, sofern kein Sensor ausgewählt ist.',
        loading: 'Stündliche Vorhersage wird geladen…', unsupported: 'Diese Wetterentität liefert keine stündliche Vorhersage.',
        unavailable: 'Wetterentität oder Verbindung nicht verfügbar.', error: 'Stündliche Vorhersage konnte nicht geladen werden.',
        empty: 'Für die nächste Stunde ist keine Vorhersage verfügbar.', retry: 'Erneut versuchen', missing: 'Keine Daten',
        chance: 'Wahrscheinlichkeit', amount: 'Menge', total: 'Summe über 5 Stunden', maximum: 'Höchste stündliche Wahrscheinlichkeit',
        partial: 'Für einzelne Stunden fehlen Daten', unitMissing: 'Niederschlagseinheit nicht verfügbar', uv: 'UV-Index', current: 'Aktuell',
        source: 'Wetterentität', details: 'Wetterdetails', from: 'Niederschlag ab',
        expand: 'Details anzeigen', collapse: 'Details ausblenden', details_short: 'Details', less: 'Weniger',
        always_details: 'Details immer anzeigen', native_details: 'Wetterentität öffnen',
        sunny: 'Sonnig', cloudy: 'Bewölkt', partlycloudy: 'Teils bewölkt', rainy: 'Regen', pouring: 'Starkregen',
        snowy: 'Schnee', 'snowy-rainy': 'Schneeregen', 'clear-night': 'Klare Nacht', fog: 'Nebel', hail: 'Hagel',
        lightning: 'Gewitter', 'lightning-rainy': 'Regen und Gewitter', windy: 'Windig', 'windy-variant': 'Wind und Wolken', exceptional: 'Außergewöhnlich'
    }
};
export const outlookLabels = hass => OUTLOOK_LABELS[hass?.locale?.language?.startsWith('de') ? 'de' : 'en'];

const weatherIcons = {
    sunny: 'weather-sunny', cloudy: 'weather-cloudy', partlycloudy: 'weather-partly-cloudy', rainy: 'weather-rainy',
    pouring: 'weather-pouring', snowy: 'weather-snowy', 'snowy-rainy': 'weather-snowy-rainy', 'clear-night': 'weather-night',
    fog: 'weather-fog', hail: 'weather-hail', lightning: 'weather-lightning', 'lightning-rainy': 'weather-lightning-rainy',
    windy: 'weather-windy', 'windy-variant': 'weather-windy-variant', exceptional: 'alert-circle-outline'
};

export class WeatherOutlook extends LitElement {
    constructor() {
        super();
        this.config = {};
        this._expanded = false;
        this.forecasts = new HourlyForecastSubscription(() => this.requestUpdate());
        this.addEventListener('click', event => event.stopPropagation());
    }
    connectedCallback() {
        super.connectedCallback();
        this._timer = setInterval(() => this.requestUpdate(), 30_000);
        this._sync();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._timer);
        this.forecasts.stop();
    }
    setData(hass, config) {
        if (config.weather_entity !== this.config.weather_entity || config.details_mode !== this.config.details_mode) this._expanded = false;
        this.hass = hass;
        this.config = config;
        this._sync();
        this.requestUpdate(); // HA may reuse the same hass object.
    }
    _sync() {
        if (!this.isConnected) return;
        this.forecasts.sync(this.hass, this.config.weather_entity,
            this.config.show_hourly !== false || this.config.show_precipitation !== false);
    }
    _moreInfo() {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true, detail: { entityId: this.config.weather_entity }
        }));
    }
    _toggleDetails() {
        this._expanded = !this._expanded;
        this.requestUpdate();
    }
    _time(time) {
        const locale = this.hass?.locale || {};
        return new Intl.DateTimeFormat(locale.language || 'en', {
            hour: 'numeric', minute: '2-digit',
            ...(locale.time_format === '12' ? { hourCycle: 'h12' } : locale.time_format === '24' ? { hourCycle: 'h23' } : {}),
            ...(locale.time_zone === 'server' && this.hass?.config?.time_zone ? { timeZone: this.hass.config.time_zone } : {})
        }).format(time);
    }
    _number(value, digits = 1) {
        if (value === null) return '—';
        const locale = this.hass?.locale || {};
        const formats = { comma_decimal: 'en-US', decimal_comma: 'de', space_comma: 'fr', quote_decimal: 'de-CH', none: 'en-US' };
        return new Intl.NumberFormat(formats[locale.number_format] || locale.language || 'en', {
            maximumFractionDigits: digits, useGrouping: locale.number_format !== 'none'
        }).format(value);
    }
    render() {
        if (!this.hass) return nothing;
        const c = this.config, t = outlookLabels(this.hass);
        const weather = this.hass.states[c.weather_entity];
        const attributes = weather?.attributes || {};
        const temperatureUnit = attributes.temperature_unit || this.hass.config?.unit_system?.temperature || '';
        const rainUnit = attributes.precipitation_unit || '';
        const hours = nextFiveHours(this.forecasts.forecast);
        const summary = precipitationSummary(hours);
        const wantsForecast = c.show_hourly !== false || c.show_precipitation !== false;
        const status = this.forecasts.status;
        const uv = currentUV(this.hass, c);
        const hasDetails = c.show_precipitation !== false || c.show_uv === true;
        const expanded = c.details_mode === 'always' || this._expanded;
        return html`
            <header>
                <h3>${wantsForecast ? t.heading : t.details}</h3>
                ${hasDetails && c.details_mode !== 'always' ? html`
                    <button class="details-toggle" @click=${this._toggleDetails} aria-expanded=${String(expanded)} aria-controls="outlook-details" aria-label=${expanded ? t.collapse : t.expand}>
                        ${expanded ? t.less : t.details_short}<ha-icon icon="mdi:chevron-down" class=${expanded ? 'rotated' : ''}></ha-icon>
                    </button>` : html`<button class="more-info" @click=${this._moreInfo} aria-label=${t.native_details}><ha-icon icon="mdi:arrow-top-right"></ha-icon></button>`}
            </header>
            ${wantsForecast ? html`
                ${status !== 'ready' || !hours.length ? html`
                    <div class="status" role="status">${t[status] || t.empty}
                        ${status === 'error' || status === 'ready' ? html`<button @click=${() => this.forecasts.retry()}>${t.retry}</button>` : nothing}
                    </div>` : html`
                    ${c.show_hourly !== false ? html`
                        <div class="hours" role="list" aria-label=${t.hourly}>
                            ${hours.map(hour => html`
                                <div class="hour" role="listitem">
                                    <time datetime=${new Date(hour.time).toISOString()}>${this._time(hour.time)}</time>
                                    <ha-icon class="condition" icon=${`mdi:${weatherIcons[hour.condition] || 'help-circle-outline'}`} role="img" aria-label=${t[hour.condition] || t.missing}></ha-icon>
                                    <strong class="temperature">${this._number(hour.temperature, 0)}<span>${hour.temperature !== null ? temperatureUnit : ''}</span></strong>
                                </div>`)}
                        </div>` : nothing}
                `}
            ` : nothing}
            ${hasDetails ? html`<div id="outlook-details" class=${`details-region ${expanded ? 'expanded' : ''}`} role="region" aria-label=${t.details} aria-hidden=${String(!expanded)} ?inert=${!expanded}>
                <div class="details-inner">
                    ${c.show_precipitation !== false && status === 'ready' && hours.length ? html`
                        <section class="rain" aria-label=${t.precipitation}>
                            <div class="rain-title"><ha-icon icon="mdi:weather-rainy"></ha-icon><span>${summary.firstWet ? `${t.from} ${this._time(summary.firstWet.time)}` : t.precipitation}</span></div>
                            <div class="rain-hours" role="list" aria-label=${t.precipitation}>
                                ${hours.map(hour => html`<div class="hour" role="listitem">
                                    <time datetime=${new Date(hour.time).toISOString()}>${this._time(hour.time)}</time>
                                    <span class="probability" title=${t.chance} aria-label=${`${t.chance}: ${hour.probability === null ? t.missing : this._number(hour.probability, 0) + '%'}`}><ha-icon icon="mdi:water-outline"></ha-icon>${hour.probability === null ? '—' : this._number(hour.probability, 0) + '%'}</span>
                                    <span class="amount" title=${rainUnit ? t.amount : t.unitMissing}>${rainUnit && hour.precipitation !== null ? `${this._number(hour.precipitation, 2)} ${rainUnit}` : '—'}</span>
                                </div>`)}
                            </div>
                            <div class="metrics">
                                <div><strong>${summary.total === null || !rainUnit ? '—' : `${this._number(summary.total, 2)} ${rainUnit}`}</strong><span>${t.total}</span></div>
                                <div><strong>${summary.maximumProbability === null ? '—' : `${this._number(summary.maximumProbability, 0)}%`}</strong><span>${t.maximum}</span></div>
                            </div>
                            <div class="rain-track" aria-hidden="true">${hours.map(hour => html`<span style=${`--rain-level:${hour.probability ?? 0}%`} class=${hour.probability === null ? 'unknown' : ''}></span>`)}</div>
                            ${!rainUnit ? html`<p class="note">${t.unitMissing}</p>` : nothing}
                            ${summary.total === null || !summary.completeProbability ? html`<p class="note">${t.partial}</p>` : nothing}
                        </section>` : nothing}
            ${c.show_uv === true ? html`
                <section class="uv" aria-label=${t.uv}>
                    <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
                    <div><span>${t.uv}</span><small>${t.current} · ${c.uv_entity ? (this.hass.states[c.uv_entity]?.attributes?.friendly_name || c.uv_entity) : t.source}</small></div>
                    <strong>${uv === null ? t.missing : this._number(uv)}</strong>
                </section>` : nothing}
                    <button class="more-info entity-link" @click=${this._moreInfo}>${t.native_details}<ha-icon icon="mdi:arrow-top-right"></ha-icon></button>
                </div>
            </div>` : nothing}
        `;
    }
    static styles = css`
        :host { display: block; width: 100%; min-width: 0; box-sizing: border-box; color: var(--origami-text-color, var(--primary-text-color)); font-family: inherit; font-variant-numeric: tabular-nums; pointer-events: auto; --outlook-muted: color-mix(in srgb, currentColor 72%, transparent); --outlook-line: color-mix(in srgb, currentColor 13%, transparent); --outlook-surface: color-mix(in srgb, var(--_scheme-bg, var(--ha-card-background, white)) 78%, transparent); --outlook-rain: var(--weather-card-rain-color, var(--primary-color, #1688b9)); }
        header { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--outlook-line); margin-top: 20px; padding-top: 8px; gap: 8px; }
        h3 { margin: 0; font-size: 13px; font-weight: 600; letter-spacing: .02em; }
        button { min-height: 44px; border: 0; border-radius: 12px; background: transparent; color: inherit; font: inherit; cursor: pointer; padding: 8px 12px; }
        button:hover { background: var(--outlook-line); }
        button:focus-visible { outline: 2px solid var(--primary-color, currentColor); outline-offset: 2px; }
        .more-info { min-width: 44px; padding: 10px; }
        .details-toggle { display: inline-flex; align-items: center; justify-content: center; gap: 4px; flex-shrink: 0; font-size: 12px; padding: 8px; }
        .details-toggle ha-icon { --mdc-icon-size: 16px; transition: transform 240ms ease; }
        .details-toggle .rotated { transform: rotate(180deg); }
        .details-region { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 240ms ease, opacity 180ms ease; }
        .details-region.expanded { grid-template-rows: 1fr; opacity: 1; }
        .details-inner { min-height: 0; overflow: hidden; }
        .entity-link { display: flex; align-items: center; gap: 8px; margin: 8px 0 0; font-size: 11px; color: var(--outlook-muted); }
        ha-icon { --mdc-icon-size: 20px; }
        .hours { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); padding: 14px 0; margin-bottom: 12px; border-radius: 14px; background: color-mix(in srgb, var(--_scheme-bg, var(--ha-card-background, white)) 60%, transparent); }
        .hour { display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 0; padding: 0 2px; }
        .hour + .hour { border-inline-start: 1px solid var(--outlook-line); }
        time { font-size: 11px; color: var(--outlook-muted); white-space: nowrap; }
        .condition { --mdc-icon-size: 24px; }
        .temperature { font-size: clamp(17px, 4.5cqi, 24px); font-weight: 600; letter-spacing: -.04em; white-space: nowrap; }
        .temperature span { font-size: 11px; font-weight: 400; letter-spacing: 0; }
        .probability { display: flex; align-items: center; gap: 1px; font-size: 11px; }
        .probability ha-icon { --mdc-icon-size: 12px; color: var(--outlook-rain); }
        .amount { font-size: 10px; color: var(--outlook-muted); overflow-wrap: anywhere; text-align: center; }
        .rain { background: var(--outlook-surface); padding: 14px 16px; border-radius: 16px; border: 1px solid var(--outlook-line); }
        .rain-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; }
        .rain-title ha-icon { color: var(--outlook-rain); }
        .rain-hours { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); margin: 16px -8px; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
        .metrics div { display: flex; flex-direction: column; gap: 4px; }
        .metrics strong { font-size: 20px; font-weight: 500; }
        .metrics span, .note { font-size: 10px; line-height: 1.4; color: var(--outlook-muted); }
        .rain-track { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 12px; }
        .rain-track span { height: 4px; border-radius: 4px; background: linear-gradient(to right, var(--outlook-rain) var(--rain-level), var(--outlook-line) var(--rain-level)); }
        .rain-track .unknown { background: transparent; border-bottom: 1px dashed var(--outlook-muted); }
        .note { margin: 8px 0 0; }
        .uv { display: flex; align-items: center; gap: 12px; padding: 16px 2px 0; font-size: 12px; }
        .uv div { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 3px; }
        .uv small { font-size: 10px; color: var(--outlook-muted); overflow-wrap: anywhere; }
        .uv strong { font-size: 17px; font-weight: 500; }
        .status { padding: 12px 0; font-size: 13px; line-height: 1.6; color: var(--outlook-muted); }
        .status button { display: block; text-decoration: underline; margin-top: 4px; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
    `;
}
if (!customElements.get('ha-weather-outlook')) customElements.define('ha-weather-outlook', WeatherOutlook);
