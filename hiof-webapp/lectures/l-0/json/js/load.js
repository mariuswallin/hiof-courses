// js/load.js

console.log("Script loading json load.js");

export function loadFromJSON() {
  return fetch("data.json")
    .then((response) => {
      // Convert the data to JSON
      return response.json();
    })
    .catch((error) => {
      console.error("Error loading JSON data:", error);
    });
}
