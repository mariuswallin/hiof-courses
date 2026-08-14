// data/students.ts — testdata, så vi slipper å skrive dem inn live.
//
// Merk at id er et number her. Når vi senere slår opp en student fra en
// URL-parameter (uke 4), er den verdien alltid en string — da må vi
// konvertere: students.find((s) => s.id.toString() === id)

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
