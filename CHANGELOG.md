# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado: `LIB_VERSION` dentro de `AE_Quick Tools.jsx`.

## [1.0.0] - 2026-08-22

- Rename del plugin de "Quick Actions" a "Quick Tools" (archivo, detección de
  modo, textos de UI).
- Fix de estabilidad: `initialize()` envuelta en try/catch con alert en caso
  de fallo fatal (antes fallaba en silencio y el panel "desaparecía").
- Fix de estabilidad: `resolveToolMode()` ya no cae en silencio al modo
  `"library"` cuando no reconoce el nombre de archivo — ahora loguea la
  advertencia. Corregido typo `"ae_tools_easign"` → `"ae_tools_easing"`.
- Archivo renombrado a `AE_Quick Tools.jsx`.
