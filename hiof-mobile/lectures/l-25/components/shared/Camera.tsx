// /components/shared/Camera.tsx

import * as React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SymbolView } from "expo-symbols";
import { CameraView, type CameraRatio, type CameraType } from "expo-camera";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

// Prop types for this component
type CameraProps = {
  onSetImage: (image: string) => void; // A function that takes an image path
  ratio?: CameraRatio; // Aspect ratio for the camera view (optional)
  zoom?: number; // Zoom level (optional)
  facing?: CameraType; // Which camera is used, front or back (optional)
};

export function SharedCamera(props: CameraProps) {
  // Destructure props with default values
  const { onSetImage, ratio = "1:1", zoom = 0.1, facing = "front" } = props;

  // Reference to the camera component, so CameraView methods can be called directly
  const cameraRef = React.useRef<CameraView>(null);

  // Take a picture
  async function handleTakePicture() {
    // Use the reference to take the picture
    const response = await cameraRef.current?.takePictureAsync({
      quality: 0.8, // Setter bildekvaliteten til 80%
    });
    if (!response) return; // Return if we got no response; otherwise send the path to the parent
    onSetImage(response.uri);
  }

  return (
    // Animated.View comes from react-native-reanimated and lets us animate
    // components with different effects
    <Animated.View
      layout={LinearTransition} // Smooth transition on layout changes
      entering={FadeIn.duration(1000)} // Fade-in animation when the component appears
      exiting={FadeOut.duration(1000)} // Fade-out animation when the component is removed
      className={
        "flex-1 top-0 left-0 right-0 bottom-0 absolute z-40 h-full w-full justify-center items-center bg-black"
      }
    >
      {/* CameraView is the main component from expo-camera */}
      <CameraView
        ref={cameraRef} // Attach our reference to the component
        style={{
          flex: 1,
          width: "100%",
          maxHeight: 400,
        }}
        ratio={ratio} // Aspect ratio (for example "1:1", "16:9")
        zoom={zoom} // Zoom level (0-1)
        facing={facing} // Which camera (front/back)
        mode={"picture"} // Mode (picture/video)
      />

      {/* Button for taking a picture */}
      <TouchableOpacity
        onPress={handleTakePicture}
        className="absolute bottom-20 w-16 h-16 rounded-full bg-blue-300 justify-center items-center"
      >
        {/* SymbolView from expo-symbols — works best on iOS */}
        <SymbolView
          name={"circle"} // SF Symbol name
          size={90} // Size
          type="hierarchical" // Symbol type (color style)
          tintColor={"white"} // Color
          animationSpec={{
            // Animation settings
            effect: {
              type: "bounce", // Spretteffekt
            },
            repeating: false, // Ikke gjenta animasjonen
          }}
          fallback={
            // Fallback for Android/Web
            <TouchableOpacity
              onPress={handleTakePicture}
              style={{
                width: 90,
                height: 90,
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 45,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>{"📷"}</Text>
            </TouchableOpacity>
          }
        />
      </TouchableOpacity>

      {/* Close button */}
      <TouchableOpacity
        onPress={() => onSetImage("")} // Send an empty string to signal no picture
        className="absolute top-10 right-10"
      >
        <SymbolView
          name={"x.circle.fill"} // X symbol
          size={45}
          type="hierarchical"
          tintColor={"white"}
          animationSpec={{
            effect: {
              type: "bounce",
            },
            repeating: false,
          }}
          fallback={
            // Fallback for non-iOS platforms
            <TouchableOpacity
              onPress={() => onSetImage("")}
              style={{
                width: 90,
                height: 90,
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 45,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>x</Text>
            </TouchableOpacity>
          }
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
