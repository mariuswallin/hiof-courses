// js/app.js

import { addNewExhibition, displayExhibitions } from "./dom";
import { loadFromJSON } from "./load";

console.log("App script loaded");

// Global variabel for utstillinger
export const exhibitions = [];

// Load exhibitions from a JSON file
async function loadExhibitions() {
  // Vis lasting-indikator
  document.getElementById("loading").style.display = "block";

  try {
    // Get the data with fetch
    const data = await loadFromJSON();
    exhibitions.push(...data);
    displayExhibitions();
  } catch (error) {
    console.error("Feil ved lasting av utstillinger:", error);
    document.getElementById("exhibitions-container").innerHTML =
      '<p class="error">Kunne ikke laste utstillinger. Prøv igjen senere.</p>';
  } finally {
    // Skjul lasting-indikator
    document.getElementById("loading").style.display = "none";
  }
}

// Initialiser applikasjonen
function init() {
  // Last utstillinger
  loadExhibitions();

  // Sett opp event listeners
  document
    .getElementById("add-exhibition-button")
    .addEventListener("click", addNewExhibition);
}

// Start the app once the DOM is ready
init();
