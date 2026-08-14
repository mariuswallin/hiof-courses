// js/dom.js

import { Storage } from "./storage";

console.log("Script loading dom.js");

const getAllExhibitionsFromDOM = () => {
  const exhibitionList = document.getElementById("exhibition-list");
  const exhibitions = [];

  // Loop over every <li> element in the list
  for (const li of exhibitionList.children) {
    // Add the text content to the exhibition list
    exhibitions.push(li.textContent);
  }

  return exhibitions;
};

export function toggleStatus(event) {
  // Check that the click landed on an <li> element
  if (event.target.tagName === "LI") {
    // Take the text content and split it
    const exhibitionText = event.target.textContent;
    const parts = exhibitionText.split(" - Status: ");

    // Toggle between statuses
    const currentStatus = parts[1];
    // Derive the new status from the current one
    const newStatus = currentStatus === "Planlagt" ? "Aktiv" : "Planlagt";

    // Update the text content with the new status
    event.target.textContent = `${parts[0]} - Status: ${newStatus}`;
  }
}

export function createExhibition() {
  const exhibitionInput = document.getElementById("new-exhibition-input");
  const exhibitionText = exhibitionInput.value;

  // Check that the user actually typed something
  if (!exhibitionText) return;

  // Create a new <li> element for the exhibition
  const newExhibition = document.createElement("li");
  // Set the content of the new element with a template literal
  newExhibition.textContent = `${exhibitionText} - Status: Planlagt`;

  // Append the new element to the list
  document.getElementById("exhibition-list").appendChild(newExhibition);

  // Clear the input field for the next exhibition
  exhibitionInput.value = "";
  Storage.save(getAllExhibitionsFromDOM());
}

// Export the function used to create exhibitions
export function renderExhibitions(exhibitions = []) {
  // Get the list element the exhibitions render into
  const exhibitionList = document.getElementById("exhibition-list");
  exhibitionList.innerHTML = ""; // Clear the list before rendering

  // Loop over the exhibitions and build one <li> per entry
  for (const exhibition of exhibitions) {
    const li = document.createElement("li");
    // Set the <li> content to the exhibition name
    li.textContent = exhibition;
    exhibitionList.appendChild(li);
  }
}
