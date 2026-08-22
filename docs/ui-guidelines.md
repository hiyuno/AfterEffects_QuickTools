# Guía de UI/UX para paneles de plugin

Mantenida por **Cohen**. Fuente de verdad para cualquier decisión de diseño
de panel en Photoshop, Illustrator o After Effects. Basada en la
documentación oficial de Adobe (UXP Design Guidelines, Spectrum, CEP
Cookbook) — ver fuentes al final.

## 1. Dialog vs. Panel — cuál usar

- **Panel** (no bloqueante): úsalo cuando el usuario necesita seguir viendo/
  tocando el canvas mientras interactúa con el plugin (selección contextual,
  ediciones en vivo). Es el caso por defecto para casi todo lo que hacemos.
- **Dialog** (bloqueante): úsalo solo cuando el plugin ejecuta una acción
  puntual que no requiere que el usuario siga interactuando con el canvas
  (p. ej. un asistente de configuración inicial, un formulario de export).
- Por defecto, si hay duda: **panel**. Un dialog interrumpe el flujo de
  trabajo del usuario.

## 2. Tamaño y layout del panel

- **No uses anchos fijos mayores a 240px** — genera conflictos con el resto
  del workspace de la app. Diseña fluido (`flex`/`grid`), no con `width` fijo
  en px salvo en el mínimo necesario.
- Declara `minimumSize` en el manifest y **diseña primero para ese ancho
  mínimo**, no para el "ideal" — el usuario puede achicar el panel a su
  límite en cualquier momento.
- El panel puede estar **acoplado (docked) o flotante** — no asumas una
  altura fija; usa scroll interno (`overflow-y: auto`) cuando el contenido no
  quepa, nunca dejes que el panel se desborde de su contenedor.
- Agrupa controles relacionados y usa `sp-divider` para separar secciones —
  no amontones controles sin jerarquía visual.

## 3. Componentes: qué usar y en qué orden de preferencia

1. **Spectrum Web Components (SWC)** — primera opción siempre
   (`sp-button`, `sp-textfield`, `sp-dropdown`, `sp-checkbox`, `sp-slider`,
   `sp-tooltip`, `sp-divider`...). UXP los provee nativamente en el runtime
   del plugin, sin instalar paquetes aparte.
2. **Spectrum UXP widgets** (los `<sp-*>` legados de UXP) — solo si SWC no
   cubre el caso.
3. **HTML plano** — último recurso, y solo si ninguna de las dos opciones
   anteriores lo resuelve. Si llegas aquí, documenta por qué en un comentario.

No inventes estilos propios (colores, sombras, radios) cuando el componente
Spectrum ya resuelve el caso — rompe la consistencia con el resto de Adobe.

## 4. Theming

- Nunca hardcodees colores. Usa las variables CSS de los design tokens de
  Spectrum (`@spectrum-web-components/styles`) — se resuelven solas según el
  tema activo del host.
- Los 4 temas de Adobe son: `lightest`, `light`, `medium` (dark), `darkest`.
  Prueba el panel en **los cuatro**, no solo en claro/oscuro.
- El tema puede cambiar **en caliente** mientras el panel está abierto — no
  asumas que se fija al abrir.

## 5. Iconografía

- Tamaño objetivo para iconos de panel: **24×24px** (declarar variantes de
  escala `[1, 2]` para HiDPI en el manifest).
- Cada ícono necesita **variante clara y oscura** (`theme` en el manifest:
  `darkest`, `dark`, `medium`, `light`, `lightest`) con contraste suficiente
  en cada una.
- Si el ícono representa un estado interactivo (herramienta, toggle), incluye
  los **tres estados**: sin seleccionar, hover, seleccionado — no solo el
  estado por defecto.
- Prefiere SVG sobre PNG cuando sea posible: escala mejor y es más fácil de
  adaptar por tema.

## 6. Mensajería y feedback

- Toda acción que tarde de forma perceptible (batchPlay, export, render)
  necesita **feedback visible**: spinner o barra de progreso, y deshabilitar
  el control que la disparó mientras corre. Un panel que no responde parece
  congelado.
- Usa el patrón de mensajería de Spectrum para: alertas, mensajes de éxito,
  diálogos de permisos. No inventes tu propio sistema de toasts/alerts.
