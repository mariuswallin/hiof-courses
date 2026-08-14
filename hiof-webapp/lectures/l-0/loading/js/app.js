import { createExhibition, renderExhibitions, toggleStatus } from "./dom";
import { Storage } from "./storage";

// Wait for the DOM to be ready (guaranteed by defer)
const exhibitions = Storage.load();

// Initialiserer applikasjonen
function initApp() {
  console.log("App initializing...");
  // All DOM elements are available now
  const addButton = document.getElementById("add-exhibition-button");
  const exhibitionList = document.getElementById("exhibition-list");

  // Add event listeners
  addButton.addEventListener("click", createExhibition);
  exhibitionList.addEventListener("click", (event) => toggleStatus(event));

  // Render the existing exhibitions
  renderExhibitions(exhibitions);
}

// defer means initApp can be called safely here
initApp();
