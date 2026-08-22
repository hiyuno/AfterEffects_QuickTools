const { app, core } = require("photoshop");

async function run() {
  const doc = app.activeDocument;
  if (!doc) {
    console.log("No active document.");
    return;
  }

  await core.executeAsModal(async () => {
    // Ejemplo: invertir colores de la capa activa.
    const layer = doc.activeLayers[0];
    if (layer) {
      await layer.invert();
    }
  }, { commandName: "Run Plugin Action" });
}

document.getElementById("runBtn").addEventListener("click", run);
