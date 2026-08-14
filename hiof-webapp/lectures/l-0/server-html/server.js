// server.js

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();
app.use("/*", cors());
app.use("/static/*", serveStatic({ root: "./" }));

// Our data — a list of exhibitions
const exhibitions = [
  {
    title: "Vårens Utstilling",
  },
  {
    title: "Abstrakte Visjoner",
  },
  {
    title: "Naturens Lyder",
  },
  {
    title: "Byens Puls",
  },
];

// HTML sent to the client. Note ${exhibitions.length} — that part is dynamic.
const pageHTML = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="./static/styles.css">
    <title>Utstillingsoversikt</title>
</head>
<body>
    <h1>Du har ${exhibitions.length} utstillinger</h1>
    <div id="exhibition-id"></div>
    <img src="./static/webapp.png" alt="Exhibition logo" />
    <script type="module" src="./static/index.js"></script>
</body>
</html>`;

// Serve HTML on the main page
app.get("/", (c) => {
  return c.html(pageHTML);
});

// Serve the exhibition data as JSON on /exhibitions
app.get("/exhibitions", (c) => {
  return c.json(exhibitions);
});

const port = 3999;
console.log(`Server kjører på port ${port}`);

// Start the server
serve({
  fetch: app.fetch,
  port,
});
