export const HOUR = 60 * 60 * 1000;

export function finiteNumber(value, min = -Infinity, max = Infinity) {
    if (value == null || typeof value === 'boolean' || (typeof value === 'string' && !value.trim())) return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

// One entry per successive hour, anchored to the provider's next timestamp.
// Never stretch a sparse or daily forecast into five hours, or repeat its last entry.
export function nextFiveHours(raw, now = Date.now()) {
    const sorted = (Array.isArray(raw) ? raw : [])
        .filter(entry => entry && Number.isFinite(Date.parse(entry.datetime)))
        .map(entry => ({ ...entry, time: Date.parse(entry.datetime) }))
        .filter(entry => entry.time >= now && entry.time <= now + 5 * HOUR)
        .sort((a, b) => a.time - b.time);
    const first = sorted[0];
    if (!first || first.time > now + HOUR) return [];
    const byTime = new Map(sorted.map(entry => [entry.time, entry]));
    return Array.from({ length: 5 }, (_, index) => {
        const time = first.time + index * HOUR;
        const entry = byTime.get(time);
        return {
            time, available: !!entry, condition: entry?.condition || '',
            temperature: finiteNumber(entry?.temperature),
            precipitation: finiteNumber(entry?.precipitation, 0),
            probability: finiteNumber(entry?.precipitation_probability, 0, 100)
        };
    });
}

export function precipitationSummary(hours) {
    const amounts = hours.map(hour => hour.precipitation).filter(value => value !== null);
    const probabilities = hours.map(hour => hour.probability).filter(value => value !== null);
    return {
        total: amounts.length === 5 ? amounts.reduce((sum, value) => sum + value, 0) : null,
        maximumProbability: probabilities.length ? Math.max(...probabilities) : null,
        completeProbability: probabilities.length === 5,
        firstWet: hours.find(hour => hour.precipitation > 0) || null
    };
}

export function currentUV(hass, config) {
    const entity = hass?.states?.[config.uv_entity || config.weather_entity];
    if (!entity || ['unknown', 'unavailable'].includes(entity.state)) return null;
    return finiteNumber(config.uv_entity ? entity.state : entity.attributes?.uv_index, 0);
}

export function outlookEnabled(config) {
    return config.show_hourly !== false || config.show_precipitation !== false || config.show_uv === true;
}

// A generation token rejects late events and releases late subscription promises.
export class HourlyForecastSubscription {
    constructor(onChange) {
        this.onChange = onChange;
        this.generation = 0;
        this.status = 'idle';
        this.forecast = [];
    }

    sync(hass, entityId, enabled) {
        const entity = hass?.states?.[entityId];
        const connection = hass?.connection;
        const supported = !!(entity?.attributes?.supported_features & 2);
        const available = !!entity && !['unknown', 'unavailable'].includes(entity.state);
        const status = !enabled ? 'idle' : !available || !connection ? 'unavailable' : !supported ? 'unsupported' : 'ready';
        if (this.entityId === entityId && this.connection === connection && this.sourceStatus === status) return;
        this.stop();
        this.entityId = entityId;
        this.connection = connection;
        this.sourceStatus = status;
        this.forecast = [];
        this.status = status === 'ready' ? 'loading' : status;
        this.onChange();
        if (status === 'ready') this.start();
    }

    async start() {
        const generation = this.generation;
        try {
            const unsubscribe = await this.connection.subscribeMessage(message => {
                if (generation !== this.generation) return;
                this.forecast = Array.isArray(message?.forecast) ? message.forecast : [];
                this.status = 'ready';
                this.onChange();
            }, { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: this.entityId });
            if (generation !== this.generation) { unsubscribe(); return; }
            this.unsubscribe = unsubscribe;
        } catch {
            if (generation !== this.generation) return;
            this.forecast = [];
            this.status = 'error';
            this.onChange();
        }
    }

    retry() {
        if (!['error', 'ready'].includes(this.status)) return;
        this.stop(false);
        this.forecast = [];
        this.status = 'loading';
        this.onChange();
        this.start();
    }

    stop(reset = true) {
        this.generation++;
        if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
        if (reset) { this.connection = null; this.entityId = null; this.sourceStatus = null; }
    }
}
