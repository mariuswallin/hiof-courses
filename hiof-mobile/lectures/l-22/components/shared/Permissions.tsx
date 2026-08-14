import { useCameraPermissions } from "expo-camera";
import { usePermissions } from "expo-media-library";
import { router } from "expo-router";
import { Alert, Button, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Takes a route as a parameter, so we can navigate to the right screen once
// permission is granted. Decided by whoever uses the component.
export function Permissions({ route }: { route: string }) {
  // Read camera and media library permissions through expo's built-in hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [libraryPermission, requestMediaLibraryPermission] = usePermissions();
  const allPermissionsGranted =
    cameraPermission?.granted && libraryPermission?.granted;

  const handleContinue = async () => {
    const allPermissionsGranted = await requestAllPermissions();
    if (allPermissionsGranted) {
      // navigate to add
      router.replace(route);
    } else {
      Alert.alert("To continue please provide permissions in settings");
    }
  };

  // Check every permission and store the result in AsyncStorage
  async function requestAllPermissions() {
    const cameraStatus = await requestCameraPermission();
    if (!cameraStatus.granted) {
      Alert.alert("Error", "Camera permission is required.");
      return false;
    }

    const mediaLibraryStatus = await requestMediaLibraryPermission();
    if (!mediaLibraryStatus.granted) {
      Alert.alert("Error", "Media Library permission is required.");
      return false;
    }

    // Makes sure we only ask once
    await AsyncStorage.setItem("permissionsGranted", "true");
    return true;
  }

  return (
    <View className="p-5 flex-1 gap-5">
      {!cameraPermission?.granted ? (
        <View>
          <Text>We need your permission to use the camera</Text>
          <TouchableOpacity onPress={requestCameraPermission}>
            <Text className="bg-blue-500 p-2 py-4 text-white rounded text-center font-bold my-2">
              Grant camera permission
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!libraryPermission?.granted ? (
        <View>
          <Text>We need your permission to use the library</Text>
          <TouchableOpacity onPress={requestMediaLibraryPermission}>
            <Text className="bg-blue-500 p-2 py-4 text-white rounded text-center font-bold my-2">
              Grant library permission
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <Button
        title="Continue"
        disabled={!allPermissionsGranted}
        onPress={handleContinue}
      />
    </View>
  );
}
