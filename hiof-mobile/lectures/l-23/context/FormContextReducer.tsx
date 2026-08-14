// context/FormContextReducer.tsx

import type { Student } from "@/types";
import { createContext, useReducer, useContext, type ReactNode } from "react";

type FormStatus = "initial" | "dirty";

// The state type
type FormState = {
  status: FormStatus;
  data: Student | null; // A more specific type for the form data could go here
};

// Action types. Using constants instead of raw strings avoids typos and makes
// the code more robust and easier to maintain.
const FORM_ACTION = {
  SET_DIRTY: "SET_DIRTY",
  UPDATE_FORM_DATA: "UPDATE_FORM_DATA",
  RESET_FORM: "RESET_FORM",
} as const;

type FormActionType = (typeof FORM_ACTION)[keyof typeof FORM_ACTION];

// Action types with payload. A union type defines the different actions and
// their payloads.
type FormAction =
  | { type: typeof FORM_ACTION.SET_DIRTY }
  | { type: typeof FORM_ACTION.UPDATE_FORM_DATA; payload: Student }
  | { type: typeof FORM_ACTION.RESET_FORM };

// Initial values
const initialState: FormState = {
  status: "initial",
  data: null,
};

// Reducer function
function formReducer(state: FormState, action: FormAction): FormState {
  // Handles the different actions based on action.type, using a switch, and
  // updates the state accordingly
  switch (action.type) {
    case FORM_ACTION.SET_DIRTY:
      return { ...state, status: "dirty" };
    case FORM_ACTION.UPDATE_FORM_DATA:
      return {
        ...state,
        data: { ...(state.data ?? {}), ...action.payload },
        status: "dirty",
      };
    case FORM_ACTION.RESET_FORM:
      return initialState; // Reset to the initial values
    default:
      return state;
  }
}

// Context type, including the reducer functions
type FormContextType = {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
};

// Create the context
const FormContext = createContext<FormContextType>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export function FormContextReducerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
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
