// App.tsx — styling demo

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { StyledCard } from "./components/StyledCard";
import { colors, spacing, typography } from "./theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Styling i React Native</Text>
          <Text style={styles.lead}>
            Eksempler på StyleSheet API, Flexbox-layout og gjenbrukbare
            design-tokens.
          </Text>

          <View style={styles.section}>
            <StyledCard
              title="Layout med Flexbox"
              subtitle="flexDirection default er column (i motsetning til web)"
              badge="Tema"
            />
            <StyledCard
              title="StyleSheet.create"
              subtitle="Gir validering, ytelse og bedre feilmeldinger"
              badge="API"
            />
            <StyledCard
              title="Platform.select"
              subtitle="Egne stiler for iOS og Android (shadow vs elevation)"
              badge="Tips"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.display,
    color: colors.text,
  },
  lead: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
});
