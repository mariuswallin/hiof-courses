// context/ProfileContext.tsx

import type { Profile } from "@/types";
import { createContext, useState, useContext, type ReactNode } from "react";

// Types for the context
type ProfileContextType = {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
};

// Create the context with default values
const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
});

// Props for the provider
type ProfileProviderProps = {
  children: ReactNode;
};

// Provider component
export function ProfileProvider({ children }: ProfileProviderProps) {
  // The state being shared
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Hook for using the context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  // Return the context
  return useContext(ProfileContext);
}
