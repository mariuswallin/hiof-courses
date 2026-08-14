// theme.ts — design tokens

export const colors = {
  background: "#ffffff",
  surface: "#f5f5f7",
  text: "#1d1d1f",
  textMuted: "#6e6e73",
  primary: "#007aff",
  primaryDark: "#0051d5",
  border: "#d2d2d7",
  success: "#34c759",
  danger: "#ff3b30",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const typography = {
  body: { fontSize: 16, lineHeight: 22 },
  bodySm: { fontSize: 14, lineHeight: 20 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
} as const;
