import crypto from "node:crypto";
import net from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as vite from "vite";
import { createLogger } from "vite";

const appRoot = process.cwd();
const scriptPath = path.resolve(appRoot, "./scripts/seed.ts");
const scriptUrl = pathToFileURL(scriptPath).href;

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("No port assigned")));
        return;
      }

      const { port } = address;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });

const waitForServer = async (port, retries = 30) => {
  const candidateUrls = [
    `http://localhost:${port}/__debug`,
    `http://127.0.0.1:${port}/__debug`,
    `http://[::1]:${port}/__debug`,
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    for (const candidateUrl of candidateUrls) {
      try {
        const response = await fetch(candidateUrl, {
          signal: AbortSignal.timeout(1500),
        });

        if (response.ok) {
          return candidateUrl;
        }
      } catch {
      }
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error(`Timed out waiting for debug server at port ${port}.`);
};

const main = async () => {
  process.env.RWSDK_WORKER_RUN = "1";
  const token = crypto.randomBytes(32).toString("hex");
  process.env.VITE_RWSDK_WORKER_RUN_TOKEN = token;

  const port = await getFreePort();
  const server = await vite.createServer({
    logLevel: "silent",
    build: {
      outDir: ".rwsdk",
    },
    customLogger: createLogger("info", {
      prefix: "[rwsdk]",
      allowClearScreen: true,
    }),
    server: {
      port,
      host: "localhost",
    },
  });

  try {
    await server.listen();
    const readyUrl = await waitForServer(port, 30);
    const readyOrigin = new URL(readyUrl).origin;
    const readyOriginUrl = new URL(readyOrigin);
    const candidateBaseUrls = Array.from(
      new Set([
        readyOrigin,
        `${readyOriginUrl.protocol}//127.0.0.1:${readyOriginUrl.port}`,
        `${readyOriginUrl.protocol}//[::1]:${readyOriginUrl.port}`,
      ]),
    );

    let response;
    for (const baseUrl of candidateBaseUrls) {
      const url = `${baseUrl}/__worker-run?script=${encodeURIComponent(scriptUrl)}`;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          response = await fetch(url, {
            headers: {
              "x-rwsdk-worker-run-token": token,
            },
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            break;
          }
        } catch {
          if (attempt < 4) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }

      if (response && response.ok) {
        break;
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : "";
      throw new Error(
        errorText || `worker-run fetch failed with status ${response?.status ?? "unknown"}`,
      );
    }

    const body = await response.text();
    console.log(body);
  } finally {
    await server.close();
  }
};

main().catch((error) => {
  console.error("Windows seed runner failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
