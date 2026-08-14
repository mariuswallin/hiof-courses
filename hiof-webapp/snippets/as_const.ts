export const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// Status will be a union of the values of the STATUS object
// Ex. "idle" | "loading" | "success" | "error"
export type Status = (typeof STATUS)[keyof typeof STATUS];

export type Question = {
  id: string;
  text: string;
  status: Status;
};

const q: Question = {
  id: "1",
  text: "What is your favorite color?",
  status: STATUS.LOADING,
};
