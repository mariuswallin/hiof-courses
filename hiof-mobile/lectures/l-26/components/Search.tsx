// components/Search.tsx

import React, { useState } from "react";
import { View, TextInput } from "react-native";
import { useDebouncedCallback } from "use-debounce";

import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";

// Ionicons does not accept className directly - styled maps it onto `style`
// (same pattern as components/forms/PictureField.tsx)
const StyledIonicons = styled(Ionicons, {
  className: {
    target: "style",
    // @ts-expect-error - known type limitation in react-native-css for vector icons
    nativeStyleToProp: {
      color: true,
    },
  },
});

// Takes a function receiving the search text, when needed
const Search = ({ onSearch }: { onSearch?: (query: string) => void }) => {
  const params = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState<string | undefined>(params.query);

  // Debounce, to avoid too many requests while the user types. Triggering the
  // search only on enter would avoid this too.
  const debouncedSearch = useDebouncedCallback((text: string) => {
    // Put the search text in the URL parameters, e.g. "site-url?query=..."
    router.setParams({ query: text });
  }, 500);

  // Lets the caller handle the search result
  const handleSearch = () => {
    if (onSearch && search) {
      onSearch(search);
    }
  };

  const handleInputChange = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  return (
    <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
      <View className="flex-1 flex flex-row items-center justify-start z-50">
        <StyledIonicons name="search" className="size-5" />
        <TextInput
          value={search}
          onChangeText={handleInputChange} // Update the search text
          onSubmitEditing={handleSearch} // Trigger the search when the user presses enter
          inputMode="search" // Search mode for the keyboard
          autoCapitalize="none" // No auto-capitalization
          autoCorrect={false} // No auto-correct
          autoComplete="off" // No auto-complete
          autoFocus={true} // No auto-focus
          returnKeyType="search" // Switch the keyboard to search
          placeholder="Søk etter profil"
          className="text-sm font-rubik text-black-300 ml-2 flex-1"
        />
      </View>
    </View>
  );
};

export default Search;
