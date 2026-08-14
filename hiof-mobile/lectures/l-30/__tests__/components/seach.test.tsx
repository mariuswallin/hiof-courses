import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
} from "@testing-library/react-native";

import Search from "@/components/Search";

// === MOCK FUNCTIONS ===
// We mock the expo-router functions so the URL parameters are under our control
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
 * Helper that renders the Search component with the standard setup.
 * RNTL 14 + React 19: `render` is async, so this must be awaited.
 */
async function renderSearch(props = {}) {
  return render(<Search {...props} />);
}

/**
 * Helper that returns the search field
 */
function getSearchInput() {
  return screen.getByPlaceholderText("Søk etter profil");
}

/**
 * Helper that simulates typing in the search field
 */
async function typeInSearchInput(text: string) {
  const input = getSearchInput();
  await userEvent.type(input, text);
  return input;
}

/**
 * Helper that simulates submitting the search field
 */
function submitSearch() {
  const input = getSearchInput();
  fireEvent(input, "submitEditing");
  return input;
}

// === MAIN TESTS ===

describe("Search Component", () => {
  // === SETUP AND TEARDOWN ===

  beforeEach(() => {
    // Fake timers, to test the debouncing
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Standard mock-oppsett: ingen URL-parameter
    mockUseLocalSearchParams.mockReturnValue({ query: undefined });
  });

  afterEach(() => {
    // Clean up after each test
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // === RENDERING TESTS ===

  describe("Component Rendering", () => {
    test("should render search input with correct placeholder", async () => {
      // ARRANGE & ACT: Render the component
      await renderSearch();

      // ASSERT: Verify the search field renders with the right placeholder
      expect(screen.getByPlaceholderText("Søk etter profil")).toBeOnTheScreen();
    });

  });

  // === INITIAL STATE TESTS ===

  describe("Initial State", () => {
    test("should initialize with empty input when no URL params exist", async () => {
      // ARRANGE: Ingen URL-parametere
      mockUseLocalSearchParams.mockReturnValue({ query: undefined });

      // ACT: Render the component
      await renderSearch();

      // ASSERT: Verify the input is empty
      const input = getSearchInput();
      expect(input).toHaveDisplayValue("");
    });

    test("should initialize with URL parameter value when present", async () => {
      // ARRANGE: Sett URL-parameter
      mockUseLocalSearchParams.mockReturnValue({ query: "initial search" });

      // ACT: Render the component
      await renderSearch();

      // ASSERT: Verify the input holds the URL parameter value
      const input = getSearchInput();
      expect(input).toHaveDisplayValue("initial search");
    });
  });

  // === TEXT INPUT BEHAVIOR TESTS ===

  describe("Text Input Behavior", () => {
    test("should update input value when user types", async () => {
      // ARRANGE: Render the component
      await renderSearch();

      // ACT: Type in the search field
      const input = await typeInSearchInput("test query");

      // ASSERT: Verifiser at input-verdi oppdateres
      expect(input).toHaveDisplayValue("test query");
    });

    test("should call debounced setParams when text changes", async () => {
      // ARRANGE: Render the component
      await renderSearch();

      // ACT: Type text and wait for the debounce
      await typeInSearchInput("test");
      await act(async () => { jest.advanceTimersByTime(500); }); // Simuler at debounce-tiden passerer

      // ASSERT: Verify that the URL parameters are updated
      expect(mockSetParams).toHaveBeenCalledWith({ query: "test" });
    });

    test("should not call setParams for empty text", async () => {
      // ARRANGE: Render the component
      await renderSearch();

      // ACT: Type text, wait for the debounce, then delete it all
      await typeInSearchInput("test");
      await act(async () => { jest.advanceTimersByTime(500); });
      await userEvent.clear(getSearchInput());

      // ASSERT: Verify only non-empty text sends parameters
      expect(mockSetParams).toHaveBeenCalledWith({ query: "test" });
      expect(mockSetParams).not.toHaveBeenCalledWith({ query: "" });
    });

    test("should handle multiple rapid text changes with debouncing", async () => {
      // ARRANGE: Render the component
      await renderSearch();

      // ACT: Type several characters in quick succession
      const input = getSearchInput();
      await userEvent.type(input, "a");
      await userEvent.type(input, "b");
      await userEvent.type(input, "c");
      await act(async () => { jest.advanceTimersByTime(500); }); // Only the last value should be sent

      // ASSERT: Verify only the last value is sent after the debounce
      expect(mockSetParams).toHaveBeenCalledWith({ query: "abc" });
      expect(mockSetParams).toHaveBeenCalledTimes(1);
    });
  });

  // === SEARCH SUBMISSION TESTS ===

  describe("Search Submission", () => {
    test("should call onSearch callback with current input value on submit", async () => {
      // ARRANGE: Render with an onSearch callback
      const mockOnSearch = jest.fn();
      await renderSearch({ onSearch: mockOnSearch });

      // ACT: Type text and submit
      await typeInSearchInput("test query");
      submitSearch();

      // ASSERT: Verify the callback is called with the right value
      expect(mockOnSearch).toHaveBeenCalledWith("test query");
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    test("should not call onSearch when input is empty", async () => {
      // ARRANGE: Render with an onSearch callback
      const mockOnSearch = jest.fn();
      await renderSearch({ onSearch: mockOnSearch });

      // ACT: Submit without typing anything
      submitSearch();

      // ASSERT: Verify the callback is not called for empty input
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    test("should not call onSearch when input contains only whitespace", async () => {
      // ARRANGE: Render with an onSearch callback.
      // A mock function for onSearch lets us verify the calls.
      const mockOnSearch = jest.fn();
      await renderSearch({ onSearch: mockOnSearch });

      // ACT: Type only spaces and submit
      await typeInSearchInput("   ");
      submitSearch();

      // ASSERT: Verify the callback is not called for whitespace only
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    test("should work gracefully without onSearch prop", async () => {
      // ARRANGE & ACT: Render without onSearch and submit.
      // This must not throw.
      await renderSearch();
      expect(() => submitSearch()).not.toThrow();
    });
  });

  // === URL PARAMETER HANDLING TESTS ===

  describe("URL Parameter Handling", () => {
    test("should update URL params through debounced callback", async () => {
      // ARRANGE: Render the component
      await renderSearch();

      // ACT: Type a search term and wait for the debounce
      await typeInSearchInput("search term");
      await act(async () => { jest.advanceTimersByTime(500); });

      // ASSERT: Verify that the URL parameters are updated
      expect(mockSetParams).toHaveBeenCalledWith({ query: "search term" });
    });

    test("should debounce multiple rapid changes correctly", async () => {
      // ARRANGE: Render the component
      await renderSearch();
      const input = getSearchInput();

      // ACT: Make several quick changes
      await userEvent.type(input, "a");
      await act(async () => { jest.advanceTimersByTime(100); }); // Not enough time for the debounce

      await userEvent.type(input, "b");
      await act(async () => { jest.advanceTimersByTime(100); }); // Still not enough time

      await userEvent.type(input, "c");
      await act(async () => { jest.advanceTimersByTime(500); }); // Now the debounce should fire

      // ASSERT: Only the last value should be sent
      expect(mockSetParams).toHaveBeenCalledWith({ query: "abc" });
      expect(mockSetParams).toHaveBeenCalledTimes(1);
    });
  });

  // === TESTING THE FLOW ===

  describe("Testing the complete flow", () => {
    test("should handle complete user flow: initialize from URL, type, and submit", async () => {
      // ARRANGE: Set the initial URL parameter and an onSearch callback
      mockUseLocalSearchParams.mockReturnValue({ query: "initial" });
      const mockOnSearch = jest.fn();
      await renderSearch({ onSearch: mockOnSearch });

      // ACT & ASSERT: Verifiser initial verdi
      const input = getSearchInput();
      expect(input).toHaveDisplayValue("initial");

      // ACT: Delete and type new text
      await userEvent.clear(input);
      await typeInSearchInput("new search");
      await act(async () => { jest.advanceTimersByTime(500); });

      // ASSERT: Verify that the URL parameters are updated
      expect(mockSetParams).toHaveBeenCalledWith({ query: "new search" });

      // ACT: Submit the search
      submitSearch();

      // ASSERT: Verifiser at onSearch kalles
      expect(mockOnSearch).toHaveBeenCalledWith("new search");
    });

    test("should handle edge case with special characters", async () => {
      // ARRANGE: Render the component
      await renderSearch();

      // ACT: Type text with special characters
      await typeInSearchInput("test@example.com");
      await act(async () => { jest.advanceTimersByTime(500); });

      // ASSERT: Verify special characters are handled correctly
      expect(mockSetParams).toHaveBeenCalledWith({ query: "test@example.com" });
    });
  });
});
