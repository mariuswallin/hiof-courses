import { STATUS, type Status } from "./as_const";

const mockQuestions = [
  {
    id: "1",
    question: "What is your favorite color?",
    status: STATUS.IDLE,
  },
  {
    id: "2",
    question: "What is your favorite food?",
    status: STATUS.LOADING,
  },
  {
    id: "3",
    question: "What is your favorite animal?",
    status: STATUS.SUCCESS,
  },
  {
    id: "4",
    question: "What is your favorite movie?",
    status: STATUS.ERROR,
  },
];

const filter = (searchTerm?: string, statusFilter: Status | "all" = "all") => {
  // Add this function inside the component
  const filteredQuestions = mockQuestions.filter((question) => {
    // First check if question matches search term
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm?.toLowerCase() || "");

    // Then check if status matches filter
    const matchesStatus =
      statusFilter === "all" || question.status === statusFilter;

    // Question must fulfill both criteria to be included
    return matchesSearch && matchesStatus;
  });

  return filteredQuestions;
};

filter("animal", "success"); //?

const betterFilter = (
  filters: {
    searchTerm: string;
    statusFilter: Status | "all";
  } = {
    searchTerm: "",
    statusFilter: "all",
  }
) => {
  const { searchTerm, statusFilter } = filters;
  // Add this function inside the component
  const filteredQuestions = mockQuestions.filter((question) => {
    // First check if question matches search term
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm?.toLowerCase() || "");

    // Then check if status matches filter
    const matchesStatus =
      statusFilter === "all" || question.status === statusFilter;

    // Question must fulfill both criteria to be included
    return matchesSearch && matchesStatus;
  });
};
