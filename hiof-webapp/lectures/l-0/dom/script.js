// script.js

// Find the button and add a click listener
document
  .getElementById("add-exhibition-button")
  .addEventListener("click", function () {
    // Get the input field and its value
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
  });

// Listen on the whole list (event delegation)
document
  .getElementById("exhibition-list")
  .addEventListener("click", function (event) {
    // Check whether an LI element was clicked
    if (event.target.tagName === "LI") {
      // Take the text content and split it
      const exhibitionText = event.target.textContent;
      const parts = exhibitionText.split(" - Status: ");

      // Toggle between statuses
      const currentStatus = parts[1];
      // Derive the new status from the current one: "Planlagt" becomes "Aktiv",
      // and the other way around.
      const newStatus = currentStatus === "Planlagt" ? "Aktiv" : "Planlagt";

      // Update the text content with the new status
      event.target.textContent = parts[0] + " - Status: " + newStatus;
    }
  });

// Save exhibitions to localStorage
function saveExhibitions() {
  // Empty array to hold the exhibitions
  const exhibitions = [];

  // Find every li element in the list with querySelectorAll
  const exhibitionLiElements = document.querySelectorAll("#exhibition-list li");

  // Collect the text content from each element
  for (const element of exhibitionLiElements) {
    exhibitions.push(element.textContent);
  }

  // Store as a JSON string in localStorage; JSON.stringify turns the array
  // into a string.
  localStorage.setItem("exhibitions", JSON.stringify(exhibitions));
}

// Load exhibitions from localStorage
function loadExhibitions() {
  // Read from localStorage, defaulting to an empty array
  const exhibitions = JSON.parse(localStorage.getItem("exhibitions")) || [];

  console.log("Lastet utstillinger:", exhibitions);

  // Recreate each element in the DOM
  for (const exhibition of exhibitions) {
    const newExhibition = document.createElement("li");
    newExhibition.textContent = exhibition;
    document.getElementById("exhibition-list").appendChild(newExhibition);
  }
}

// Save on every change
document
  .getElementById("add-exhibition-button")
  .addEventListener("click", saveExhibitions);

document
  .getElementById("exhibition-list")
  .addEventListener("click", saveExhibitions);

// Load stored exhibitions when the page loads
loadExhibitions();
