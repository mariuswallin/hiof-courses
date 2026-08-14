// hooks/usePermissions.tsx

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function usePermissions() {
  const [hasPermissions, setHasPermissions] = useState(false);
  // Set loading to true to show a spinner, or similar, while the permissions
  // are checked
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Async function that checks whether permission is set and stored in
    // AsyncStorage
    async function checkIfPermissionIsSet() {
      try {
        // Check AsyncStorage for a stored permission under the key "permissionsGranted"
        const permissionsGranted = await AsyncStorage.getItem(
          "permissionsGranted"
        );
        if (permissionsGranted === null) {
          setHasPermissions(false);
          return;
        }
        setHasPermissions(true);
      } catch (error) {
        console.error("Failed to check if permissions is granted", error);
      } finally {
        // Set loading to false once the permission check is done, whether or not it
        // succeeded
        setIsLoading(false);
      }
    }

    checkIfPermissionIsSet();
  }, []);

  return { hasPermissions, isLoading };
}
