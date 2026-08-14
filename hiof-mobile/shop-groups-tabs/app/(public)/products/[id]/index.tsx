import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { products } from "../../../../data/products";
import { ProductCard } from "../../../../components/ProductCardWithProps";
// Imports a list of products from a data file; normally this would be an
// API call or a database query

// Kept local — it is not used elsewhere and is specific to this component
const EmptyProduct = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.error}>Ingen produkt funnet.</Text>
      <Link href="/products" style={styles.link}>
        <Text style={styles.linkText}>Tilbake til produktlisten</Text>
      </Link>
    </View>
  );
};

export default function ProductDetailScreen() {
  // useLocalSearchParams reads the ID parameter out of the URL
  const { id } = useLocalSearchParams();

  // Find the product with this ID
  const product = products.find((s) => s.id === id);

  // Handle the case where the product is not found
  if (!product) {
    return <EmptyProduct />;
  }

  return (
    <View style={styles.container}>
      <ProductCard product={product} />
      {/* Link back to the list page */}
      <Link href="/products" style={styles.link}>
        <Text style={styles.linkText}>Tilbake til produkter</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#002266",
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    backgroundColor: "#002266",
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});