- Los mensajes de error deben ser **accionables**: qué pasó y qué puede hacer
  el usuario al respecto — nunca solo "Something went wrong".
- Diseña explícitamente el **estado vacío**: qué se muestra sin documento
  abierto, sin capa/selección activa, con selección múltiple no soportada.

## 7. Flujos no-destructivos

- Cuando el plugin agrega contenido de imagen (Photoshop), prefiere
  insertarlo como **Smart Object embebido** en vez de rasterizar directo —
  preserva los píxeles originales y la editabilidad.
- Da acceso contextual a herramientas nativas de la app (p. ej. el color
  picker nativo) en vez de reimplementar tu propio selector — menos fricción
  y consistencia con lo que el usuario ya conoce.

## 8. Accesibilidad

- Contraste mínimo **WCAG AA** en texto y controles sobre su fondo, en los
  cuatro temas.
- Foco visible en todo elemento interactivo (los componentes Spectrum ya lo
  traen — no lo remuevas con `outline: none`).
- Labels reales en inputs (no solo `placeholder`) — los componentes Spectrum
  ya soportan navegación por teclado y ARIA; no los reemplaces por `div`s
  con `onclick`.

## 9. Localización

- No incrustes texto en imágenes/iconos.
- El layout debe sobrevivir textos ~30-40% más largos (alemán, francés) sin
  romperse — evita truncar información crítica sin `title`/tooltip.

## 10. Diferencias por plataforma (UXP vs. CEP)

| | UXP (Photoshop/Illustrator) | CEP (After Effects) |
|---|---|---|
| Componentes | Spectrum Web Components nativos, sin instalar nada | Chromium embebido más antiguo — SWC no siempre disponible igual; validar caso por caso |
| Theming | Automático vía variables CSS de Spectrum | Hay que leerlo del host (`getHostEnvironment()` de CSInterface) y aplicarlo a mano si SWC no responde |
| Debug de UI | UXP Developer Tool | Chrome DevTools remoto (el panel corre en CEF) |

Cuando SWC no tenga paridad en CEP, documenta el fallback usado en el
plugin correspondiente y avisa a **Geschke** si es un patrón que se repetirá.

## 11. Checklist antes de entregar un panel

- [ ] Probado en los 4 temas de Adobe.
- [ ] Probado en el `minimumSize` declarado en el manifest.
- [ ] Todo control interactivo tiene estado de foco visible.
- [ ] Toda acción lenta tiene feedback de progreso.
- [ ] Estados vacíos y de error diseñados explícitamente, no solo el "happy path".
- [ ] Iconos con variante clara/oscura y, si aplica, los 3 estados de interacción.
- [ ] Sin colores/tamaños hardcodeados que dupliquen un token de Spectrum existente.

## Fuentes

- [UXP Design — Panel UI](https://developer.adobe.com/xd/uxp/design/user-interface/) — Adobe Developer
- [UXP Design — Designing for Photoshop](https://developer.adobe.com/photoshop/uxp/2022/design/ux-patterns/Designingforphotoshop/) — Adobe Developer
- [UXP Manifest v5 — Panel entrypoints e iconos](https://developer.adobe.com/photoshop/uxp/2022/guides/uxp-guide/uxp-misc/manifest-v5/) — Adobe Developer
- [Spectrum Design Data — Design tokens](https://opensource.adobe.com/spectrum-design-data/) — Adobe Open Source
- [Spectrum — Design tokens](https://spectrum.adobe.com/page/design-tokens/) — Adobe Spectrum
- [Spectrum 2 — accesibilidad y contraste dinámico](https://blog.adobe.com/en/publish/2023/12/12/adobe-unveils-spectrum-2-design-system-reimagining-user-experience-over-100-adobe-applications) — Adobe Blog
- [CEP 12 HTML Extension Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_12.x/Documentation/CEP%2012%20HTML%20Extension%20Cookbook.md) — Adobe-CEP GitHub
- [A Guide to Spectrum UXP Components and Design Guidelines](https://mapsoft.com/a-guide-to-spectrum-uxp-components-and-design-guidelines/) — Mapsoft
