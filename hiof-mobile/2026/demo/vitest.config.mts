import { defineConfig } from "vitest/config";
import { vitestExpo } from "vitest-expo";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// .mts because the app's package.json is not "type": "module".
//
// vitest-expo runs the tests against the real react-native, so components
// behave as they do on device. `globals: true` gives describe/it/expect
// without importing them, but the test files import them anyway because that
// reads more clearly.
export default defineConfig({
  plugins: [vitestExpo()],
  resolve: {
    // Mirrors `paths` in tsconfig.json. tsconfig only teaches the type
    // checker; Vite needs telling separately.
    alias: { "@": root },
  },
  test: {
    globals: true,
    // Stubs react-native-appwrite for every test. See the file for why.
    setupFiles: ["./test/setup.ts"],
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  },
});
