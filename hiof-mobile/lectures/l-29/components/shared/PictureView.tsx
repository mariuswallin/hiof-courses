// components/shared/PictureView.tsx

import { Image } from "expo-image";
import { Alert } from "react-native";
import { Asset } from "expo-media-library";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { CameraType } from "expo-camera";

// Prop types for this component
interface PictureViewProps {
  type?: CameraType; // The camera in use (front or back)
  picture: string; // URI of the image to show
  setPicture: (value: string | null) => void; // Function that updates the image path
}

export default function PictureView({
  picture,
  setPicture,
  type = "back",
}: PictureViewProps) {
  return (
    // Animated.View, for fade effects and smooth transitions
    <Animated.View
      layout={LinearTransition} // Smooth transitions on layout changes
      entering={FadeIn} // Fade-in animation
      exiting={FadeOut} // Fade-out animation
      className={"h-96 relative w-full"}
    >
      {/* Button for saving the picture to the media library */}
      <Ionicons
        onPress={async () => {
          // Use expo-media-library to save the picture
          await Asset.create(picture);
          // Show a simple confirmation message
          Alert.alert("✅ Picture saved!");
        }}
        name={"arrow-down"}
        size={36}
        color={"#002266"}
        className="absolute top-2 left-2 z-10"
      />

      {/* Button for closing the picture view */}
      <Ionicons
        onPress={async () => {
          setPicture(null); // Set the image path to an empty string
        }}
        name={"close-circle-outline"}
        size={36}
        color={"red"}
        className="absolute top-2 right-2 z-10"
      />

      {/* Shows the image itself with expo-image */}
      <Image
        source={picture}
        contentFit="cover"
        style={[
          {
            height: "100%",
            width: "100%",
          },
          type === "front"
            ? { transform: [{ scaleX: -1 }] } // Mirror the image horizontally
            : {}, // Ingen speilvending for bakkamera
        ]}
      />
    </Animated.View>
  );
}
