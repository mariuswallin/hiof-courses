// App.tsx — utgangspunktet for uke 1–3.
//
// Alt som trengs for å kjøre er på plass: SafeAreaProvider er satt opp, og
// insets brukes så innholdet ikke havner under hakket eller statuslinja.
// Resten bygger vi live.

import { StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

function Screen() {
  // Måler hvor mye plass systemet trenger i topp og bunn på akkurat denne enheten
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>Studenten</Text>
      <Text style={styles.body}>
        Utgangspunkt for uke 1–3. Her bygger vi studentlista.
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Screen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    gap: 8,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#002266",
  },
  body: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
