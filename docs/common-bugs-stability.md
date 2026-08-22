# Bugs comunes y estabilidad en plugins Adobe

Mantenida por **Brown**. Catálogo de fallas conocidas y patrones de
inestabilidad en UXP y CEP, para revisarlos proactivamente en cada plugin en
vez de esperar a que el usuario los reporte. Basada en la documentación
oficial de Adobe (UXP Known Issues), foros de Creative Cloud Developer, y
reportes de la comunidad — fuentes al final.

## 1. UXP — crashes y estados inestables

- **Crash nativo (SIGSEGV / EXCEPTION_ACCESS_VIOLATION)** al usar
  `executeAsModal` combinado con llamadas nativas intensas despachadas vía
  Comlink/`postMessage`. Mitigación: mantener el trabajo dentro de
  `executeAsModal` acotado y simple; evitar disparar múltiples
  `executeAsModal` anidados o en ráfaga rápida.
- **`executeAsModal` no libera el estado modal** mientras el botón del mouse
  sigue presionado — puede dejar la UI bloqueada en interacciones de
  drag/hold. Probar explícitamente flujos con mouse-down prolongado.
- **`entrypoints.setup()` llamado con delay** produce un error incapturable
  si se invoca más de ~20ms después del arranque del plugin. Llamarlo lo más
  temprano posible en el ciclo de vida, sin await previos pesados.
- **`try/catch` no captura errores de `batchPlay`** de forma confiable.
  Patrón correcto: envolver siempre en `core.executeAsModal(...)` con su
  propio `try/catch`, y no asumir que un `batchPlay` fallido lanza una
  excepción estándar — validar también el resultado devuelto.

## 2. UXP — issues de UI que rompen la experiencia (no solo estética)

- **File picker desde un control Spectrum** puede disparar un loop infinito
  de eventos de click — requiere lógica de prevención o usar un widget
  nativo en su lugar.
- **`uxpshowpanel` solo dispara una vez y `uxphidepanel` nunca dispara** —
  no construyas lógica crítica de estado (guardar datos, limpiar timers)
  asumiendo que estos eventos son confiables.
- **Campos numéricos** disparan errores de validación en valores
  aparentemente válidos — testear rangos límite explícitamente.
- **`<select value="...">`** no refleja el valor seleccionado en el DOM —
  usar `setAttribute()` o el atributo `selected` en el `<option>`.
- **`<option>` sin atributo `value`** hace que `select.value` devuelva
  `undefined` — siempre declarar `value` explícito.
- **`<label for="id">` no funciona** — hay que envolver el control con el
  `<label>`, no vincularlo por id.
- **Controles deshabilitados y luego rehabilitados** quedan inalcanzables
  por Tab — evitar depender de disable/enable para flujos accesibles por
  teclado.
- **Diálogos de guardar aparecen detrás del panel** — advertir al usuario
  o traer el panel al frente antes de abrir diálogos nativos.

## 3. UXP — riesgo de rechazo en Adobe Exchange

- **Acceder a APIs privadas** (campos/métodos no documentados) los expone a
  inspección y es motivo de rechazo en el marketplace. Si un plugin depende
  de una API privada, es una señal de alerta — reportarlo a **Geschke** para
  buscar alternativa documentada antes de someterlo a revisión.

## 4. CEP — memory leaks y consumo de memoria

- El **garbage collector de Chromium no se dispara automáticamente** dentro
  de un panel CEP. La memoria crece de forma continua: reloads de página
  (~20MB c/u), movimientos de mouse (~1-10MB c/u). El proceso
  `CEPHtmlEngine` puede llegar a 800MB–1GB+ en sesiones largas.
- Mitigación:
  - Minimizar manipulación de DOM innecesaria y listeners de mouse/scroll
    de alta frecuencia sin throttle/debounce.
  - Evitar recargar el panel completo (`location.reload()`) como mecanismo
    de "reset" — reinicializar estado en JS en vez de recargar la página.
  - En desarrollo, forzar garbage collection manual desde Chrome DevTools
    remoto para diferenciar un leak real de la acumulación normal de CEF.
- **Cada panel CEP corre su propio proceso de navegador** — un plugin con
  varios paneles abiertos simultáneamente es más costoso en memoria que uno
  con un solo panel; evaluar si de verdad se necesitan paneles separados.

## 5. ExtendScript — pitfalls específicos

