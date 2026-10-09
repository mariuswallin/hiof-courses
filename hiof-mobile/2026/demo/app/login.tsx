// Sign in screen.
//
// The fields are plain useState, not TanStack Form. Two fields with no
// validation rules of their own do not need a form library, and the lecture
// login screen does the same. TaskForm is where the form library earns its
// keep.
//
// AuthProvider owns the call and the error message; this screen only collects
// the values and routes on success.
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { MockBadge } from "@/components/shared/MockBadge";

export default function LoginScreen() {
  const { login, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    const ok = await login({ email, password });
    setIsSubmitting(false);
    if (ok) router.replace("/(app)/(tabs)");
  };

  return (
    <View className="flex-1 bg-white">
      <MockBadge />
      <View className="flex-1 justify-center gap-4 p-6">
        <Text className="text-3xl font-bold">Logg inn</Text>

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
          placeholder="Passord"
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
            {isSubmitting ? "Logger inn" : "Logg inn"}
          </Text>
        </Pressable>

        <Link href="/register" asChild>
          <Pressable accessibilityRole="link">
            <Text className="text-center text-primary">
              Har du ikke konto? Registrer deg
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
