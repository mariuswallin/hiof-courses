// app/data/questions.ts

import type { Question, QuestionStatus } from "../types/question";

export const questions: Question[] = [
  {
    id: "1",
    question: "Hva er hovedformålet med React hooks?",
    answers: [
      { id: "1a", text: "Å erstatte class-komponenter" },
      { id: "1b", text: "Å håndtere state i funksjonelle komponenter" },
      { id: "1c", text: "Å forbedre performance" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    question: "Hvordan fungerer state management i React applikasjoner?",
    answers: [
      { id: "2a", text: "Gjennom useState hook" },
      { id: "2b", text: "Med Redux eller Context API" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    question: "Hva er fordelene med TypeScript i React?",
    answers: [
      { id: "3a", text: "Type-sikkerhet" },
      { id: "3b", text: "Bedre IDE-støtte" },
      { id: "3c", text: "Færre runtime-feil" },
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
        text: "useLayoutEffect kjører synkront etter DOM-oppdateringer",
      },
      { id: "4b", text: "useEffect kjører asynkront etter paint" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "5",
    question: "Hvordan kan du optimalisere ytelsen i en React-applikasjon?",
    answers: [
      { id: "5a", text: "Bruke React.memo for å unngå unødvendige re-renders" },
      { id: "5b", text: "Implementere lazy loading for komponenter" },
      {
        id: "5c",
        text: "Bruke useCallback og useMemo for å memoize funksjoner og verdier",
      },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-08"),
  },
  {
    id: "6",
    question: "Hva er en React Context?",
    answers: [
      { id: "6a", text: "En måte å dele data mellom komponenter uten props" },
      { id: "6b", text: "En type komponent som håndler state" },
      { id: "6c", text: "En metode for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-07"),
  },
  {
    id: "7",
    question: "Hva brukes useRef til i React?",
    answers: [
      { id: "7a", text: "Lagre mutable verdier som ikke trigger re-render" },
      { id: "7b", text: "Opprette referanser til DOM-elementer" },
      { id: "7c", text: "Håndtere sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-06"),
  },
  {
    id: "8",
    question: "Hva er forskjellen på controlled og uncontrolled komponenter?",
    answers: [
      { id: "8a", text: "Controlled styres av React state" },
      { id: "8b", text: "Uncontrolled bruker DOM direkte" },
      { id: "8c", text: "Controlled bruker useRef" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "9",
    question: "Hva er formålet med useMemo?",
    answers: [
      { id: "9a", text: "Memoisere verdier for å unngå dyre beregninger" },
      { id: "9b", text: "Lagre referanser til DOM-elementer" },
      { id: "9c", text: "Opprette sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-04"),
  },
  {
    id: "10",
    question: "Hvordan kan du håndtere asynkrone kall i useEffect?",
    answers: [
      { id: "10a", text: "Bruke async funksjon inne i useEffect" },
      { id: "10b", text: "Bruke en separat funksjon og kalle den" },
      { id: "10c", text: "Bruke Promise direkte i useEffect" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "11",
    question: "Hva er en custom hook?",
    answers: [
      { id: "11a", text: "En funksjon som bruker andre hooks" },
      { id: "11b", text: "En komponent med spesialfunksjon" },
      { id: "11c", text: "En hook fra React-biblioteket" },
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
        text: "Memoisere funksjoner for å unngå unødvendige re-renders",
      },
      { id: "12b", text: "Lagre referanser til DOM-elementer" },
      { id: "12c", text: "Opprette sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "13",
    question: "Hva er forskjellen på props og state?",
    answers: [
      { id: "13a", text: "Props sendes fra foreldre, state er lokal" },
      { id: "13b", text: "State kan ikke endres, props kan" },
      { id: "13c", text: "Props brukes kun i class-komponenter" },
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
        text: "En funksjon som tar en komponent og returnerer en ny komponent",
      },
      { id: "14b", text: "En komponent med ekstra styling" },
      { id: "14c", text: "En komponent som håndterer state" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-30"),
  },
  {
    id: "15",
    question: "Hva brukes Context API til?",
    answers: [
      { id: "15a", text: "Dele data globalt mellom komponenter" },
      { id: "15b", text: "Optimalisere ytelse" },
      { id: "15c", text: "Lagre referanser til DOM-elementer" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-29"),
  },
  {
    id: "16",
    question: "Hva er en fragment i React?",
    answers: [
      { id: "16a", text: "En wrapper som ikke gir ekstra DOM-elementer" },
      { id: "16b", text: "En type komponent" },
      { id: "16c", text: "En hook for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-28"),
  },
  {
    id: "17",
    question: "Hva er formålet med keys i lister?",
    answers: [
      { id: "17a", text: "Identifisere elementer for effektiv oppdatering" },
      { id: "17b", text: "Lagre referanser til DOM-elementer" },
      { id: "17c", text: "Optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-27"),
  },
  {
    id: "18",
    question: "Hva er en portal i React?",
    answers: [
      { id: "18a", text: "Render komponenter utenfor parent DOM-hierarki" },
      { id: "18b", text: "En type hook" },
      { id: "18c", text: "En metode for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-26"),
  },
  {
    id: "19",
    question: "Hva er forskjellen på useReducer og useState?",
    answers: [
      { id: "19a", text: "useReducer er for kompleks state-logikk" },
      { id: "19b", text: "useState brukes for enkel state" },
      { id: "19c", text: "useReducer brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-25"),
  },
  {
    id: "20",
    question: "Hva er lazy loading i React?",
    answers: [
      { id: "20a", text: "Laste komponenter kun når de trengs" },
      { id: "20b", text: "Lagre referanser til DOM-elementer" },
      { id: "20c", text: "Optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-24"),
  },
  {
    id: "21",
    question: "Hva er Suspense i React?",
    answers: [
      { id: "21a", text: "Håndtere loading states for async komponenter" },
      { id: "21b", text: "Memoisere verdier" },
      { id: "21c", text: "Opprette sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-23"),
  },
  {
    id: "22",
    question: "Hva brukes Error Boundary til?",
    answers: [
      { id: "22a", text: "Fange opp JavaScript-feil i komponenttreet" },
      { id: "22b", text: "Optimalisere ytelse" },
      { id: "22c", text: "Lagre referanser til DOM-elementer" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-22"),
  },
  {
    id: "23",
    question: "Hva er forskjellen på useEffect og componentDidMount?",
    answers: [
      { id: "23a", text: "useEffect brukes i funksjonelle komponenter" },
      { id: "23b", text: "componentDidMount brukes i class-komponenter" },
      { id: "23c", text: "Begge brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-21"),
  },
  {
    id: "24",
    question: "Hva er en controlled form i React?",
    answers: [
      { id: "24a", text: "Form-elementer styres av React state" },
      { id: "24b", text: "Form-elementer styres av DOM" },
      { id: "24c", text: "Form-elementer bruker useRef" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-20"),
  },
  {
    id: "25",
    question: "Hva er React Fiber?",
    answers: [
      { id: "25a", text: "React sin nye reconciler for bedre ytelse" },
      { id: "25b", text: "En type hook" },
      { id: "25c", text: "En metode for å optimalisere ytelse" },
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
        text: "useImperativeHandle tilpasser ref-verdier for parent",
      },
      { id: "26b", text: "useRef lagrer mutable verdier" },
      { id: "26c", text: "Begge brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-18"),
  },
  {
    id: "27",
    question: "Hva er en render prop?",
    answers: [
      { id: "27a", text: "En funksjon som returnerer React-elementer" },
      { id: "27b", text: "En prop som lagrer state" },
      { id: "27c", text: "En prop som brukes for styling" },
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
        text: "useMemo memoiserer verdier, useCallback memoiserer funksjoner",
      },
      { id: "28b", text: "Begge brukes for sideeffekter" },
      { id: "28c", text: "useCallback brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-16"),
  },
  {
    id: "29",
    question: "Hva er React DevTools?",
    answers: [
      { id: "29a", text: "Et verktøy for debugging av React-applikasjoner" },
      { id: "29b", text: "Et verktøy for å lage komponenter" },
      { id: "29c", text: "Et verktøy for å optimalisere ytelse" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-15"),
  },
  {
    id: "30",
    question: "Hva er forskjellen på React og React Native?",
    answers: [
      { id: "30a", text: "React brukes for web, React Native for mobil" },
      { id: "30b", text: "React Native bruker native komponenter" },
      { id: "30c", text: "React Native har ikke hooks" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-14"),
  },
  {
    id: "31",
    question: "Hva er formålet med prop-types?",
    answers: [
      { id: "31a", text: "Validere props i komponenter" },
      { id: "31b", text: "Optimalisere ytelse" },
      { id: "31c", text: "Lagre referanser til DOM-elementer" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-13"),
  },
  {
    id: "32",
    question: "Hva er forskjellen på useState og useRef?",
    answers: [
      { id: "32a", text: "useState trigger re-render, useRef gjør ikke det" },
      { id: "32b", text: "useRef brukes for DOM-referanser" },
      { id: "32c", text: "useState brukes kun i class-komponenter" },
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
        text: "Prosessen med å oppdatere DOM basert på endringer i state",
      },
      { id: "33b", text: "Prosessen med å validere props" },
      { id: "33c", text: "Prosessen med å optimalisere ytelse" },
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
        text: "Mount er når komponenten legges til DOM, unmount når den fjernes",
      },
      { id: "34b", text: "Unmount brukes for sideeffekter" },
      { id: "34c", text: "Mount brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-10"),
  },
  {
    id: "35",
    question: "Hva er React keys?",
    answers: [
      { id: "35a", text: "Unike identifikatorer for listeelementer" },
      { id: "35b", text: "Props for styling" },
      { id: "35c", text: "Hooks for sideeffekter" },
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
        text: "useLayoutEffect kjører synkront etter DOM-oppdateringer",
      },
      { id: "36b", text: "useEffect kjører asynkront etter paint" },
      { id: "36c", text: "Begge brukes for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-08"),
  },
  {
    id: "37",
    question: "Hva er React Router?",
    answers: [
      { id: "37a", text: "Et bibliotek for routing i React-applikasjoner" },
      { id: "37b", text: "Et verktøy for debugging" },
      { id: "37c", text: "Et verktøy for styling" },
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
        text: "Redux er et eksternt bibliotek, Context API er innebygd",
      },
      { id: "38b", text: "Redux brukes for global state" },
      { id: "38c", text: "Context API brukes kun for små applikasjoner" },
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
        text: "En komponent som kun re-renderer ved endring i props eller state",
      },
      { id: "39b", text: "En komponent med ekstra styling" },
      { id: "39c", text: "En komponent som håndterer sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-05"),
  },
  {
    id: "40",
    question:
      "Hva er forskjellen på class-komponenter og funksjonelle komponenter?",
    answers: [
      { id: "40a", text: "Class-komponenter bruker lifecycle-metoder" },
      { id: "40b", text: "Funksjonelle komponenter bruker hooks" },
      { id: "40c", text: "Class-komponenter er mer verbose" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-12-04"),
  },
  {
    id: "41",
    question: "Hva er React Prop Drilling?",
    answers: [
      { id: "41a", text: "Å sende props gjennom mange komponentnivåer" },
      { id: "41b", text: "Å validere props" },
      { id: "41c", text: "Å optimalisere ytelse" },
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
        text: "useState for enkel state, useReducer for kompleks logikk",
      },
      { id: "42b", text: "useReducer brukes kun i class-komponenter" },
      { id: "42c", text: "useState brukes for sideeffekter" },
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
        text: "Et verktøy for å oppdage potensielle problemer i React-applikasjoner",
      },
      { id: "43b", text: "Et verktøy for styling" },
      { id: "43c", text: "Et verktøy for debugging" },
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
        text: "useEffect brukes for sideeffekter, useMemo for memoisering",
      },
      { id: "44b", text: "Begge brukes for optimalisering" },
      { id: "44c", text: "useMemo brukes kun i class-komponenter" },
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
        text: "Et abstrakt lag over den faktiske DOM for effektiv oppdatering",
      },
      { id: "45b", text: "Et verktøy for debugging" },
      { id: "45c", text: "Et verktøy for styling" },
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
        text: "useRef brukes i funksjonelle komponenter, createRef i class-komponenter",
      },
      { id: "46b", text: "Begge brukes for DOM-referanser" },
      { id: "46c", text: "createRef brukes kun for sideeffekter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-28"),
  },
  {
    id: "47",
    question: "Hva er React render cycle?",
    answers: [
      { id: "47a", text: "Prosessen med å oppdatere og re-render komponenter" },
      { id: "47b", text: "Prosessen med å validere props" },
      { id: "47c", text: "Prosessen med å optimalisere ytelse" },
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
        text: "useEffect brukes for sideeffekter, useCallback for memoisering av funksjoner",
      },
      { id: "48b", text: "Begge brukes for optimalisering" },
      { id: "48c", text: "useCallback brukes kun i class-komponenter" },
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
        text: "Funksjoner som gir tilgang til React state og lifecycle",
      },
      { id: "49b", text: "Funksjoner for styling" },
      { id: "49c", text: "Funksjoner for debugging" },
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
        text: "useState håndterer state, useEffect håndterer sideeffekter",
      },
      { id: "50b", text: "Begge brukes for optimalisering" },
      { id: "50c", text: "useEffect brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-24"),
  },
  {
    id: "51",
    question: "Hva er React memo?",
    answers: [
      { id: "51a", text: "En HOC som optimaliserer funksjonelle komponenter" },
      { id: "51b", text: "En hook for sideeffekter" },
      { id: "51c", text: "En metode for styling" },
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
        text: "useEffect brukes for sideeffekter, useImperativeHandle for å tilpasse ref",
      },
      { id: "52b", text: "Begge brukes for optimalisering" },
      { id: "52c", text: "useImperativeHandle brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-22"),
  },
  {
    id: "53",
    question: "Hva er React render props?",
    answers: [
      { id: "53a", text: "En teknikk for å dele kode mellom komponenter" },
      { id: "53b", text: "En prop for styling" },
      { id: "53c", text: "En prop for debugging" },
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
        text: "useMemo memoiserer verdier, useImperativeHandle tilpasser ref",
      },
      { id: "54b", text: "Begge brukes for optimalisering" },
      { id: "54c", text: "useImperativeHandle brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "55",
    question: "Hva er React context?",
    answers: [
      { id: "55a", text: "En måte å dele data mellom komponenter uten props" },
      { id: "55b", text: "En hook for sideeffekter" },
      { id: "55c", text: "En metode for styling" },
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
        text: "useReducer er innebygd, Redux er et eksternt bibliotek",
      },
      { id: "56b", text: "Begge brukes for global state" },
      { id: "56c", text: "Redux brukes kun i små applikasjoner" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-18"),
  },
  {
    id: "57",
    question: "Hva er React suspense?",
    answers: [
      { id: "57a", text: "En komponent for å håndtere loading states" },
      { id: "57b", text: "En hook for sideeffekter" },
      { id: "57c", text: "En metode for styling" },
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
        text: "useEffect brukes for sideeffekter, useRef for mutable verdier",
      },
      { id: "58b", text: "Begge brukes for optimalisering" },
      { id: "58c", text: "useRef brukes kun i class-komponenter" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2023-11-16"),
  },
  {
    id: "59",
    question: "Hva er React lazy?",
    answers: [
      { id: "59a", text: "En funksjon for å laste komponenter asynkront" },
      { id: "59b", text: "En hook for sideeffekter" },
      { id: "59c", text: "En metode for styling" },
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
        text: "useState håndterer state, useImperativeHandle tilpasser ref",
      },
      { id: "60b", text: "Begge brukes for optimalisering" },
      { id: "60c", text: "useImperativeHandle brukes kun i class-komponenter" },
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
    answers: [{ id: "a1", text: "Svar 1" }],
    status: "archived" as QuestionStatus,
    createdAt: new Date("2024-01-01"),
  },
];
