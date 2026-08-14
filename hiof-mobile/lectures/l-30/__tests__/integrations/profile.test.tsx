// __tests__/integrations/profile.test.tsx

import "@/msw.polyfills";
import React from "react";
import {
  render,
  screen,
  waitFor,
  userEvent,
} from "@testing-library/react-native";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/native";
import { Text } from "react-native";

import ProfileSearch from "../../components/ProfileSearch";
import { ProfileProvider } from "@/context/ProfileContext";
import type { Profile, Student } from "@/types";

// === OPPSETT AV MOCK-SERVER ===
// MSW (Mock Service Worker) lar oss simulere API-kall i testene
const server = setupServer();

// === MOCK FUNCTIONS ===
// We mock the expo-router functions so the URL parameters are under our control
const mockOnProfilePress = jest.fn();
const mockSetParams = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: {
    setParams: jest.fn((params) => mockSetParams(params)),
  },
  useLocalSearchParams: jest.fn(() => mockUseLocalSearchParams()),
}));

// === HELPERS ===

/**
 * Helper that sets up an API mock returning profiles
 */
function setupProfilesApiMock(
  profiles: Profile[] = [],
  students: Student[] = []
) {
  server.use(
    http.get("*/tablesdb/*/tables/profiles/rows", ({ request }) => {
      return HttpResponse.json({
        total: profiles.length,
        rows: profiles,
      });
    }),
    http.get("*/tablesdb/*/tables/students/rows", () => {
      return HttpResponse.json({
        total: students.length,
        rows: students,
      });
    })
  );
}

/**
 * Helper that sets up an API mock simulating an error
 */
function setupApiErrorMock() {
  server.use(
    http.get("*/tablesdb/*/tables/students/rows", () => {
      return HttpResponse.json({ total: 0, rows: [] });
    }),
    http.get("*/tablesdb/*/tables/profiles/rows", () => {
      return HttpResponse.json(
        { message: "Database connection failed", code: "500" },
        { status: 500 }
      );
    })
  );
}

/**
 * Helper that renders the component with the standard setup.
 * RNTL 14 + React 19: `render` is async, so this must be awaited.
 */
async function renderProfileSearch(
  children = <Text testID="child-content">Form Content</Text>
) {
  return render(
    <ProfileProvider>
      <ProfileSearch onProfilePress={mockOnProfilePress}>
        {children}
      </ProfileSearch>
    </ProfileProvider>
  );
}

// === TEST DATA ===
const testProfiles: Profile[] = [
  {
    userId: "user-123",
    email: "anna@example.com",
  },
  {
    userId: "user-456",
    email: "per@example.com",
  },
];

const testStudents = [
  {
    $id: "student-1",
    id: 1234657,
    name: "Eksisterende Student",
    userId: "user-456", // Denne profilen er allerede i bruk
    program: "informatikk",
    isActive: true,
    image: null,
    expireAt: "2024-12-31T23:59:59.000Z",
  },
];

// === MAIN TESTS ===

