// app/data/questions.ts

import type { Question, QuestionStatus } from "../types/question";

export const questions: Question[] = [
  {
    id: "1",
    question: "Hva er hovedformålet med React hooks?",
    answers: [
      { id: "1a", answer: "Å erstatte class-komponenter" },
      { id: "1b", answer: "Å håndtere state i funksjonelle komponenter" },
      { id: "1c", answer: "Å forbedre performance" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    question: "Hvordan fungerer state management i React applikasjoner?",
    answers: [
      { id: "2a", answer: "Gjennom useState hook" },
      { id: "2b", answer: "Med Redux eller Context API" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    question: "Hva er fordelene med TypeScript i React?",
    answers: [
      { id: "3a", answer: "Type-sikkerhet" },
      { id: "3b", answer: "Bedre IDE-støtte" },
      { id: "3c", answer: "Færre runtime-feil" },
    ],
    status: "archived" as QuestionStatus,
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "4",
    question: "Hva er forskjellen mellom useEffect og useLayoutEffect?",
    answers: [
      {
        id: "4a",
        answer: "useLayoutEffect kjører synkront etter DOM-oppdateringer",
      },
      { id: "4b", answer: "useEffect kjører asynkront etter paint" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "5",
    question: "Hvordan kan du optimalisere ytelsen i en React-applikasjon?",
    answers: [
      { id: "5a", answer: "Bruke React.memo for å unngå unødvendige re-renders" },
      { id: "5b", answer: "Implementere lazy loading for komponenter" },
      {
        id: "5c",
        answer: "Bruke useCallback og useMemo for å memoize funksjoner og verdier",
      },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-08"),
  },
  {
    id: "6",
    question: "Hva er en React Context?",
    answers: [
      { id: "6a", answer: "En måte å dele data mellom komponenter uten props" },
      { id: "6b", answer: "En type komponent som håndler state" },
      { id: "6c", answer: "En metode for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-07"),
  },
  {
    id: "7",
    question: "Hva brukes useRef til i React?",
    answers: [
      { id: "7a", answer: "Lagre mutable verdier som ikke trigger re-render" },
      { id: "7b", answer: "Opprette referanser til DOM-elementer" },
      { id: "7c", answer: "Håndtere sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-06"),
  },
  {
    id: "8",
    question: "Hva er forskjellen på controlled og uncontrolled komponenter?",
    answers: [
      { id: "8a", answer: "Controlled styres av React state" },
      { id: "8b", answer: "Uncontrolled bruker DOM direkte" },
      { id: "8c", answer: "Controlled bruker useRef" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "9",
    question: "Hva er formålet med useMemo?",
    answers: [
      { id: "9a", answer: "Memoisere verdier for å unngå dyre beregninger" },
      { id: "9b", answer: "Lagre referanser til DOM-elementer" },
      { id: "9c", answer: "Opprette sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-04"),
  },
  {
    id: "10",
    question: "Hvordan kan du håndtere asynkrone kall i useEffect?",
    answers: [
      { id: "10a", answer: "Bruke async funksjon inne i useEffect" },
      { id: "10b", answer: "Bruke en separat funksjon og kalle den" },
      { id: "10c", answer: "Bruke Promise direkte i useEffect" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "11",
    question: "Hva er en custom hook?",
    answers: [
      { id: "11a", answer: "En funksjon som bruker andre hooks" },
      { id: "11b", answer: "En komponent med spesialfunksjon" },
      { id: "11c", answer: "En hook fra React-biblioteket" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "12",
    question: "Hva brukes useCallback til?",
    answers: [
      {
        id: "12a",
        answer: "Memoisere funksjoner for å unngå unødvendige re-renders",
      },
      { id: "12b", answer: "Lagre referanser til DOM-elementer" },
      { id: "12c", answer: "Opprette sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "13",
    question: "Hva er forskjellen på props og state?",
    answers: [
      { id: "13a", answer: "Props sendes fra foreldre, state er lokal" },
      { id: "13b", answer: "State kan ikke endres, props kan" },
      { id: "13c", answer: "Props brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-31"),
  },
  {
    id: "14",
    question: "Hva er en higher-order component (HOC)?",
    answers: [
      {
        id: "14a",
        answer: "En funksjon som tar en komponent og returnerer en ny komponent",
      },
      { id: "14b", answer: "En komponent med ekstra styling" },
      { id: "14c", answer: "En komponent som håndterer state" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-30"),
  },
  {
    id: "15",
    question: "Hva brukes Context API til?",
    answers: [
      { id: "15a", answer: "Dele data globalt mellom komponenter" },
      { id: "15b", answer: "Optimalisere ytelse" },
      { id: "15c", answer: "Lagre referanser til DOM-elementer" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-29"),
  },
  {
    id: "16",
    question: "Hva er en fragment i React?",
    answers: [
      { id: "16a", answer: "En wrapper som ikke gir ekstra DOM-elementer" },
      { id: "16b", answer: "En type komponent" },
      { id: "16c", answer: "En hook for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-28"),
  },
  {
    id: "17",
    question: "Hva er formålet med keys i lister?",
    answers: [
      { id: "17a", answer: "Identifisere elementer for effektiv oppdatering" },
      { id: "17b", answer: "Lagre referanser til DOM-elementer" },
      { id: "17c", answer: "Optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-27"),
  },
  {
    id: "18",
    question: "Hva er en portal i React?",
    answers: [
      { id: "18a", answer: "Render komponenter utenfor parent DOM-hierarki" },
      { id: "18b", answer: "En type hook" },
      { id: "18c", answer: "En metode for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-26"),
  },
  {
    id: "19",
    question: "Hva er forskjellen på useReducer og useState?",
    answers: [
      { id: "19a", answer: "useReducer er for kompleks state-logikk" },
      { id: "19b", answer: "useState brukes for enkel state" },
      { id: "19c", answer: "useReducer brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-25"),
  },
  {
    id: "20",
    question: "Hva er lazy loading i React?",
    answers: [
      { id: "20a", answer: "Laste komponenter kun når de trengs" },
      { id: "20b", answer: "Lagre referanser til DOM-elementer" },
      { id: "20c", answer: "Optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-24"),
  },
  {
    id: "21",
    question: "Hva er Suspense i React?",
    answers: [
      { id: "21a", answer: "Håndtere loading states for async komponenter" },
      { id: "21b", answer: "Memoisere verdier" },
      { id: "21c", answer: "Opprette sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-23"),
  },
  {
    id: "22",
    question: "Hva brukes Error Boundary til?",
    answers: [
      { id: "22a", answer: "Fange opp JavaScript-feil i komponenttreet" },
      { id: "22b", answer: "Optimalisere ytelse" },
      { id: "22c", answer: "Lagre referanser til DOM-elementer" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-22"),
  },
  {
    id: "23",
    question: "Hva er forskjellen på useEffect og componentDidMount?",
    answers: [
      { id: "23a", answer: "useEffect brukes i funksjonelle komponenter" },
      { id: "23b", answer: "componentDidMount brukes i class-komponenter" },
      { id: "23c", answer: "Begge brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-21"),
  },
  {
    id: "24",
    question: "Hva er en controlled form i React?",
    answers: [
      { id: "24a", answer: "Form-elementer styres av React state" },
      { id: "24b", answer: "Form-elementer styres av DOM" },
      { id: "24c", answer: "Form-elementer bruker useRef" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-20"),
  },
  {
    id: "25",
    question: "Hva er React Fiber?",
    answers: [
      { id: "25a", answer: "React sin nye reconciler for bedre ytelse" },
      { id: "25b", answer: "En type hook" },
      { id: "25c", answer: "En metode for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-19"),
  },
  {
    id: "26",
    question: "Hva er forskjellen på useImperativeHandle og useRef?",
    answers: [
      {
        id: "26a",
        answer: "useImperativeHandle tilpasser ref-verdier for parent",
      },
      { id: "26b", answer: "useRef lagrer mutable verdier" },
      { id: "26c", answer: "Begge brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-18"),
  },
  {
    id: "27",
    question: "Hva er en render prop?",
    answers: [
      { id: "27a", answer: "En funksjon som returnerer React-elementer" },
      { id: "27b", answer: "En prop som lagrer state" },
      { id: "27c", answer: "En prop som brukes for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-17"),
  },
  {
    id: "28",
    question: "Hva er forskjellen på useMemo og useCallback?",
    answers: [
      {
        id: "28a",
        answer: "useMemo memoiserer verdier, useCallback memoiserer funksjoner",
      },
      { id: "28b", answer: "Begge brukes for sideeffekter" },
      { id: "28c", answer: "useCallback brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-16"),
  },
  {
    id: "29",
    question: "Hva er React DevTools?",
    answers: [
      { id: "29a", answer: "Et verktøy for debugging av React-applikasjoner" },
      { id: "29b", answer: "Et verktøy for å lage komponenter" },
      { id: "29c", answer: "Et verktøy for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-15"),
  },
  {
    id: "30",
    question: "Hva er forskjellen på React og React Native?",
    answers: [
      { id: "30a", answer: "React brukes for web, React Native for mobil" },
      { id: "30b", answer: "React Native bruker native komponenter" },
      { id: "30c", answer: "React Native har ikke hooks" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-14"),
  },
  {
    id: "31",
    question: "Hva er formålet med prop-types?",
    answers: [
      { id: "31a", answer: "Validere props i komponenter" },
      { id: "31b", answer: "Optimalisere ytelse" },
      { id: "31c", answer: "Lagre referanser til DOM-elementer" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-13"),
  },
  {
    id: "32",
    question: "Hva er forskjellen på useState og useRef?",
    answers: [
      { id: "32a", answer: "useState trigger re-render, useRef gjør ikke det" },
      { id: "32b", answer: "useRef brukes for DOM-referanser" },
      { id: "32c", answer: "useState brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-12"),
  },
  {
    id: "33",
    question: "Hva er React reconciliation?",
    answers: [
      {
        id: "33a",
        answer: "Prosessen med å oppdatere DOM basert på endringer i state",
      },
      { id: "33b", answer: "Prosessen med å validere props" },
      { id: "33c", answer: "Prosessen med å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-11"),
  },
  {
    id: "34",
    question: "Hva er forskjellen på mount og unmount?",
    answers: [
      {
        id: "34a",
        answer: "Mount er når komponenten legges til DOM, unmount når den fjernes",
      },
      { id: "34b", answer: "Unmount brukes for sideeffekter" },
      { id: "34c", answer: "Mount brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-10"),
  },
  {
    id: "35",
    question: "Hva er React keys?",
    answers: [
      { id: "35a", answer: "Unike identifikatorer for listeelementer" },
      { id: "35b", answer: "Props for styling" },
      { id: "35c", answer: "Hooks for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-09"),
  },
  {
    id: "36",
    question: "Hva er forskjellen på useEffect og useLayoutEffect?",
    answers: [
      {
        id: "36a",
        answer: "useLayoutEffect kjører synkront etter DOM-oppdateringer",
      },
      { id: "36b", answer: "useEffect kjører asynkront etter paint" },
      { id: "36c", answer: "Begge brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-08"),
  },
  {
    id: "37",
    question: "Hva er React Router?",
    answers: [
      { id: "37a", answer: "Et bibliotek for routing i React-applikasjoner" },
      { id: "37b", answer: "Et verktøy for debugging" },
      { id: "37c", answer: "Et verktøy for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-07"),
  },
  {
    id: "38",
    question: "Hva er forskjellen på Redux og Context API?",
    answers: [
      {
        id: "38a",
        answer: "Redux er et eksternt bibliotek, Context API er innebygd",
      },
      { id: "38b", answer: "Redux brukes for global state" },
      { id: "38c", answer: "Context API brukes kun for små applikasjoner" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-06"),
  },
  {
    id: "39",
    question: "Hva er en pure component?",
    answers: [
      {
        id: "39a",
        answer: "En komponent som kun re-renderer ved endring i props eller state",
      },
      { id: "39b", answer: "En komponent med ekstra styling" },
      { id: "39c", answer: "En komponent som håndterer sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-05"),
  },
  {
    id: "40",
    question:
      "Hva er forskjellen på class-komponenter og funksjonelle komponenter?",
    answers: [
      { id: "40a", answer: "Class-komponenter bruker lifecycle-metoder" },
      { id: "40b", answer: "Funksjonelle komponenter bruker hooks" },
      { id: "40c", answer: "Class-komponenter er mer verbose" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-04"),
  },
  {
    id: "41",
    question: "Hva er React Prop Drilling?",
    answers: [
      { id: "41a", answer: "Å sende props gjennom mange komponentnivåer" },
      { id: "41b", answer: "Å validere props" },
      { id: "41c", answer: "Å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-03"),
  },
  {
    id: "42",
    question: "Hva er forskjellen på useState og useReducer?",
    answers: [
      {
        id: "42a",
        answer: "useState for enkel state, useReducer for kompleks logikk",
      },
      { id: "42b", answer: "useReducer brukes kun i class-komponenter" },
      { id: "42c", answer: "useState brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-02"),
  },
  {
    id: "43",
    question: "Hva er React StrictMode?",
    answers: [
      {
        id: "43a",
        answer: "Et verktøy for å oppdage potensielle problemer i React-applikasjoner",
      },
      { id: "43b", answer: "Et verktøy for styling" },
      { id: "43c", answer: "Et verktøy for debugging" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-01"),
  },
  {
    id: "44",
    question: "Hva er forskjellen på useEffect og useMemo?",
    answers: [
      {
        id: "44a",
        answer: "useEffect brukes for sideeffekter, useMemo for memoisering",
      },
      { id: "44b", answer: "Begge brukes for optimalisering" },
      { id: "44c", answer: "useMemo brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-30"),
  },
  {
    id: "45",
    question: "Hva er React Virtual DOM?",
    answers: [
      {
        id: "45a",
        answer: "Et abstrakt lag over den faktiske DOM for effektiv oppdatering",
      },
      { id: "45b", answer: "Et verktøy for debugging" },
      { id: "45c", answer: "Et verktøy for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-29"),
  },
  {
    id: "46",
    question: "Hva er forskjellen på useRef og createRef?",
    answers: [
      {
        id: "46a",
        answer: "useRef brukes i funksjonelle komponenter, createRef i class-komponenter",
      },
      { id: "46b", answer: "Begge brukes for DOM-referanser" },
      { id: "46c", answer: "createRef brukes kun for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-28"),
  },
  {
    id: "47",
    question: "Hva er React render cycle?",
    answers: [
      { id: "47a", answer: "Prosessen med å oppdatere og re-render komponenter" },
      { id: "47b", answer: "Prosessen med å validere props" },
      { id: "47c", answer: "Prosessen med å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-27"),
  },
  {
    id: "48",
    question: "Hva er forskjellen på useEffect og useCallback?",
    answers: [
      {
        id: "48a",
        answer: "useEffect brukes for sideeffekter, useCallback for memoisering av funksjoner",
      },
      { id: "48b", answer: "Begge brukes for optimalisering" },
      { id: "48c", answer: "useCallback brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-26"),
  },
  {
    id: "49",
    question: "Hva er React hooks?",
    answers: [
      {
        id: "49a",
        answer: "Funksjoner som gir tilgang til React state og lifecycle",
      },
      { id: "49b", answer: "Funksjoner for styling" },
      { id: "49c", answer: "Funksjoner for debugging" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-25"),
  },
  {
    id: "50",
    question: "Hva er forskjellen på useState og useEffect?",
    answers: [
      {
        id: "50a",
        answer: "useState håndterer state, useEffect håndterer sideeffekter",
      },
      { id: "50b", answer: "Begge brukes for optimalisering" },
      { id: "50c", answer: "useEffect brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-24"),
  },
  {
    id: "51",
    question: "Hva er React memo?",
    answers: [
      { id: "51a", answer: "En HOC som optimaliserer funksjonelle komponenter" },
      { id: "51b", answer: "En hook for sideeffekter" },
      { id: "51c", answer: "En metode for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-23"),
  },
  {
    id: "52",
    question: "Hva er forskjellen på useEffect og useImperativeHandle?",
    answers: [
      {
        id: "52a",
        answer: "useEffect brukes for sideeffekter, useImperativeHandle for å tilpasse ref",
      },
      { id: "52b", answer: "Begge brukes for optimalisering" },
      { id: "52c", answer: "useImperativeHandle brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-22"),
  },
  {
    id: "53",
    question: "Hva er React render props?",
    answers: [
      { id: "53a", answer: "En teknikk for å dele kode mellom komponenter" },
      { id: "53b", answer: "En prop for styling" },
      { id: "53c", answer: "En prop for debugging" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-21"),
  },
  {
    id: "54",
    question: "Hva er forskjellen på useMemo og useImperativeHandle?",
    answers: [
      {
        id: "54a",
        answer: "useMemo memoiserer verdier, useImperativeHandle tilpasser ref",
      },
      { id: "54b", answer: "Begge brukes for optimalisering" },
      { id: "54c", answer: "useImperativeHandle brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "55",
    question: "Hva er React context?",
    answers: [
      { id: "55a", answer: "En måte å dele data mellom komponenter uten props" },
      { id: "55b", answer: "En hook for sideeffekter" },
      { id: "55c", answer: "En metode for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-19"),
  },
  {
    id: "56",
    question: "Hva er forskjellen på useReducer og Redux?",
    answers: [
      {
        id: "56a",
        answer: "useReducer er innebygd, Redux er et eksternt bibliotek",
      },
      { id: "56b", answer: "Begge brukes for global state" },
      { id: "56c", answer: "Redux brukes kun i små applikasjoner" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-18"),
  },
  {
    id: "57",
    question: "Hva er React suspense?",
    answers: [
      { id: "57a", answer: "En komponent for å håndtere loading states" },
      { id: "57b", answer: "En hook for sideeffekter" },
      { id: "57c", answer: "En metode for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-17"),
  },
  {
    id: "58",
    question: "Hva er forskjellen på useEffect og useRef?",
    answers: [
      {
        id: "58a",
        answer: "useEffect brukes for sideeffekter, useRef for mutable verdier",
      },
      { id: "58b", answer: "Begge brukes for optimalisering" },
      { id: "58c", answer: "useRef brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-16"),
  },
  {
    id: "59",
    question: "Hva er React lazy?",
    answers: [
      { id: "59a", answer: "En funksjon for å laste komponenter asynkront" },
      { id: "59b", answer: "En hook for sideeffekter" },
      { id: "59c", answer: "En metode for styling" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "60",
    question: "Hva er forskjellen på useState og useImperativeHandle?",
    answers: [
      {
        id: "60a",
        answer: "useState håndterer state, useImperativeHandle tilpasser ref",
      },
      { id: "60b", answer: "Begge brukes for optimalisering" },
      { id: "60c", answer: "useImperativeHandle brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-14"),
  },
];

// Data sets for different test scenarios
export const emptyQuestions: Question[] = [];

export const archivedOnlyQuestions: Question[] = [
  {
    id: "arch1",
    question: "Arkivert spørsmål 1",
    answers: [{ id: "a1", answer: "Svar 1" }],
    status: "archived" as QuestionStatus,
    createdAt: new Date("2024-01-01"),
  },
];
