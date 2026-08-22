// ExtendScript (ES3) — corre en el contexto de After Effects.
// Invocado desde client/index.js vía CSInterface.evalScript().

function runPluginAction() {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        return "No active composition.";
    }

    app.beginUndoGroup("Run Plugin Action");
    // Ejemplo: renombrar la comp activa.
    comp.name = comp.name + " (edited)";
    app.endUndoGroup();

    return "OK: " + comp.name;
}