describe("ProfileSearch Component", () => {
  // === SETUP AND TEARDOWN ===

  beforeAll(() => {
    // Start the mock server before all tests
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    // Stop the mock server after all tests
    server.close();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // Default mock setup: no search parameter
    mockUseLocalSearchParams.mockReturnValue({ query: "" });
  });

  afterEach(() => {
    // Reset the API handlers after each test
    server.resetHandlers();
  });

  // === INITIAL RENDERING TESTS ===

  describe("Initial State", () => {
    test("should display search field and empty state when no search is performed", async () => {
      // ARRANGE: Set up the component without a search parameter
      mockUseLocalSearchParams.mockReturnValue({ query: undefined });

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Verifiser at riktige elementer vises
      expect(await screen.findByTestId("search-input")).toBeOnTheScreen();
      expect(await screen.findByTestId("empty-state")).toBeOnTheScreen();
      expect(
        await screen.findByText("Du må søke og velge en profil")
      ).toBeOnTheScreen();
      expect(screen.queryByTestId("child-content")).not.toBeOnTheScreen();
    });

    test("should show loading indicator while search is in progress", async () => {
      // ARRANGE: Mock an API that takes a moment to answer
      mockUseLocalSearchParams.mockReturnValue({
        query: "loading@example.com",
      });

      server.use(
        http.get("*/tablesdb/*/tables/profiles/rows", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ total: 0, rows: [] });
        }),
        http.get("*/tablesdb/*/tables/students/rows", () => {
          return HttpResponse.json({ total: 0, rows: [] });
        })
      );

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Verify the loading indicator shows first
      expect(screen.getByTestId("activity-indicator")).toBeOnTheScreen();

      // Wait until loading has finished
      await waitFor(() => {
        expect(
          screen.queryByTestId("activity-indicator")
        ).not.toBeOnTheScreen();
      });
    });
  });

  // === PROFILE SEARCH TESTS ===

  describe("Profile Search and Display", () => {
    test("should fetch and display available profiles based on search", async () => {
      // ARRANGE: Set up a search parameter and the mocked API response
      mockUseLocalSearchParams.mockReturnValue({ query: "anna@example.com" });
      setupProfilesApiMock([testProfiles[0]], testStudents);

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Verifiser at profil vises
      expect(
        await screen.findByText("Profil anna@example.com")
      ).toBeOnTheScreen();
    });

    test("should filter out profiles that are already in use", async () => {
      // ARRANGE: The API returns both profiles, but one is already taken
      mockUseLocalSearchParams.mockReturnValue({ query: "test" });
      setupProfilesApiMock(testProfiles, testStudents);

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Only the available profile should show
      expect(
        await screen.findByText("Profil anna@example.com")
      ).toBeOnTheScreen();
      expect(
        screen.queryByText("Profil per@example.com")
      ).not.toBeOnTheScreen();
    });

    test("should show message when no profiles are found", async () => {
      // ARRANGE: Empty response from the API
      mockUseLocalSearchParams.mockReturnValue({
        query: "finnesikke@example.com",
      });
      setupProfilesApiMock([], []);

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Verifiser "ingen resultater" melding
      expect(
        await screen.findByText(
          'Ingen resultater funnet for "finnesikke@example.com".'
        )
      ).toBeOnTheScreen();
    });
  });

  // === PROFILE SELECTION TESTS ===

  describe("Profile Selection and Interaction", () => {
    test("should handle profile selection and show child content", async () => {
      // ARRANGE: Sett opp én tilgjengelig profil
      mockUseLocalSearchParams.mockReturnValue({ query: "anna@example.com" });
      setupProfilesApiMock([testProfiles[0]], []);
      const user = userEvent.setup();

      // ACT: Render and tap a profile
      await renderProfileSearch();

      const profileCard = await screen.findByTestId("profile-card");
      await user.press(profileCard);

      // ASSERT: Verify the callback fires and the child content shows
      expect(mockOnProfilePress).toHaveBeenCalledWith(testProfiles[0]);
      expect(await screen.findByTestId("child-content")).toBeOnTheScreen();
    });

    test("should handle profile deselection", async () => {
      // ARRANGE: Set up a profile and select it first
      mockUseLocalSearchParams.mockReturnValue({ query: "anna@example.com" });
      setupProfilesApiMock([testProfiles[0]], []);
      const user = userEvent.setup();

      await renderProfileSearch();

      // Select a profile first
      const profileCard = await screen.findByTestId("profile-card");
      await user.press(profileCard);

      // ACT: Tap the selected profile to deselect it
      const selectedCard = await screen.findByTestId("selected-profile-card");
      await user.press(selectedCard);

      // ASSERT: Verifiser at profil fjernes
      expect(mockOnProfilePress).toHaveBeenLastCalledWith(undefined);
    });
  });

  // === ERROR HANDLING TESTS ===

  describe("Error Handling", () => {
    test("should handle API errors gracefully", async () => {
      // ARRANGE: Set up an API that returns an error
      mockUseLocalSearchParams.mockReturnValue({ query: "error@example.com" });
      setupApiErrorMock();

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Verifiser at feilmelding vises
      expect(
        await screen.findByText("Failed to fetch profiles")
      ).toBeOnTheScreen();
    });
  });

  // === STATE MANAGEMENT TESTS ===

  describe("Handling different states", () => {
    test("should show correct message when profiles are available but none selected", async () => {
      // ARRANGE: Profiler tilgjengelig, men ingen valgt
      mockUseLocalSearchParams.mockReturnValue({
        query: "available@example.com",
      });
      setupProfilesApiMock([testProfiles[0]], []);

      // ACT: Render the component
      await renderProfileSearch();

      // ASSERT: Verifiser meldinger
      expect(
        await screen.findByText("Profil anna@example.com")
      ).toBeOnTheScreen();
      expect(
        screen.getByText("Velg en profil for å se skjema")
      ).toBeOnTheScreen();
    });

    test("should reset profiles when search is cleared", async () => {
      // ARRANGE: Start with a search, then remove it
      setupProfilesApiMock(testProfiles, testStudents);

      // ACT: Render with a search first (render is async in @testing-library v14)
      const { rerender } = await renderProfileSearch();

      // No search to begin with
      expect(await screen.findByTestId("empty-state")).toBeOnTheScreen();

      // Add a search
      mockUseLocalSearchParams.mockReturnValue({ query: "testing" });
      await rerender(
        <ProfileProvider>
          <ProfileSearch onProfilePress={mockOnProfilePress}>
            <Text testID="child-content">Form Content</Text>
          </ProfileSearch>
        </ProfileProvider>
      );

      expect(
        await screen.findByText("Profil anna@example.com")
      ).toBeOnTheScreen();

      // Remove the search
      mockUseLocalSearchParams.mockReturnValue({ query: "" });
      await rerender(
        <ProfileProvider>
          <ProfileSearch onProfilePress={mockOnProfilePress}>
            <Text testID="child-content">Form Content</Text>
          </ProfileSearch>
        </ProfileProvider>
      );

      // ASSERT: Verify the profiles are gone
      expect(
        screen.queryByText("Profil anna@example.com")
      ).not.toBeOnTheScreen();
      expect(
        screen.getByText("Du må søke og velge en profil")
      ).toBeOnTheScreen();
    });
  });
});
