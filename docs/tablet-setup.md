# Tablet-Dashboard: Einbau

## 1. Installation

Öffne [das Repository in HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=jancrab&repository=homeassistant-weather-card&category=plugin) oder füge `https://github.com/jancrab/homeassistant-weather-card` unter **HACS → Benutzerdefinierte Repositories → Dashboard** hinzu. Lade die Karte herunter und lade den Browser auf dem Tablet neu.

Falls die Ressource fehlt, trage `/hacsfiles/homeassistant-weather-card/homeassistant-weather-card.js` als JavaScript-Modul unter den Dashboard-Ressourcen ein. Bei Updates den Tablet-Browser neu laden; bei einer veralteten Darstellung den Browser-Cache aktualisieren.

## 2. Karte einfügen

Im Dashboard eine manuelle Karte hinzufügen und folgende YAML einfügen. `weather.home` durch die eigene Wetterentität ersetzen:

```yaml
type: custom:homeassistant-weather-card
weather_entity: weather.home
color_mode: theme
card_height: content
card_padding: 20px
show_hourly: true
show_precipitation: true
show_uv: true
details_mode: toggle
grid_options:
  columns: 12
  rows: auto
```

Die Karte zeigt dauerhaft das aktuelle Wetter und fünf Stunden mit Wetterlage und Temperatur. **Details** öffnet Niederschlagswerte und UV weich innerhalb derselben Karte; **Weniger** klappt sie wieder ein. Die Übersicht bleibt sichtbar. Keine automatische Rotation und kein Zurückspringen bei Wetterupdates. Nach einem Neuladen startet die Karte wieder kompakt. `details_mode: always` hält Details dauerhaft offen; dieselbe Option gibt es im visuellen Editor.

Der UV-Index kommt aus der Wetterentität. Für einen eigenen UV-Sensor ergänzen:

```yaml
uv_entity: sensor.outdoor_uv_index
```

`show_uv: false` blendet UV vollständig aus. Fehlende Werte bleiben als fehlend erkennbar.

`grid_options` gilt für eine **Sections-/Abschnitte-Ansicht**; in anderen Ansichtstypen kann dieser Block entfallen. Eine ausreichend breite Section ist für die fünf Zeitspalten günstiger als mehrere eng gepackte Wetterkarten. Die Karte passt sich ihrer tatsächlichen Breite an und wächst beim Öffnen der Details. Benachbarte Cards rücken entsprechend nach unten.

## 3. Schwächeres Tablet

Diese optionalen Einstellungen reduzieren dekorative Effekte und behalten die Wetterdaten bei:

```yaml
bird_effects: false
balloon_effects: false
plane_effects: false
night_sky_effects: false
```

Falls nötig zusätzlich `cloud_effects: false` und `precipitation_effects: false` verwenden. Für maximale Ruhe `background_haze: false` ergänzen. Die Betriebssystem-Einstellung **Bewegung reduzieren** deaktiviert außerdem Übergänge und die laufenden Wetteranimationen. Unsichtbare Cards pausieren bereits ihre Canvas-Animation.

## Sinnvolle spätere Ergänzungen

- Eine kompakte Wetterwarnung mit Daten aus einer tatsächlich eingerichteten Warnintegration.
- Gefühlt-Temperatur und Windböen als weitere optionale Details, sofern die Wetterentität diese liefert.
- Eine Datenfrische-Anzeige, die einen bestätigten letzten Empfang von einer geschätzten Aktualität unterscheidet.
- Ein Minuten-Regenverlauf nur mit einer geeigneten Nowcast-Datenquelle. Die jetzige Karte liefert eine stündliche Prognose.

Diese Ergänzungen sind Vorschläge und nicht Teil von Version 0.1.0. Helligkeit, Display-Zeitplan und ein Kiosk-Modus werden separat am Tablet eingerichtet; die Wetterkarte steuert das Gerät nicht.

Referenzen: [HACS Custom Repositories](https://hacs.xyz/docs/faq/custom_repositories/), [Home Assistant Sections](https://www.home-assistant.io/dashboards/sections/).
