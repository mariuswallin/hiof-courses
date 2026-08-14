// context/AuthProvider.tsx

import { ROLES, type User } from "@/types";

import { createContext, use, useCallback, useEffect, useState } from "react";
import uuid from "react-native-uuid";

// Helper that generates unique ids
const createId = () => {
  return uuid.v4();
};

// The shape and contents of the auth context
type AuthContextType = {
  user: User | null; // Current user, or null when signed out
  isLoading: boolean; // Whether authentication is in progress
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, admin: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean; // Convenience value for the role check
  isLoggedIn: boolean; // Convenience value for the sign-in status
  isLoaded: boolean; // Whether the initial user data has loaded
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAdmin: false,
  isLoggedIn: false,
  isLoaded: false,
});

// Simulated API call that loads the user
const getUser = async (fail = false, type: "USER" | "ADMIN" = "ADMIN") => {
  return new Promise<{ data: User | null }>((resolve) => {
    // Simulates one second of network latency
    setTimeout(() => {
      if (fail) {
        return resolve({
          data: null,
        });
      }
      resolve(
        type === "ADMIN"
          ? {
              data: {
                id: createId(),
                email: "admin@hiof.no",
                password: "admin",
                role: ROLES.ADMIN,
              },
            }
          : {
              data: {
                id: "123456",
                email: "user@hiof.no",
                password: "user",
                role: ROLES.USER,
              },
            }
      );
    }, 1000);
  });
};

// Main component that provides the auth context to its children
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // State holding the user data and loading status
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper that resets the loading flags
  const resetLoading = useCallback(() => {
    setLoading(false);
    setIsLoaded(true);
  }, []);

  const setLoadings = useCallback(() => {
    setLoading(true);
    setIsLoaded(false);
  }, []);

  // Load the user data on startup
  useEffect(() => {
    console.log("Fetching user data...");
    const fetchUserdata = async () => {
      setLoading(true);
      try {
        const { data } = await getUser(false, "ADMIN");
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        resetLoading();
      }
    };
    fetchUserdata();
  }, [resetLoading]);

  // Sign-in function — simulates an API call
  const login = async (email: string, password: string) => {
    // Simulates an API call
    setLoadings();
    console.log("Logging in with email:", email, "and password:", password);
    setTimeout(() => {
      setUser({ id: "123456", email, role: ROLES.USER });
      resetLoading();
    }, 1000);
  };

  // Sign-out function — simulates an API call
  const logout = async () => {
    setLoadings();
    // Simulates an API call
    setTimeout(() => {
      setUser(null);
      resetLoading();
    }, 1000);
  };

  // Sign-up function — simulates an API call
  const register = async (email: string, password: string, admin = false) => {
    // Simulates an API call
    setLoadings();
    setTimeout(() => {
      setUser({
        id: createId(),
        email,
        role: admin ? ROLES.ADMIN : ROLES.USER,
      });
      resetLoading();
    }, 1000);
  };

  // Return the context provider with all the values it needs
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loading,
        isAdmin: !!(user?.role === ROLES.ADMIN),
        isLoaded,
        isLoggedIn: !!(user !== null),
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to the auth context
export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
