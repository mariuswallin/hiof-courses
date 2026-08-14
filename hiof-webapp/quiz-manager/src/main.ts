type Category = "sport" | "music" | "movies";

// const cat: Category = "sports";

// const obj = {
//   id: "min-id"
// };

// obj.id

interface Quiz {
  id: string;
  title: string;
  questions: string[];
  answers: Answer[];
  category: Category;
  createdAt?: Date;
}

const q: Quiz = {
  id: "123",
  title: "Title",
  questions: [],
  answers: [],
  category: "movies",
};

// const ans = [{id:1, answer: "test"}]

interface Answer {
  id: number;
  answer: string;
}

const quizzes: Quiz[] = [];

const addQuiz = (data: Quiz) => {
  quizzes.push(data);
};

addQuiz(q);

const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find((quiz) => quiz.id === id);
};

const filterQuizByCategory = (filterCategory: Category): Quiz[] => {
  return quizzes.filter(({ category, ...rest }) => category === filterCategory);
};

const mySecret = {
  id: "21",
  password: "SuperViktig",
  name: "Lars",
};

const { password, ...safeObject } = mySecret;

filterQuizByCategory("music");

const getQuizAnswers = (quizId: string): Answer[] | undefined => {
  const quiz = getQuizById(quizId);
  if (!quiz) return;
  return quiz.answers;
  return quiz ? quiz.answers : undefined;
};

const printQuizAnswersCount = () => {
  return quizzes
    .map((quiz) => {
      const answers = getQuizAnswers(quiz.id);
      return `Quiz ID: ${quiz.id}, Answers Count: ${
        answers ? answers.length : 0
      }`;
    })
    .join("\n");
};

printQuizAnswersCount();
