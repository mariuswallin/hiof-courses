// js/utils.js

// Format the date in Norwegian format
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("no-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
