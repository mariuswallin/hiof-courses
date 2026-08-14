// app/(admin)/(students)/back.tsx

import { Redirect } from "expo-router";

export default function Back() {
  // Redirect back to the front page.
  // Needed because we have no navigation bar here.
  return <Redirect href="/" />;
}
