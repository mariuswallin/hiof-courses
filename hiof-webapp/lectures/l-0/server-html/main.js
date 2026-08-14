// Wait until the HTML has finished loading
document.addEventListener("DOMContentLoaded", function () {
  // Fetch data from the server
  fetch("http://localhost:3999/exhibitions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json()) // Convert the response to JSON
    .then((data) => {
      // Log the data so the structure is visible
      console.log(data);

      // Find the ul element the exhibitions render into
      const exhibitionList = document.getElementById("exhibition-list");

      // Loop over each exhibition and build an li element
      data.forEach((exhibition) => {
        let listItem = document.createElement("li");
        listItem.textContent = `${exhibition.title}`;
        exhibitionList.appendChild(listItem);
      });
    });
});
