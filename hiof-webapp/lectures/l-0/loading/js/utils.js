// js/utils.js

console.log("Script loading utils.js");

// Helper that creates unique ids
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format the date in Norwegian
export function formatDate(date) {
  return new Date(date).toLocaleDateString("no-NO");
}
