// Sign up screen.
//
// Same shape as login.tsx: plain useState, and AuthProvider does the work.
// The password rule lives in RegisterSchema in types/index.ts, so the server
// side and this screen cannot disagree about what is valid.
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { MockBadge } from "@/components/shared/MockBadge";

export default function RegisterScreen() {
  const { register, error } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    const ok = await register({ name, email, password });
    setIsSubmitting(false);
    if (ok) router.replace("/(app)/(tabs)");
  };

  return (
    <View className="flex-1 bg-white">
      <MockBadge />
      <View className="flex-1 justify-center gap-4 p-6">
        <Text className="text-3xl font-bold">Registrer deg</Text>

        <TextInput
          accessibilityLabel="Navn"
          value={name}
          onChangeText={setName}
          placeholder="Navn"
          className="rounded-md border border-gray-300 px-3 py-3"
        />
        <TextInput
          accessibilityLabel="E-post"
          value={email}
          onChangeText={setEmail}
          placeholder="E-post"
          autoCapitalize="none"
          keyboardType="email-address"
          className="rounded-md border border-gray-300 px-3 py-3"
        />
        <TextInput
          accessibilityLabel="Passord"
          value={password}
          onChangeText={setPassword}
          placeholder="Passord, minst 8 tegn"
          secureTextEntry
          className="rounded-md border border-gray-300 px-3 py-3"
        />

        {error && (
          <Text accessibilityRole="alert" className="text-danger">
            {error}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={submit}
          className="rounded-md bg-primary px-4 py-3"
        >
          <Text className="text-center font-semibold text-white">
            {isSubmitting ? "Oppretter" : "Opprett konto"}
          </Text>
        </Pressable>

        <Link href="/login" asChild>
          <Pressable accessibilityRole="link">
            <Text className="text-center text-primary">
              Har du konto allerede? Logg inn
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
