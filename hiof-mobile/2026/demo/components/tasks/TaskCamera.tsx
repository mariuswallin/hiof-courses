import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { backend } from "@/providers";

type Props = {
  imageId: string | null;
  onChange: (imageId: string | null) => void;
};

/**
 * Takes a photo and uploads it.
 *
 * expo-camera is device only on both iOS and Android, so this checks
 * isAvailableAsync() first and explains itself instead of rendering a broken
 * screen in an emulator.
 */
export function TaskCamera({ imageId, onChange }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // isAvailableAsync is a static on CameraView, not a module export.
    CameraView.isAvailableAsync()
      .then(setHasCamera)
      .catch(() => setHasCamera(false));
  }, []);

  const previewUrl = backend.files.previewUrl(imageId);

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (!photo?.uri) return;

    setIsOpen(false);
    setIsUploading(true);
    setError(null);

    const result = await backend.files.upload(photo.uri);
    setIsUploading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onChange(result.data);
  };

  if (hasCamera === false) {
    return (
      <View className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <Text className="font-semibold">Kamera er ikke tilgjengelig</Text>
        <Text className="mt-1 text-sm text-muted">
          expo-camera virker bare på en ekte telefon, ikke i simulator eller
          emulator. Resten av appen fungerer som normalt.
        </Text>
      </View>
    );
  }

  if (isOpen) {
    return (
      <View className="h-80 overflow-hidden rounded-lg">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View className="flex-1 justify-end p-4">
            <View className="flex-row justify-between">
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsOpen(false)}
                className="rounded-md bg-black/60 px-4 py-2"
              >
                <Text className="text-white">Avbryt</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ta bilde"
                onPress={takePicture}
                className="rounded-md bg-white px-4 py-2"
              >
                <Text className="font-semibold">Ta bilde</Text>
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {previewUrl && (
        <Image
          source={{ uri: previewUrl }}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
          contentFit="cover"
          accessibilityLabel="Bilde knyttet til oppgaven"
        />
      )}

      {error && (
        <Text accessibilityRole="alert" className="text-danger">
          {error}
        </Text>
      )}

      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          disabled={isUploading}
          onPress={async () => {
            // Ask for permission on first use, not on mount, so the prompt
            // appears when the user has shown intent.
            if (!permission?.granted) {
              const next = await requestPermission();
              if (!next.granted) {
                setError("Appen trenger tilgang til kameraet");
                return;
              }
            }
            setIsOpen(true);
          }}
          className="rounded-md bg-primary px-4 py-2"
        >
          <Text className="font-semibold text-white">
            {isUploading ? "Laster opp" : previewUrl ? "Ta nytt bilde" : "Ta bilde"}
          </Text>
        </Pressable>

        {imageId && (
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange(null)}
            className="rounded-md border border-gray-300 px-4 py-2"
          >
            <Text>Fjern</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
