// /src/app/lib/utils/params.ts

// Utility functions for handling URL query parameters (used on the server)
export const parseQueryParams = (
  searchParams: URLSearchParams,
  validKeys: string[] = []
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    if (!key || value === undefined || value === null || value === "") continue;

    if (validKeys.length > 0 && !validKeys.includes(key)) continue;

    if (!result[key]) {
      result[key] = [];
    }

    if (!result[key].includes(value)) {
      result[key].push(value);
    }
  }

  return result;
};

// Function to build query parameters from an object (used on the client)
export function buildQueryString<T extends Record<string, unknown>>(
  params: T
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

// Function to parse pagination parameters from a URL
export function parsePaginationParams(url: URL) {
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  return {
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 100 : limit,
  };
}
