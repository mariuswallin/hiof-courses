// js/robustLoading.js

async function robustDataLoading() {
  // Vis loading-state
  showLoadingIndicator();

  try {
    const response = await fetch("data.json");

    // Sjekk HTTP-status
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check that we got JSON
    const contentType = response.headers.get("content-type");

    // Throw if the content type is missing or not JSON. That happens when the
    // server returns the wrong format, or when a technical error prevents a
    // proper response.
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Forventet JSON, men fikk noe annet!");
    }

    // Convert the response to JSON
    const data = await response.json();

    // Valider datastruktur
    if (!Array.isArray(data)) {
      throw new Error("Forventet en array med utstillinger");
    }

    return data;
  } catch (error) {
    // Logg teknisk feil
    console.error("Teknisk feil:", error);

    // Vis brukervennlig melding
    if (error.name === "TypeError") {
      showUserError("Kunne ikke tolke serverdata. Kontakt support.");
    } else if (error.message.includes("HTTP")) {
      showUserError("Kunne ikke nå serveren. Sjekk internettforbindelsen.");
    } else {
      showUserError("Noe gikk galt. Prøv igjen senere.");
    }

    return []; // Fall back to an empty array
  } finally {
    hideLoadingIndicator();
  }
}
