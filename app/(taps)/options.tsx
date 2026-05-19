import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function OptionsScreen() {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");

    router.replace("/(auth)");
  };

  return (
    <View className="flex-1 bg-slate-50 p-5">
      <Text className="text-3xl font-black mb-8">
        Opciones
      </Text>

      {/* PERFIL */}
      <TouchableOpacity
        onPress={() => router.push("/(main)/profile")}
        className="bg-blue-600 p-5 rounded-2xl mb-4"
      >
        <Text className="text-white text-center font-bold">
          Modificar Perfil
        </Text>
      </TouchableOpacity>

      {/* SELLER */}
      <TouchableOpacity
        onPress={() => router.push("/(main)/seller")}
        className="bg-purple-600 p-5 rounded-2xl"
      >
        <Text className="text-white text-center font-bold">
          Panel Vendedor
        </Text>
      </TouchableOpacity>
    </View>
  );
}