import Navbar from "@/components/Navbar";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function OptionsScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <Navbar />

      <View className="flex-1 bg-slate-50 p-5">
        <Text className="text-3xl font-black mb-6">Opciones</Text>

        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          className="bg-slate-900 p-4 rounded-2xl mb-4"
        >
          <Text className="text-white text-center font-bold">
            Modificar Perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(main)/seller")}
          className="bg-purple-600 p-4 rounded-2xl"
        >
          <Text className="text-white text-center font-bold">
            Panel Vendedor
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
