// js/app.js

import { displayExhibitions } from "./dom";
import { fetchExhibitions } from "./load";

console.log("App script loaded");

// Load exhibitions from a JSON file
async function loadExhibitions() {
  const data = await fetchExhibitions();
  displayExhibitions(data);
}

loadExhibitions();
