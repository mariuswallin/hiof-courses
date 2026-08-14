// js/dom.js

// Read the list of exhibitions
import { formatDate } from "./utils";

console.log("Script loading dom.js");

// Render exhibitions into the DOM
export function displayExhibitions(exhibitions = []) {
  const container = document.querySelector(".exhibition-grid");

  // Check whether there are any exhibitions
  if (exhibitions.length === 0) {
    container.innerHTML = "<p>Ingen utstillinger funnet</p>";
    return;
  }

  for (const exhibition of exhibitions) {
    const exhibitionElement = createExhibitionElement(exhibition);
    container.appendChild(exhibitionElement);
  }
}

// Build the HTML element for one exhibition. Defaults avoid errors when
// fields are missing.
function createExhibitionElement(exhibition = {}) {
  const article = document.createElement("article");
  article.className = "exhibition-card";
  article.innerHTML = `
        <h3 class="title">${exhibition.title}</h3>
        <p class="artist">Kunstner: ${exhibition.artist}</p>
        <p class="date">Dato: ${formatDate(exhibition.date)}</p>
        <p class="status status-${exhibition.status.toLowerCase()}">
          ${exhibition.status}
        </p>
        <p class="description">${exhibition.description}</p>
    `;
  return article;
}
