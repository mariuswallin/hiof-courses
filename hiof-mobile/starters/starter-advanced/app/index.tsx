// app/index.tsx — forsiden. Filnavnet er ruta: index.tsx blir "/".
import { Text } from "react-native";

import CustomView from "@/components/CustomView";

export default function Home() {
  return (
    <CustomView safeArea className="flex-1 items-center justify-center gap-2 px-5">
      <Text className="text-2xl font-bold text-primary">Studenten</Text>
      <Text className="text-base text-center text-neutral-700">
        Utgangspunkt for uke 4 og utover: Expo Router og NativeWind er satt opp.
      </Text>
    </CustomView>
  );
}
