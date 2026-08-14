// /app/config/api.ts

const APP_URL = "http://localhost:5173";
const APP_VERSION = "v1";
const API_URL = `/api/${APP_VERSION}`;
const API_BASE_URL = `${APP_URL}${API_URL}`;

const PORT = 5137;

export { PORT, APP_URL, API_URL, API_BASE_URL };
