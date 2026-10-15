import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

const window = new Window({ url: 'http://localhost/' });
for (const name of ['window', 'document', 'customElements', 'HTMLElement', 'Element', 'Node', 'ShadowRoot', 'Document', 'CSSStyleSheet', 'CustomEvent', 'Event', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'CSS', 'navigator']) {
    Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? window : window[name] });
}
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
await import('../homeassistant-weather-card.js');
const { LAYOUT_PRESETS, instantiatePreset } = await import('../layout-presets.js');
const { WeatherOutlook } = await import('../weather-outlook.js');
after(() => { document.body.replaceChildren(); return window.happyDOM.abort(); });

function fixture() {
    let callback;
    const hass = {
        states: {
            'weather.home': { entity_id: 'weather.home', state: 'rainy', attributes: { supported_features: 2, temperature: 18, temperature_unit: '°C', precipitation_unit: 'mm', friendly_name: 'Home', uv_index: 0 } },
            'sun.sun': { entity_id: 'sun.sun', state: 'above_horizon', attributes: { elevation: 30, azimuth: 180 } },
            'sensor.uv': { state: '2', attributes: { friendly_name: 'UV sensor' } }
        },
        locale: { language: 'de', time_format: '24', number_format: 'decimal_comma', time_zone: 'server' },
        config: { time_zone: 'Europe/Berlin', latitude: 52, longitude: 13, unit_system: { temperature: '°C' } },
        themes: { darkMode: false }, localize: () => '',
        formatEntityState: entity => entity.state,
        formatEntityAttributeValue: (entity, attribute) => String(entity.attributes[attribute] ?? ''),
        connection: { subscribeMessage: async cb => { callback = cb; return () => {}; } }
    };
    return { hass, emit: forecast => callback({ forecast }) };
}

test('card has its own identity and updates optional UV even with reused hass object', async () => {
    const { hass } = fixture();
    const card = document.createElement('homeassistant-weather-card');
    card._tryInitialize = () => {};
    card.setConfig({ weather_entity: 'weather.home', show_uv: true, uv_entity: 'sensor.uv' });
    document.body.append(card);
    card.hass = hass;
    const outlook = card.shadowRoot.querySelector('ha-weather-outlook');
    await outlook.updateComplete;
    assert.equal(customElements.get('origami-weather'), undefined);
    assert.match(outlook.shadowRoot.querySelector('.uv').textContent, /2/);
    hass.states['sensor.uv'] = { ...hass.states['sensor.uv'], state: '7' };
    card.hass = hass;
    await outlook.updateComplete;
    assert.match(outlook.shadowRoot.querySelector('.uv').textContent, /7/);
    card.setConfig({ weather_entity: 'weather.home', show_hourly: false, show_precipitation: false, show_uv: false });
    assert.equal(card.shadowRoot.querySelector('ha-weather-outlook'), null);
    card.remove();
});

test('outlook renders five hours, zero precipitation, missing values and live amount changes', async () => {
    const { hass, emit } = fixture();
    const outlook = new WeatherOutlook();
    document.body.append(outlook);
    outlook.setData(hass, { weather_entity: 'weather.home', show_uv: true });
    const start = Math.ceil(Date.now() / 3600000) * 3600000;
    const forecast = Array.from({ length: 5 }, (_, i) => ({ datetime: new Date(start + i * 3600000).toISOString(), temperature: 12 + i, precipitation: 0, precipitation_probability: 0, condition: 'sunny' }));
    emit(forecast);
    await outlook.updateComplete;
    assert.equal(outlook.shadowRoot.querySelectorAll('.hour').length, 5);
    assert.match(outlook.shadowRoot.querySelector('.rain').textContent, /0 mm/);
    forecast[2].precipitation = 1.5;
    emit(forecast);
    await outlook.updateComplete;
    assert.match(outlook.shadowRoot.querySelector('.rain').textContent, /1,5 mm/);
    delete forecast[1].temperature;
    delete forecast[1].precipitation;
    emit(forecast);
    await outlook.updateComplete;
    assert.match(outlook.shadowRoot.querySelectorAll('.hour')[1].textContent, /—/);
    assert.match(outlook.shadowRoot.querySelector('.rain').textContent, /fehlen Daten/);
    outlook.setData(hass, { weather_entity: 'weather.home', show_precipitation: false });
    await outlook.updateComplete;
    assert.equal(outlook.shadowRoot.querySelector('.rain'), null);
    assert.equal(outlook.shadowRoot.querySelector('.uv'), null);
    let entity;
    outlook.addEventListener('hass-more-info', event => { entity = event.detail.entityId; });
    outlook.shadowRoot.querySelector('button.details').click();
    assert.equal(entity, 'weather.home');
    outlook.remove();
});

test('editor bootstraps HA fields and toggles features while retaining custom configuration', async () => {
    let bootstrapped = false;
    window.loadCardHelpers = async () => ({ createCardElement: () => ({ constructor: { getConfigElement: async () => { bootstrapped = true; } } }) });
    const cardClass = customElements.get('homeassistant-weather-card');
    const editor = await cardClass.getConfigElement();
    assert.equal(bootstrapped, true);
    editor.hass = fixture().hass;
    editor.setConfig({ type: 'custom:homeassistant-weather-card', weather_entity: 'weather.home', extension_setting: 'preserved' });
    document.body.append(editor);
    await editor.updateComplete;
    let config;
    editor.addEventListener('config-changed', event => { config = event.detail.config; });
    const toggle = editor.shadowRoot.querySelector('ha-switch[aria-label="UV-Index anzeigen"]');
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    await editor.updateComplete;
    assert.equal(config.show_uv, true);
    assert.equal(config.extension_setting, 'preserved');
    assert.ok(editor.shadowRoot.textContent.includes('Verwendet den UV-Index'));
    editor._updateField('uv_entity', 'sensor.uv');
    editor._updateField('show_precipitation', false);
    editor._applyPreset(LAYOUT_PRESETS[0]);
    assert.equal(config.show_uv, true);
    assert.equal(config.uv_entity, 'sensor.uv');
    assert.equal(config.show_precipitation, false);
    editor.remove();
});

test('all original presets render with the overview last in reading order', async () => {
    for (const preset of LAYOUT_PRESETS) {
        const card = document.createElement('homeassistant-weather-card');
        card._tryInitialize = () => {};
        card.setConfig({ ...instantiatePreset(preset, 'weather.home'), weather_entity: 'weather.home' });
        document.body.append(card);
        card.hass = fixture().hass;
        const content = card.shadowRoot.querySelector('#content-layer');
        assert.equal(content.lastElementChild.localName, 'ha-weather-outlook', preset.id);
        assert.ok(card.shadowRoot.querySelector('#weather-effects'), preset.id);
        card.remove();
    }
});
