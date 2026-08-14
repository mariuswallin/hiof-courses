// context/AuthProvider.tsx

import {
  type User,
  signUpAndLogin,
  loginAndGetUser,
  logout,
  getUserWithRole,
} from "@/providers/appwrite/auth";
import { ROLES } from "@/types";

import { createContext, use, useCallback, useEffect, useState } from "react";

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
    const fetchUserdata = async () => {
      setLoading(true);
      const result = await getUserWithRole();
      setUser(result.success ? result.data : null);
      resetLoading();
    };
    fetchUserdata();
  }, [resetLoading]);

  // Sign-in function — simulates an API call
  const loginUser = async (email: string, password: string) => {
    setLoadings();
    const result = await loginAndGetUser(email, password);
    setUser(result.success ? result.data : null);
    resetLoading();
  };

  // Sign-out function — simulates an API call
  const logoutUser = async () => {
    setLoadings();
    await logout();
    setUser(null);
    resetLoading();
  };

  // Sign-up function — simulates an API call
  const registerUser = async (
    email: string,
    password: string,
    admin: boolean
  ) => {
    setLoadings();
    const result = await signUpAndLogin(email, password, admin);
    setUser(result.success ? result.data : null);
    resetLoading();
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
        login: loginUser,
        logout: logoutUser,
        register: registerUser,
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
