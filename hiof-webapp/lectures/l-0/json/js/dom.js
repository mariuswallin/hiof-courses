// js/dom.js

// Read the list of exhibitions
import { exhibitions } from "./app";
import { formatDate, generateId } from "./utils";

console.log("Script loading dom.js");

// Render exhibitions into the DOM
export function displayExhibitions() {
  const container = document.getElementById("exhibitions-container");

  // Check whether there are any exhibitions
  if (exhibitions.length === 0) {
    container.innerHTML = "<p>Ingen utstillinger funnet</p>";
    return;
  }

  // Empty the container before refilling it, so entries are not duplicated
  container.innerHTML = "";

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
        <h3>${exhibition.title}</h3>
        <p class="artist">Kunstner: ${exhibition.artist}</p>
        <p class="date">Dato: ${formatDate(exhibition.date)}</p>
        <p class="status status-${exhibition.status.toLowerCase()}">
          ${exhibition.status}
        </p>
        <p class="description">${exhibition.description}</p>
        <button data-id='${exhibition.id}' onclick="window.HIOF.toggleStatus('${
    exhibition.id
  }')">Endre status</button>
    `;
  return article;
}

// Toggle status between Planlagt and Aktiv
export function toggleStatus(id) {
  const exhibition = exhibitions.find((ex) => ex.id === id);
  console.log(exhibitions, id);

  // Log an error if the exhibition does not exist
  if (!exhibition) {
    console.error(`Ingen utstilling funnet med ID: ${id}`);
    return;
  }

  // Update the status. This mutates the object directly, which can cause
  // surprising bugs in larger applications.
  exhibition.status = exhibition.status === "Planlagt" ? "Aktiv" : "Planlagt";

  // Trigger oppdatering av visning
  displayExhibitions();

  // A real app would send this to the server
  console.log(`Status endret for utstilling ${id}`);
}

// Add a new exhibition
export function addNewExhibition() {
  // Hent input-feltene
  const titleInput = document.getElementById("new-exhibition-title");
  const artistInput = document.getElementById("new-exhibition-artist");

  if (!titleInput.value || !artistInput.value) {
    console.error("Tittel og kunstner må fylles ut");
    return;
  }

  const title = titleInput.value.trim();
  const artist = artistInput.value.trim();

  const newExhibition = {
    id: generateId(), // Generer en unik ID
    title, // Kan sette verdien direkte får da (title: `Verdien til title`)
    artist,
    date: new Date().toISOString().split("T")[0],
    status: "Planlagt",
    description: "Ny utstilling",
  };

  // Add it to our list
  exhibitions.push(newExhibition);

  // Oppdater visning
  displayExhibitions();

  // Clear the form
  titleInput.value = "";
  artistInput.value = "";
}

// Put the function in global scope so the HTML button can call it
window.HIOF = {
  toggleStatus,
};
