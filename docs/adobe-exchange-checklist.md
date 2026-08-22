# Checklist de publicación — Adobe Exchange

Mantenido por **Brainerd**. Repasar antes de someter un plugin a revisión.

## Empaquetado

- [ ] `manifest.json`/`manifest.xml` validado (sin errores de esquema).
- [ ] Versión del manifest coincide con la versión que se va a publicar.
- [ ] Plugin empaquetado como `.ccx` (UXP) o `.zxp` firmado (CEP).
- [ ] Certificado de firma válido (no expirado) para CEP.
- [ ] Iconos en todos los tamaños requeridos (18/24/36px, @1x/@2x).

## Metadata de listing

- [ ] Nombre del plugin único y descriptivo.
- [ ] Descripción corta (≤ 100 caracteres) y larga.
- [ ] Categoría correcta en Adobe Exchange.
- [ ] Al menos 3 capturas de pantalla del plugin en uso real.
- [ ] Enlace a soporte/documentación del plugin.
- [ ] Política de privacidad si el plugin hace requests de red.

## Calidad y cumplimiento

- [ ] Checklist de QA de **Brown** completado sin bugs bloqueantes.
- [ ] No se piden permisos innecesarios (revisar `requiredPermissions`).
- [ ] El plugin no rompe si no hay documento abierto (manejo de estado vacío).
- [ ] Funciona en la versión mínima de la app declarada en el manifest.
- [ ] Cumple las guidelines de contenido de Adobe Exchange (sin marcas de
      terceros no autorizadas, sin contenido engañoso).

## Antes de publicar

- [ ] El usuario confirmó explícitamente que quiere publicar (acción
      irreversible una vez enviado a revisión).
