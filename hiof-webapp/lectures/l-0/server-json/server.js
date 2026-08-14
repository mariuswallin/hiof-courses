// Import the required modules
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import fs from "node:fs/promises";

// Oppretter en ny Hono-applikasjon
const app = new Hono();

// Enable CORS (Cross-Origin Resource Sharing) for all routes
app.use("/*", cors());

// Load data from a JSON file
async function loadData() {
  try {
    const data = await fs.readFile("./data.json", "utf8");
    console.log(`Lastet ${data.length} utstillinger`);
    return JSON.parse(data);
  } catch (error) {
    console.error("Feil ved lasting av data:", error);
  }
}

// GET / — return all exhibitions
app.get("/", async (c) => {
  const exhibitions = await loadData();
  return c.json(exhibitions);
});

const port = 3999;

serve({
  fetch: app.fetch,
  port,
});
