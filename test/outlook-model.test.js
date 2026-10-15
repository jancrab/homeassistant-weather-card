import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOUR, nextFiveHours, precipitationSummary, currentUV, finiteNumber, HourlyForecastSubscription } from '../weather-outlook-model.js';

const now = Date.parse('2026-10-15T12:30:00Z');
const first = Date.parse('2026-10-15T13:00:00Z');
const entries = () => Array.from({ length: 7 }, (_, i) => ({ datetime: new Date(first + i * HOUR).toISOString(), temperature: 12 + i, precipitation: i * 0.2, precipitation_probability: i * 10 }));
const flush = () => new Promise(resolve => setImmediate(resolve));
const hass = (connection, supported_features = 2) => ({ connection, states: { 'weather.home': { state: 'cloudy', attributes: { supported_features, uv_index: 0 } } } });

test('next five hours sorts and excludes past and distant data without repeating values', () => {
    const input = entries();
    input.push({ datetime: new Date(now - HOUR).toISOString(), temperature: 100 });
    const result = nextFiveHours(input.reverse(), now);
    assert.deepEqual(result.map(item => item.temperature), [12, 13, 14, 15, 16]);
    assert.equal(nextFiveHours([{ datetime: 'invalid' }], now).length, 0);
    assert.equal(nextFiveHours([{ datetime: new Date(now + 2 * HOUR).toISOString() }], now).length, 0);
});

test('sparse and daily data leave explicit gaps; short responses never repeat the last value', () => {
    const input = entries().filter((_, i) => i !== 1);
    const result = nextFiveHours(input, now);
    assert.equal(result[1].available, false);
    assert.equal(result[1].temperature, null);
    assert.equal(precipitationSummary(result).total, null);
    const short = nextFiveHours(entries().slice(0, 1), now);
    assert.deepEqual(short.map(item => item.temperature), [12, null, null, null, null]);
});

test('window advances on the clock and stays ordered through DST repeated local hours', () => {
    assert.deepEqual(nextFiveHours(entries(), first + 1).map(item => item.temperature), [13, 14, 15, 16, 17]);
    const dst = Array.from({ length: 5 }, (_, i) => ({ datetime: new Date(Date.parse('2026-10-25T00:00:00Z') + i * HOUR).toISOString() }));
    assert.equal(new Set(nextFiveHours(dst, Date.parse('2026-10-24T23:30:00Z')).map(item => item.time)).size, 5);
});

test('missing values remain unknown while measured zero remains zero', () => {
    for (const value of [null, undefined, '', ' ', false, 'unknown', Infinity, NaN]) assert.equal(finiteNumber(value), null);
    assert.equal(finiteNumber(0), 0);
    const result = nextFiveHours(entries(), now);
    assert.equal(precipitationSummary(result).total, 2);
    assert.equal(precipitationSummary(result).maximumProbability, 40);
    assert.equal(precipitationSummary(result).firstWet.time, first + HOUR);
    assert.equal(currentUV(hass({}), { weather_entity: 'weather.home' }), 0);
    assert.equal(currentUV(hass({}), { weather_entity: 'weather.home', uv_entity: 'sensor.missing' }), null);
    assert.equal(nextFiveHours([{ datetime: new Date(first).toISOString(), precipitation: -1, precipitation_probability: 120 }], now)[0].probability, null);
});

test('hourly subscription checks capabilities and deduplicates hass updates', async () => {
    const requests = [];
    let callback;
    const connection = { subscribeMessage: async (cb, request) => { callback = cb; requests.push(request); return () => {}; } };
    const source = new HourlyForecastSubscription(() => {});
    source.sync(hass(connection, 1), 'weather.home', true);
    assert.equal(source.status, 'unsupported');
    assert.equal(requests.length, 0);
    source.sync(hass(connection), 'weather.home', true);
    source.sync(hass(connection), 'weather.home', true);
    await flush();
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0], { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: 'weather.home' });
    callback({ forecast: entries() });
    assert.equal(source.forecast.length, 7);
    callback({ forecast: null });
    assert.deepEqual(source.forecast, []);
    source.stop();
});

test('late subscription promises unsubscribe after disconnect and late events are ignored', async () => {
    let resolve, callback, released = 0;
    const connection = { subscribeMessage: cb => { callback = cb; return new Promise(done => { resolve = done; }); } };
    const source = new HourlyForecastSubscription(() => {});
    source.sync(hass(connection), 'weather.home', true);
    source.stop();
    callback({ forecast: entries() });
    resolve(() => released++);
    await flush();
    assert.equal(released, 1);
    assert.equal(source.forecast.length, 0);
});

test('connection/entity changes drop stale data and errors allow an explicit retry', async () => {
    let attempts = 0, callback;
    const connection = { subscribeMessage: async cb => { attempts++; callback = cb; if (attempts === 1) throw new Error('offline'); return () => {}; } };
    const source = new HourlyForecastSubscription(() => {});
    source.sync(hass(connection), 'weather.home', true);
    await flush();
    assert.equal(source.status, 'error');
    source.retry();
    await flush();
    callback({ forecast: entries() });
    assert.equal(source.status, 'ready');
    source.sync(hass(connection), 'weather.other', true);
    assert.equal(source.status, 'unavailable');
    assert.deepEqual(source.forecast, []);
    source.stop();
});
