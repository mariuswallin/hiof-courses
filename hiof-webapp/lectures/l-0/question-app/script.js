// State management with Map
const questions = new Map();
let currentTheme = "light";

// Modern async function for initialization
async function initApp() {
  loadQuestionsFromStorage();
  setupEventListeners();
  renderQuestions();
  initTheme();
}

// Event listeners using arrow functions and destructuring
function setupEventListeners() {
  const form = document.getElementById("question-form");
  const themeToggle = document.getElementById("theme-toggle");
  const difficultySlider = document.getElementById("difficulty");
  const difficultyOutput = document.getElementById("difficulty-value");

  // Form submission
  form?.addEventListener("submit", handleFormSubmit);

  // Theme toggle
  themeToggle?.addEventListener("click", toggleTheme);

  // Difficulty slider
  difficultySlider?.addEventListener("input", (e) => {
    difficultyOutput.textContent = e.target.value;
  });
}

// Async form handling with modern JavaScript
async function handleFormSubmit(event) {
  event.preventDefault();

  try {
    // Modern FormData API with destructuring
    const formData = new FormData(event.target);
    const { text, category, difficulty } = Object.fromEntries(formData);

    // Create question with modern object shorthand
    const question = createQuestion({
      text: text.trim(),
      category,
      difficulty: parseInt(difficulty),
    });

    questions.set(question.id, question);

    // Save and render
    saveQuestionsToStorage();
    renderQuestions();
    event.target.reset();
    showNotification("Spørsmål opprettet!", "success");
  } catch (error) {
    showNotification(error.message, "error");
  }
}

// Question creation with destructuring and default parameters
function createQuestion({ text = "", category = "", difficulty = 3 }) {
  if (!text.trim()) throw new Error("Spørsmålstekst er påkrevd");

  const question = {
    id: generateId(),
    text: text.trim(),
    category,
    difficulty,
    status: "published",
    createdAt: new Date(),
  };

  return question;
}

// ID generation
const generateId = () =>
  `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Rendering with template literals and modern array methods
function renderQuestions() {
  const container = document.getElementById("questions-list");
  if (!container) return;

  const questionsArray = Array.from(questions.values());

  if (questionsArray.length === 0) {
    container.innerHTML = "<p>Ingen spørsmål ennå. Opprett ditt første!</p>";
    return;
  }

  // Modern array methods for rendering
  container.innerHTML = questionsArray.map(createQuestionHTML).join("");

  // Event delegation for delete buttons
  container.addEventListener("click", handleQuestionActions);
}

// Template literal HTML generation with proper escaping
function createQuestionHTML(question) {
  const { id, text, category, difficulty, status, createdAt } = question;

  // Modern date formatting with Intl API
  const formattedDate = new Intl.DateTimeFormat("no-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));

  const difficultyStars = "★".repeat(difficulty) + "☆".repeat(5 - difficulty);

  return `
        <div class="question-card">
            <section class="question-details">
              <span class="status-${status}">${category}</span>
              <span>${difficultyStars}</span>
              <time>${formattedDate}</time>
            </section>
            <h3>${text}</h3>
            <div class="question-actions">
                <button
                    class="btn btn-danger"
                    data-action="delete"
                    data-id="${id}"
                    onclick="deleteQuestion('${id}')"
                >
                    Slett
                </button>
            </div>
        </div>
    `;
}

// Event delegation for actions
function handleQuestionActions(event) {
  const { target } = event;
  if (target.dataset.action === "delete") {
    deleteQuestion(target.dataset.id);
  }
}

// Question deletion with modern confirmation
function deleteQuestion(id) {
  const question = questions.get(id);
  if (!question) return;

  if (confirm(`Slett "${question.text}"?`)) {
    questions.delete(id);
    saveQuestionsToStorage();
    renderQuestions();
    showNotification("Spørsmål slettet", "success");
  }
}

// Theme management with CSS custom properties
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);

  const themeButton = document.getElementById("theme-toggle");
  themeButton.textContent = currentTheme === "light" ? "🌙" : "☀️";

  localStorage.setItem("theme", currentTheme);
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  currentTheme = savedTheme || (systemDark ? "dark" : "light");

  // Set theme explicitly
  document.documentElement.setAttribute("data-theme", currentTheme);

  const themeButton = document.getElementById("theme-toggle");
  themeButton.textContent = currentTheme === "light" ? "🌙" : "☀️";
}

// Data persistence
function saveQuestionsToStorage() {
  const questionsArray = Array.from(questions.values());
  localStorage.setItem("questions", JSON.stringify(questionsArray));
}

function loadQuestionsFromStorage() {
  const stored = localStorage.getItem("questions");
  if (stored) {
    JSON.parse(stored).forEach((q) => questions.set(q.id, q));
  }
}

// Simple notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style = {
    position: "fixed",
    top: "80px",
    right: "20px",
    padding: "12px 24px",
    background:
      type === "success" ? "var(--color-success)" : "var(--color-danger)",
    color: "white",
    borderRadius: "var(--radius-md)",
    zIndex: "1000",
  };

  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}

// Initialize app on DOM load
document.addEventListener("DOMContentLoaded", initApp);
