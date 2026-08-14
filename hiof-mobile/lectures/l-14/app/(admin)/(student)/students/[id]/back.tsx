// app/(admin)/(student)/students/[id]/back.tsx

import { Redirect } from "expo-router";

export default function Back() {
  // Redirect back to the student list.
  // Needed because we have no navigation bar here.
  return <Redirect href="/students" />;
}
