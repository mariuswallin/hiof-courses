// components/StyledCard.tsx — shows StyleSheet + Flexbox + theme

import { StyleSheet, View, Text, Pressable, Platform } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
};

export function StyledCard({ title, subtitle, badge, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    // Shadow / elevation per platform
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    flexShrink: 1,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: {
    ...typography.bodySm,
    color: colors.background,
    fontWeight: "600",
  },
});
