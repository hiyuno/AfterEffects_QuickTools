# Referencia de manifests

## UXP — `manifest.json` (Photoshop, Illustrator)

Campos mínimos relevantes:

```json
{
  "id": "com.example.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "main": "index.html",
  "host": {
    "app": "PS",
    "minVersion": "24.0.0"
  },
  "entrypoints": [
    {
      "type": "panel",
      "id": "mainPanel",
      "label": { "default": "My Plugin" },
      "minimumSize": { "width": 230, "height": 200 }
    }
  ],
  "requiredPermissions": {
    "clipboard": "readAndWrite",
    "network": { "domains": ["none"] }
  }
}
```

- `host.app`: `"PS"` para Photoshop, `"AI"` para Illustrator.
- `requiredPermissions`: pide solo lo estrictamente necesario — cada permiso
  extra es fricción en la revisión de Adobe Exchange.
- `entrypoints[].type`: `"panel"` (UI persistente) o `"command"` (acción sin
  UI, disparada desde menú).

## CEP — `CSXS/manifest.xml` (After Effects)

Campos mínimos relevantes:

```xml
<ExtensionManifest Version="10.0" ExtensionBundleId="com.example.myplugin"
    ExtensionBundleVersion="1.0.0">
  <ExtensionList>
    <Extension Id="com.example.myplugin.panel" Version="1.0.0" />
  </ExtensionList>
  <ExecutionEnvironment>
    <HostList>
      <Host Name="AEFT" Version="[17.0,99.9]" />
    </HostList>
  </ExecutionEnvironment>
  <DispatchInfoList>
    <Extension Id="com.example.myplugin.panel">
      <DispatchInfo>
        <Resources>
          <MainPath>./client/index.html</MainPath>
          <ScriptPath>./host/main.jsx</ScriptPath>
        </Resources>
        <Lifecycle>
          <AutoVisible>true</AutoVisible>
        </Lifecycle>
        <UI>
          <Type>Panel</Type>
          <Menu>My Plugin</Menu>
        </UI>
      </DispatchInfo>
    </Extension>
  </DispatchInfoList>
</ExtensionManifest>
```

- `Host Name="AEFT"` es el código de host para After Effects.
- `ScriptPath` apunta al `.jsx` de ExtendScript que se carga en el contexto
  de la app.

Mantenido por **Geschke**. Actualizar cuando cambien requisitos mínimos de
versión o se agreguen nuevos permisos/hosts.
