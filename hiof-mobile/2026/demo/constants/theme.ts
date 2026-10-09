// constants/theme.ts
//
// Design tokens shared between StyleSheet code and NativeWind. The values
// mirror the @theme block in app/global.css, so `bg-primary` and
// `Theme.primary` give the same colour.

export const Theme = {
  primary: "#1565c0",
  primaryLight: "#e3f2fd",
  secondary: "#1976d2",
  contrast: "#ffb300",
  danger: "#d32f2f",
  muted: "#6b7280",
  border: "#d1d5db",
} as const;
