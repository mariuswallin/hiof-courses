// context/QueryProvider.tsx

import type React from "react";
import {
  QueryClient,
  QueryClientProvider as QueryProvider,
} from "@tanstack/react-query";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutter
      retry: 2,
    },
  },
});

type QueryProviderProps = {
  children: React.ReactNode;
};

export const QueryClientProvider = ({ children }: QueryProviderProps) => {
  return <QueryProvider client={queryClient}>{children}</QueryProvider>;
};

// Export queryClient in case other files need it
export { queryClient };
