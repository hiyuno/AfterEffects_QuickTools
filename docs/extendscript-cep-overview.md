# ExtendScript + CEP — resumen de referencia

After Effects todavía no tiene una UXP madura, así que sus plugins usan la
pila clásica: ExtendScript para automatizar la app, y CEP para el panel HTML.

## ExtendScript

- Motor ES3 (basado en un JS engine antiguo de Adobe, ExtendScript Toolkit).
  Evita `let`/`const`, arrow functions, template literals, `Array.includes`,
  etc. Usa `var`, `function`, concatenación de strings.
- Objeto raíz: `app` (After Effects), con `app.project`,
  `app.project.activeItem` (la composition activa), `app.project.items`.
- Compositions: `CompItem`, con `.layers`, `.duration`, `.frameRate`.
- Capas: `.property("Position")`, `.property("Opacity")`, expressions vía
  `.expression`.
- Render queue: `app.project.renderQueue.items.add(comp)`.
- Debugging: `$.writeln()` para logs visibles en la consola de ExtendScript
  Toolkit / ExtendScript Debugger.

## CEP (Common Extensibility Platform)

- El panel corre en un Chromium embebido (CEF). HTML/CSS/JS moderno del lado
  del panel, pero **sin acceso directo** al modelo de objetos de la app.
- Comunicación panel → app: `CSInterface.evalScript("miFuncion(args)")`
  ejecuta código ExtendScript desde el JS del panel.
- Comunicación app → panel: eventos CSXS (`CSXSEvent`) o polling.
- Manifest: `CSXS/manifest.xml`, declara `ExtensionList`, `DispatchInfo`
  (tipo de host, versión mínima/máxima, script principal, UI).
- Instalación en desarrollo: habilitar "PlayerDebugMode" en las
  preferencias/registro de CEP para cargar extensiones sin firmar.

## Notas de migración

Adobe está migrando After Effects hacia UXP progresivamente. Cuando una
feature UXP esté disponible para AE, documentarlo aquí y evaluar migrar el
scaffolding — responsabilidad de **Geschke** junto con **Simons**.
