// js/utils.js

// Format the date in Norwegian format
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("no-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Generate a unique id from the time plus a random number
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
