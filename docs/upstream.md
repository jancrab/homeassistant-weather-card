# Upstream provenance

This project is an independent derivative of [Origami Weather](https://github.com/hazymorning/origami_weather) by hazymorning.

- Imported commit: `02356d2955202f4a2ec40dee90bebe703f016464`.
- License: GPL-3.0, retained verbatim in `LICENSE`.
- Original Git history is preserved; `upstream` points to the original repository.
- Original documentation is preserved in `docs/upstream-reference.md`. Installation names and links in that historical reference describe the original project.
- Original weather rendering, animation assets, layout presets and advanced editor remain the foundation.
- Lucide/Feather attribution embedded in the icon source is retained in the source and production bundle.

Changes in this project: independent custom-element names, local dependency bundle, default five-hour outlook, precipitation summary, optional UV sensor, quick editor toggles, tests, demo and release tooling. The original author is not responsible for these extensions.

API references checked during implementation:

- [HA custom cards](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [HA weather entities and forecasts](https://developers.home-assistant.io/docs/core/entity/weather/)
- [HA frontend weather subscription implementation](https://github.com/home-assistant/frontend/blob/dev/src/data/weather.ts)
- [HACS dashboard packaging](https://hacs.dev/docs/publish/plugin/)
