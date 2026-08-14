// components/ImagePicker.tsx

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../constants/theme";

import { cn } from "@/utils/cn";
import { styled } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ImagePickerDrawerProps = {
  onImageSelect: (uri: string) => void;
  selectedImage?: string | null;
} & DrawerContentComponentProps;

const StyledExpoImage = styled(ExpoImage, {
  className: "style",
});

type ImageAsset = { id: string; uri: string };

export default function ImagePickerDrawer({
  onImageSelect,
  selectedImage,
  navigation,
}: ImagePickerDrawerProps) {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const isSelected = (uri?: string) => {
    if (!uri || !selectedImage) return false;
    return uri === selectedImage;
  };

  // Fires every time the component mounts
  useEffect(() => {
    loadRecentImages();
  }, []);

  const loadRecentImages = async () => {
    const alreadyAccepted = await AsyncStorage.getItem("permissionsGranted");

    // As long as we have not granted full access, we are asked again
    if (permissionResponse?.status !== "granted" && !alreadyAccepted) {
      const { status } = await requestPermission();
      if (status !== "granted") {
        Alert.alert(
          "Tillatelse kreves",
          "Appen trenger tilgang til bildebiblioteket for å vise bilder.",
        );
        return;
      }
    }

    try {
      // Fetch the 4 most recent images with the new Query API
      const recentAssets = await new MediaLibrary.Query()
        .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.IMAGE)
        .orderBy({ key: MediaLibrary.AssetField.CREATION_TIME, ascending: false })
        .limit(4)
        .exe();

      const assetsWithUri = await Promise.all(
        recentAssets.map(async (asset) => ({
          id: asset.id,
          uri: await asset.getUri(),
        })),
      );

      setAssets(assetsWithUri);
    } catch (error) {
      console.error("Feil ved henting av bilder:", error);
    }
  };

  const handleImageSelect = async (asset: ImageAsset) => {
    try {
      if (!asset.uri) {
        Alert.alert("Feil", "Kunne ikke hente bildeinformasjon");
        return;
      }
      onImageSelect(asset.uri);
      //navigation.closeDrawer();
    } catch (error) {
      console.error("Feil ved valg av bilde:", error);
      Alert.alert("Feil", "Kunne ikke velge bildet");
    }
  };

  return (
    <DrawerContentScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Velg et bilde</Text>
        <Text style={styles.subtitle}>
          Siste valgte (maks 4) bilder fra biblioteket
        </Text>

        <View style={styles.imageGrid}>
          {assets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => handleImageSelect(asset)}
              style={styles.imageContainer}
              className="rounded"
            >
              <StyledExpoImage
                source={{ uri: asset.uri }}
                style={styles.image}
                className={cn(
                  isSelected(asset.uri)
                    ? "rounded-lg border-4 border-blue-600"
                    : "rounded-lg",
                )}
              />
            </TouchableOpacity>
          ))}
        </View>

        {assets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={Theme.text} />
            <Text style={styles.emptyText}>Ingen bilder funnet</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.closeDrawer()}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>Lukk</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.text,
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    marginTop: 10,
    color: Theme.text,
  },
  closeButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: Theme.secondary,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
