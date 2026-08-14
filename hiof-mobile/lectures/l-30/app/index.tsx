// app/index.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Theme } from "@/constants/theme";
import { useAuth } from "@/context/AuthProvider";

export default function Home() {
  // useAuth tells us whether the user is signed in and whether they are an admin
  const { isLoggedIn, isAdmin } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studentapp</Text>
      <Text style={styles.subtitle}>Velkommen til student-id appen!</Text>

      <View style={styles.linkContainer}>
        <Link href="/about" style={styles.link}>
          <Text style={styles.linkText}>Om appen</Text>
        </Link>
        {/* New screen not built yet */}
        {isLoggedIn ? (
          <Link href="/user-profile" style={styles.link}>
            <Text style={styles.linkText}>Min profil</Text>
          </Link>
        ) : null}
        {/* Checks whether the user is an admin */}
        {isAdmin ? (
          <Link href="/list" style={styles.link}>
            <Text style={styles.linkText}>Studenter</Text>
          </Link>
        ) : null}
        {
          /* Link to the sign-in screen */
          !isLoggedIn ? (
            <View>
              <Link href="/login" style={styles.link}>
                <Text style={styles.linkText}>Logg inn</Text>
              </Link>
              <Link href="/register" style={styles.link}>
                <Text style={styles.linkText}>Registrer deg</Text>
              </Link>
            </View>
          ) : null
        }
        {/* Duplicates the screens, to show that navigation works (without guards) */}
        {/* <Link href="/list" style={styles.link}>
          <Text style={styles.linkText}>Studenter</Text>
        </Link> */}
        {/* Links to screens, to show that navigation works (without guards) */}
        {/* <Link href="/access" style={styles.link}>
          <Text style={styles.linkText}>Access</Text>
        </Link> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Theme.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#333",
  },
  linkContainer: {
    width: "80%",
    marginTop: 20,
  },
  link: {
    backgroundColor: Theme.primary,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});
