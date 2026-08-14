// components/ProfileSearch.tsx

import { getProfileByEmail } from "@/providers/appwrite/database";
import type { Profile } from "@/types";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import Search from "./Search";
import Card from "./BaseCard";
import Empty from "./Empty";
import { cn } from "@/utils/cn";

type Status = "idle" | "loading" | "error";

export default function ProfileSearch({
  onProfilePress,
  profile,
  children,
}: {
  onProfilePress: (profile?: Profile) => void;
  profile?: Profile;
  children: React.ReactNode;
}) {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  console.log("Rerendering ProfileSearch with query:", query);

  // The different states that can occur while data is loading
  const isError = status === "error" || error !== null;
  const isLoading = status === "loading";
  const isIdle = status === "idle";
  const isEmpty = profiles.length === 0;
  const notFoundSearch = isIdle && isEmpty && query;

  // Load profiles for the search — either from a search string present when the
  // component mounts, or when the search string changes
  useEffect(() => {
    // Reset profiles and status when the search string is empty, so stale profiles
    // are not left on screen
    if (!query) {
      setProfiles([]);
      setStatus("idle");
      return;
    }
    const fetchProfiles = async () => {
      setStatus("loading");
      setError(null);

      // Use the abstraction from database.ts to look up profiles by email
      const response = await getProfileByEmail(query as string);
      const success = response.success;
      setProfiles(success ? response.data : []);
      setStatus(success ? "idle" : "error");
    };
    fetchProfiles();
  }, [query]);

  // Handle a tap on the profile card
  const handleProfileCardPress = async (userId?: string) => {
    const selectedProfile = profiles.find(
      (profile) => profile.userId === userId
    );
    // Lets the caller react to a profile being selected. userId could be passed as
    // a parameter here too, the way we do with the search.
    onProfilePress(selectedProfile);
  };

  return (
    <View className="flex-1 mt-0 py-0">
      {isError && (
        <Text className="text-lg font-rubik-bold text-red-500">
          {error || "An error occurred"}
        </Text>
      )}
      <FlatList
        data={profiles}
        numColumns={1}
        renderItem={({ item }) => {
          // Once one is selected, hide the others
          if (profile) return null;
          return (
            <Card
              title={`Profil ${item.email}`}
              onPress={() => handleProfileCardPress(item.userId)}
              styles={{
                container: "px-4 py-0",
                content: "w-full p-4",
                title: "text-black font-bold text-base",
              }}
            >
              <Text className={cn("text-black mt-2")}>{item.userId}</Text>
            </Card>
          );
        }}
        // Required, to give each item a unique key
        keyExtractor={(item) => item.userId}
        // Styling for the items
        contentContainerClassName="gap-3"
        showsVerticalScrollIndicator={false}
        // Used when there are no profiles to show
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <Empty
              search={query}
              text={
                !query && !notFoundSearch
                  ? "Du må søke og velge en profil"
                  : undefined
              }
            />
          )
        }
        // The base component
        ListHeaderComponent={() =>
          // Shows the selected profile with its own styling. Tapping it deselects.
          profile ? (
            <View className="flex-1 mt-4 mb-0 py-0">
              <Card
                title={`Profil ${profile.email}`}
                onPress={() => handleProfileCardPress(undefined)}
                styles={{
                  container: "px-4 py-0 mt-0",
                  content:
                    "bg-blue-600 border-blue-500 border-2 w-full p-4 text-white",
                  title: "text-white font-bold text-base",
                }}
              >
                <Text className={cn("text-white mt-2")}>{profile.userId}</Text>
              </Card>
            </View>
          ) : (
            <View className="flex-1 px-5">
              <Search />
              {!isEmpty && (
                <Text className="text-lg font-rubik-bold text-black-500 mt-5">
                  Velg en profil for å se skjema
                </Text>
              )}
            </View>
          )
        }
        // Lets us show something below the list — a button or other information.
        // In our case, the form.
        ListFooterComponent={() => <>{children}</>}
      />
    </View>
  );
}
