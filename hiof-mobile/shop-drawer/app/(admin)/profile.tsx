import { useNavigation } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { DrawerActions } from "expo-router/react-navigation";

export default function ProfileScreen() {
  const navigation = useNavigation();
  return (
    <View>
      <Text>Profile Screen</Text>
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(DrawerActions.openDrawer());
        }}
      >
        <Text>Åpne meny</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(DrawerActions.closeDrawer());
        }}
      >
        <Text>Lukk meny</Text>
      </TouchableOpacity>
    </View>
  );
}
