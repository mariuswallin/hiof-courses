// components/CustomView.tsx

import { View } from "react-native";
import type { PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

type CustomViewProps = Partial<React.AbstractView> & {
  className?: string;
  safeArea?: boolean;
};

export default function CustomView({
  className = "",
  safeArea = false,
  ...props
}: PropsWithChildren<CustomViewProps>) {
  // Base class for the background color
  const baseClass = "bg-gray-100";

  // When safeArea is true, add padding for the safe area
  const safeAreaClass = safeArea ? "p-safe" : "";

  return (
    <View className={cn(baseClass, safeAreaClass, className)} {...props} />
  );
}
