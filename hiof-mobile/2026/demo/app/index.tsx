import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { Loading } from "@/components/shared/Loading";

/**
 * Entry point. Decides where to send you based on the session.
 *
 * The redirect lives here rather than in the root layout, because a layout
 * renders on every navigation while this only runs once on start.
 */
export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading label="Sjekker innlogging" />;
  return <Redirect href={user ? "/(app)/(tabs)" : "/login"} />;
}
