// context/FormBasicContext.tsx

import { createContext, useState, useContext, type ReactNode } from "react";

// Types for the context
type FormContextType = {
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
};

// Create the context with default values
const FormContext = createContext<FormContextType>({
  isDirty: false,
  setIsDirty: () => {},
});

// Props for the provider
type FormProviderProps = {
  children: ReactNode;
};

// Provider component
export function FormProvider({ children }: FormProviderProps) {
  // The state being shared
  const [isDirty, setIsDirty] = useState(false);

  return (
    <FormContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </FormContext.Provider>
  );
}

// Hook for using the context
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  // Return the context
  return useContext(FormContext);
}
