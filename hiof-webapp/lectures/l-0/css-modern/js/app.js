// js/app.js

let exhibitions = [];
const form = document.querySelector(".add-exhibition-form");
const grid = document.getElementById("exhibition-list");
const themeToggle = document.querySelector(".theme-toggle");

let currentTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

function renderExhibition(exhibition) {
  const card = document.createElement("article");
  card.className = "exhibition-card";
  card.innerHTML = `
    <h3 class="title">${exhibition.title}</h3>
    ${
      exhibition.description
        ? `<p class="description">${exhibition.description}</p>`
        : ""
    }
    <button class="delete-btn" data-id="${exhibition.id}">Slett</button>
  `;

  // Listener for the delete button. exhibition.id identifies which exhibition
  // to remove.
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteExhibition(exhibition.id, card);
  });

  grid.appendChild(card);
}

function addExhibition(exhibition) {
  exhibitions.push(exhibition);
  renderExhibition(exhibition);
}

function deleteExhibition(id, element) {
  exhibitions = exhibitions.filter((ex) => ex.id !== id);
  element.style.opacity = "0";
  element.style.transform = "scale(0.9)";
  // Remove the element after a short animation
  setTimeout(() => element.remove(), 300);
}

function applyTheme(theme) {
  // Set the theme on body and update the meta tag
  document.body.setAttribute("data-theme", theme);
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    // Update the existing meta tag so the theme changes dynamically
    metaColorScheme.content = theme;
  }
  const icon = themeToggle.querySelector("span");
  icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(currentTheme);
  // Store the chosen color in localStorage to remember it
  localStorage.setItem("theme", currentTheme);
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const exhibition = {
    id: Date.now(),
    title: formData.get("title"),
    description: formData.get("description"),
  };

  addExhibition(exhibition);
  event.target.reset();
}

function init() {
  // Listeners for the form and the theme switch
  form.addEventListener("submit", handleSubmit);
  themeToggle.addEventListener("click", toggleTheme);
  applyTheme(currentTheme);

  // Initialize the theme from the stored value, or the system setting
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
}

// Run init once the DOM has loaded
document.addEventListener("DOMContentLoaded", init);
