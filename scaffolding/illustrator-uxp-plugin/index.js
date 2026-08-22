const { app } = require("illustrator");

async function run() {
  const doc = app.activeDocument;
  if (!doc) {
    console.log("No active document.");
    return;
  }

  // Ejemplo: contar los path items del documento activo.
  console.log(`Path items: ${doc.pathItems.length}`);
}

document.getElementById("runBtn").addEventListener("click", run);
