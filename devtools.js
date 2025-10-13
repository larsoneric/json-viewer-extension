// Create a DevTools panel
chrome.devtools.panels.create(
  "JSON Viewer",
  "icon16.png",
  "panel.html",
  function(panel) {
    console.log("JSON Viewer panel created");
  }
);
