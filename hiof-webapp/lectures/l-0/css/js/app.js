// js/app.js

import { loadFromJSON } from "./load";

console.log("App script loaded");

await loadFromJSON();

// Get a reference to the button
const addButton = document.getElementById("add-exhibition-button");

// Change the style when the user clicks
addButton.addEventListener("click", function (event) {
  // Prevent the default action (for example form submission)
  event.preventDefault();

  const element = event.target;
  // Temporary visual feedback
  element.style.backgroundColor = "#27ae60";
  element.textContent = "Lagt til!";

  // Reset after 2 seconds
  setTimeout(() => {
    element.style.backgroundColor = "";
    element.textContent = "Legg til utstilling";
  }, 2000);
});
