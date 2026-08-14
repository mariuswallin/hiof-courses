// data/students.ts — testdata.
// id er number: slår du opp fra en URL-parameter, må du konvertere
// (students.find((s) => s.id.toString() === id)), siden params alltid er string.

export interface Student {
  id: number;
  name: string;
  age: number;
}

export const students: Student[] = [
  { id: 1, name: "John Doe", age: 20 },
  { id: 2, name: "Jane Smith", age: 22 },
  { id: 3, name: "Sam Brown", age: 19 },
  { id: 4, name: "Emily Johnson", age: 21 },
  { id: 5, name: "Michael Davis", age: 23 },
];
