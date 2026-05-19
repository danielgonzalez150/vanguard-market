import React from "react";

import { Alert, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";

import * as SecureStore from "expo-secure-store";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("userToken");

          await SecureStore.deleteItemAsync("userData");

          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <View className="bg-white px-4 pt-6 pb-4 border-b border-slate-200">
      {/* TITULO */}
      

      {/* NAVBAR */}
      <View className="flex-row justify-between mt-5">
        {/* HOME */}
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          className="items-center flex-1"
        >
          <Text className="text-2xl">🏠</Text>

          <Text className="text-xs font-bold mt-1">
            Home
          </Text>
        </TouchableOpacity>

        {/* CARRITO */}
        <TouchableOpacity
          onPress={() => router.push("/cart")}
          className="items-center flex-1"
        >
          <Text className="text-2xl">🛒</Text>

          <Text className="text-xs font-bold mt-1">
            Carrito
          </Text>
        </TouchableOpacity>

        {/* OPCIONES */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/options")}
          className="items-center flex-1"
        >
          <Text className="text-2xl">⚙️</Text>

          <Text className="text-xs font-bold mt-1">
            Opciones
          </Text>
        </TouchableOpacity>

        {/* SALIR */}
        <TouchableOpacity
          onPress={handleLogout}
          className="items-center flex-1"
        >
          <Text className="text-2xl">🚪</Text>

          <Text className="text-xs font-bold mt-1">
            Salir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}