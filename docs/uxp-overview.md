# UXP — resumen de referencia

UXP (Unified Extensibility Platform) es el framework moderno de Adobe para
plugins, usado hoy en Photoshop e Illustrator. Reemplaza gradualmente a CEP.

## Conceptos clave

- **Manifest** (`manifest.json`): declara nombre, id, versión, host(s)
  soportado(s), permisos (`requiredPermissions`), y entry points (paneles,
  comandos de menú).
- **Entry points**: un plugin UXP puede exponer `panels` (UI persistente) y
  `commands` (acciones sin UI, invocadas desde menú).
- **Host API por app**: `require("photoshop")` en Photoshop,
  `require("illustrator")` en Illustrator. La superficie de API difiere
  bastante entre ambas — no asumas paridad.
- **`require("uxp")`**: API común a toda UXP (filesystem sandboxeado,
  shell, storage) disponible en ambas apps.
- **Modal execution**: en Photoshop, cambios al documento deben ir dentro de
  `core.executeAsModal()`. Illustrator tiene su propio mecanismo de
  transacciones — no asumas que aplica igual.
- **Spectrum Web Components**: la librería de UI recomendada para paneles,
  vía `<script>` tag o import, para que el plugin se vea nativo.

## Diferencias entre Photoshop e Illustrator (UXP)

| Aspecto | Photoshop | Illustrator |
|---|---|---|
| Madurez de la API | Alta, cubre casi todo ExtendScript | Media, aún faltan equivalentes de algunas features clásicas |
| Batch operations | `batchPlay` para lo no cubierto por API moderna | Menos necesidad de fallback, pero API más nueva y cambiante |
| Documentos | `app.activeDocument`, `activeLayers` | `app.activeDocument`, `pageItems`, `artboards` |

## Versionado de host API

Cada versión de Photoshop/Illustrator soporta un subset de features UXP.
Antes de usar una API nueva, confirma la versión mínima de la app requerida y
declárala en el manifest si aplica. Mantén esta tabla actualizada cuando se
descubran incompatibilidades — responsabilidad de **Geschke**.
