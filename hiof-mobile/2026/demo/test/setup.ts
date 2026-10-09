// test/setup.ts. Runs before every test file, see vitest.config.mts
//
// react-native-appwrite pulls in expo-modules-core, which ships untranspiled
// TypeScript. vitest-native cannot strip types inside node_modules, so any test
// that touches the provider layer would fail on import.
//
// The SDK is stubbed here once, globally. Tests never talk to Appwrite anyway:
// they run against the in-memory mock backend in providers/mock.
//
// This is a limitation of the test runner, not of the app. Metro handles the
// same imports fine, so the app itself is unaffected.
import { vi } from "vitest";

vi.mock("react-native-appwrite", () => {
  class AppwriteException extends Error {
    constructor(
      message: string,
      public code: number,
      public type = "",
    ) {
      super(message);
      this.name = "AppwriteException";
    }
  }

  return {
    AppwriteException,
    Client: class {
      setEndpoint() {
        return this;
      }
      setProject() {
        return this;
      }
      setPlatform() {
        return this;
      }
    },
    Account: class {},
    TablesDB: class {},
    Storage: class {},
    ID: { unique: () => `id-${Math.random().toString(36).slice(2)}` },
    Query: {
      equal: (field: string, value: unknown) => ({ field, value }),
      orderAsc: (field: string) => ({ field, dir: "asc" }),
      orderDesc: (field: string) => ({ field, dir: "desc" }),
      limit: (n: number) => ({ limit: n }),
    },
  };
});