- **`$.gc()` (sin `light:true`) vacía el sistema de undo.** No llamarlo
  dentro de un `undoGroup` activo ni entre operaciones que el usuario espera
  poder deshacer juntas — puede romper el undo del usuario de forma
  silenciosa.
- ES3 no tiene `try/catch` moderno con stack traces útiles — loguear
  siempre `e.message` y `e.line` en los catch, no solo el objeto de error.
- Los `undoGroup` mal anidados (abrir uno nuevo sin cerrar el anterior)
  dejan el historial de undo del usuario en un estado inconsistente —
  siempre usar `app.beginUndoGroup()`/`endUndoGroup()` en pares
  balanceados, incluso en rutas de error (`finally`).

## 6. Compatibilidad entre versiones de la app

- Las actualizaciones de las apps de Adobe **han roto plugins existentes**
  en el pasado (ej. una versión de Photoshop que rompió múltiples plugins
  UXP a la vez). No asumir que una API estable hoy seguirá igual en la
  próxima versión mayor.
- Declarar `minVersion` realista en el manifest y, si el plugin depende de
  una API relativamente nueva, probarlo contra al menos dos versiones de la
  app (la mínima declarada y la más reciente) antes de publicar.
- Seguir el changelog oficial de UXP al hacer upgrade de dependencias o
  antes de una release — cambios de comportamiento no siempre son
  breaking a nivel de compilación, pero sí a nivel de comportamiento.

## 7. Herramientas y hábitos que previenen bugs antes de que existan

- Adobe publicó un **plugin de ESLint para APIs de UXP** (inicialmente para
  Premiere) que atrapa errores comunes en tiempo de escritura, antes de
  correr el plugin. Evaluar adoptar linting equivalente para Photoshop/
  Illustrator cuando el proyecto lo justifique.
- Si el UXP Developer Tool no detecta la app ("No applications are
  connected"): confirmar que la app esté abierta, que el servicio UXP esté
  activo, actualizar la app y el Developer Tool, y revisar firewall/
  antivirus antes de asumir que es un bug del plugin.

## 8. Checklist de estabilidad antes de entregar un plugin

- [ ] Todo `batchPlay` que modifica el documento está dentro de
      `executeAsModal` con su propio `try/catch`.
- [ ] `entrypoints.setup()` se llama sin delays artificiales.
- [ ] Probado con mouse-down prolongado en interacciones de drag/hold.
- [ ] No depende de `uxpshowpanel`/`uxphidepanel` para lógica crítica.
- [ ] Sin acceso a APIs privadas no documentadas.
- [ ] (CEP) Sin acumulación de memoria evidente tras una sesión larga de uso
      real (no solo una prueba de 2 minutos).
- [ ] (ExtendScript) `undoGroup` balanceados incluso en rutas de error.
- [ ] Probado contra la versión mínima declarada y la más reciente de la app.

## Fuentes

- [UXP Known Issues](https://developer.adobe.com/xd/uxp/uxp/known-issues) — Adobe Developer
- [UXP Changelog](https://developer.adobe.com/xd/uxp/uxp/changelog3P/) — Adobe Developer
- [Recurring native crash in UXP webview plugin](https://forums.creativeclouddeveloper.com/t/recurring-native-crash-sigsegv-exception-access-violation-in-torq-context-uxp-webview-plugin/12101) — Creative Cloud Developer Forums
- [Try/catch for UXP batchPlay code](https://forums.creativeclouddeveloper.com/t/try-catch-for-uxp-batchplay-code-in-photoshop-cc-2021/2127) — Creative Cloud Developer Forums
- [Important Updates for UXP Powered Photoshop Plugins](https://medium.com/adobetech/important-updates-for-uxp-powered-photoshop-plugins-6c0e7a711382) — Adobe Tech Blog
- [PS 23.3 broke all my plugins](https://forums.creativeclouddeveloper.com/t/ps-23-3-broke-all-my-plugins/4605) — Creative Cloud Developer Forums
- [New ESLint Plugin Catches Common Premiere UXP Bugs](https://blog.developer.adobe.com/en/publish/2026/08/new-eslint-plugin-catches-common-premiere-uxp-bugs) — Adobe Developer Blog
- [MAJOR memory leaks in CEP extensions — Garbage Collector disabled?](https://github.com/Adobe-CEP/CEP-Resources/issues/120) — Adobe-CEP GitHub
- [CEP 11.1 HTML Extension Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md) — Adobe-CEP GitHub
