// js/lazy.js

console.log("Script loading lazy.js");

// Load a module only when the user needs it
async function loadAdvancedFeatures() {
  // Dynamic import — loaded on demand
  const module = await import("./advanced-features.js");
  module.initializeFeatures();
}

// Trigger lazy loading when needed
document.getElementById("advanced-button")?.addEventListener("click", () => {
  loadAdvancedFeatures();
});
