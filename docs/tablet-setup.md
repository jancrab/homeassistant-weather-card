# Tablet-Dashboard: Einbau

## 1. Installation

Öffne [das Repository in HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=jancrab&repository=homeassistant-weather-card&category=plugin) oder füge `https://github.com/jancrab/homeassistant-weather-card` unter **HACS → Benutzerdefinierte Repositories → Dashboard** hinzu. Lade die Karte herunter und lade den Browser auf dem Tablet neu.

Falls die Ressource fehlt, trage `/hacsfiles/homeassistant-weather-card/homeassistant-weather-card.js` als JavaScript-Modul unter den Dashboard-Ressourcen ein. Bei Updates den Tablet-Browser neu laden; bei einer veralteten Darstellung den Browser-Cache aktualisieren.

## 2. Karte einfügen

Im Dashboard eine manuelle Karte hinzufügen und folgende YAML einfügen. `weather.home` durch die eigene Wetterentität ersetzen:

```yaml
type: custom:homeassistant-weather-card
weather_entity: weather.home
color_mode: dark
card_height: content
card_padding: 16px
compact: true
show_hourly: true
show_precipitation: true
show_uv: true
details_mode: toggle
grid_options:
  columns: 12
  rows: auto
```

Die Karte zeigt dauerhaft das aktuelle Wetter und fünf Stunden mit Wetterlage und Temperatur. **Details** öffnet Niederschlagswerte und UV weich innerhalb derselben Karte; **Weniger** klappt sie wieder ein. Die Übersicht bleibt sichtbar. Keine automatische Rotation und kein Zurückspringen bei Wetterupdates. Nach einem Neuladen startet die Karte wieder kompakt. `details_mode: always` hält Details dauerhaft offen; dieselbe Option gibt es im visuellen Editor.

### UV-Datenquelle

Die Karte liest automatisch das Attribut `uv_index` der ausgewählten Wetterentität. Eine separate UV-Entität ist dafür nicht erforderlich. Unter **Entwicklerwerkzeuge → Zustände** lässt sich prüfen, ob das Attribut vorhanden ist. Nicht jeder Wetteranbieter liefert es; Home Assistant berechnet es nicht allgemein aus Temperatur oder Sonnenstand.

Als zusätzliche Quelle ist beispielsweise [OpenUV](https://www.home-assistant.io/integrations/openuv/) möglich. Die Integration benötigt einen API-Schlüssel und stellt einen Sensor **Current UV Index** bereit. Wähle den aktuellen numerischen Index, nicht den Tageshöchstwert oder die textuelle UV-Stufe. OpenUV aktualisiert laut HA-Dokumentation nicht automatisch: Eine Automation mit `homeassistant.update_entity` ist erforderlich; die Dokumentation enthält Beispiele und Hinweise zu Abruflimits.

Für einen solchen UV-Sensor ergänzen (durch dessen tatsächliche Entitäts-ID ersetzen):

```yaml
uv_entity: sensor.outdoor_uv_index
```

`show_uv: false` blendet UV vollständig aus. Fehlende Werte bleiben als fehlend erkennbar.

Referenz zum Wetterattribut: [Home Assistant Weather entity](https://developers.home-assistant.io/docs/core/entity/weather/).

### Platz und abgeschnittene Werte

Aktiviere für bestehende Karten **Kompaktes Tablet-Layout** im Editor oder ergänze `compact: true`. Horizontale Messwertleisten werden umgebrochen; Wind und weitere Werte sind damit ohne seitliches Wischen erreichbar. Der Modus reduziert Abstände und verwendet bei normalen Layouts die Inhaltshöhe. Ausschalten stellt die gespeicherte Scroll-/Höhenkonfiguration wieder her. Frei positionierte Szenen behalten ihre Geometrie; für eine möglichst kompakte Tablet-Karte eignen sich Standard, Slim und Centered.

Sind `show_hourly`, `show_precipitation` und `show_uv` alle `false`, entfällt der zusätzliche Prognosebereich vollständig. Bereits individuell angelegte Buttons der Originalvorlagen sind davon unabhängig. Eine explizite feste Kartenhöhe oder feste Dashboard-Zeilen können weiterhin Platz reservieren; nutze für automatisches Schrumpfen `card_height: content` und `grid_options.rows: auto`.

Slim enthält aus der Originalvorlage einen separaten UV-Button mit Tagesprognose. Er wird nicht vom Schalter für den neuen aktuellen UV-Index gesteuert. Wenn dieser alte Button nur `N/A` zeigt oder doppelt ist, entferne ihn im erweiterten Button-Editor. Für den aktuellen UV-Index nutze den neuen UV-Schalter und gegebenenfalls `uv_entity`.

`grid_options` gilt für eine **Sections-/Abschnitte-Ansicht**; in anderen Ansichtstypen kann dieser Block entfallen. Eine ausreichend breite Section ist für die fünf Zeitspalten günstiger als mehrere eng gepackte Wetterkarten. Die Karte passt sich ihrer tatsächlichen Breite an und wächst beim Öffnen der Details. Benachbarte Cards rücken entsprechend nach unten.

## 3. Schwächeres Tablet

Ab Version 0.1.2 bleibt die Karte standardmäßig auch tagsüber dunkel. In einer bestehenden Konfiguration `color_mode: theme` oder `color_mode: sun` durch `color_mode: dark` ersetzen, alternativ im Farbmodus **Immer dunkel** auswählen. Sonne, Mond und Wetteranimationen richten sich weiterhin nach den echten Zuständen. Der Bildschirm selbst wird dadurch nicht gedimmt.

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
