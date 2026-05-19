import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function LogoutScreen() {
  useEffect(() => {
    const logout = async () => {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");

      router.replace("/(auth)");
    };

    logout();
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
}