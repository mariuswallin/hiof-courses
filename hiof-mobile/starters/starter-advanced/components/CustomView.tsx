// components/CustomView.tsx
//
// En View som kan legge på safe-area-padding, og som tar className.
// Bruk denne i stedet for View der du trenger avstand til hakk/statuslinje.

import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/utils/cn";

type CustomViewProps = Omit<ViewProps, "style"> & {
  className?: string;
  safeArea?: boolean;
};

export default function CustomView({
  className = "",
  safeArea = false,
  ...props
}: PropsWithChildren<CustomViewProps>) {
  const baseClass = "bg-gray-100";
  // p-safe kommer fra NativeWind og leser safe-area-insets for oss
  const safeAreaClass = safeArea ? "p-safe" : "";

  return <View className={cn(baseClass, safeAreaClass, className)} {...props} />;
}
