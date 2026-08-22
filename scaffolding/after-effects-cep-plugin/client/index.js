const csInterface = new CSInterface();

document.getElementById("runBtn").addEventListener("click", () => {
  csInterface.evalScript("runPluginAction()", (result) => {
    console.log("Result from host:", result);
  });
});
