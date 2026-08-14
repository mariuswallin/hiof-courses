// js/app.js

console.log("App script loaded");

const form = document.getElementById("exhibition-form");

const validateForm = (data = {}) => {
  const errors = [];
  if (!data.title || data.title.trim() === "") {
    errors.push("Tittel er påkrevd.");
  }
  // Add more validations here as needed
  return errors;
};

// Handle form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default submit

  const formData = new FormData(form);
  const exhibition = {
    title: formData.get("title"),
    // ... other data we ought to include
  };

  // Validate the form
  const errors = validateForm(exhibition);
  if (errors.length > 0) {
    // On validation errors, show them and stop the submit
    alert("Feil i skjemaet:\n" + errors.join("\n"));
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true; // Disable the button to prevent double clicks
  submitButton.textContent = "Sender..."; // Change the button text as feedback

  // try/catch to handle submit errors
  try {
    // POST the data to the "/exhibitions" URL
    const response = await fetch("/exhibitions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Convert the exhibition to JSON
      body: JSON.stringify(exhibition),
    });

    // Check that the response is OK (status 200-299)
    if (!response.ok) {
      throw new Error("Nettverksrespons var ikke OK");
    }

    // Read the JSON body from the response
    const data = await response.json();
    console.log("Utstilling lagret:", data);
    form.reset(); // Clear the form after submitting
  } catch (error) {
    console.error("Feil ved innsending av utstilling:", error);
  } finally {
    submitButton.disabled = false; // Aktiver knappen igjen
    submitButton.textContent = "Legg til utstilling";
  }
});
