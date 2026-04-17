import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // <--- ESTO ES LO QUE TE FALTA
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      // 1. Llamamos al servicio
      const response = await login(email, password); 
      
      // 2. Extraemos el objeto 'data' interno (donde viene el token y el role)
      const apiData = response.data; 

      if (apiData && apiData.token) {
        // 3. Guardamos el token para el interceptor de Axios
        await SecureStore.setItemAsync('userToken', apiData.token);
        
        // 4. Guardamos todo el objeto (email, role, userId) como string
        await SecureStore.setItemAsync('userData', JSON.stringify(apiData));

        console.log("✅ LOGIN EXITOSO. Rol:", apiData.role);

        // 5. Saltamos al Home
        router.replace('/(main)/home'); 
      } else {
        Alert.alert("Error", "No se encontró el token en la respuesta");
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      const errorMsg = error.response?.data?.message || "Credenciales incorrectas";
      Alert.alert("Error de acceso", errorMsg);
    } finally {
      setLoading(false);
    } 
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-extrabold text-slate-900">Vanguard</Text>
            <Text className="text-4xl font-extrabold text-blue-600">Market</Text>
            <Text className="text-slate-500 mt-2 text-lg">Inicia sesión para continuar</Text>
          </View>

          {/* Formulario */}
          <View className="space-y-4">
            <View>
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Correo Electrónico</Text>
              <TextInput
                placeholder="ejemplo@correo.com"
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="mt-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Contraseña</Text>
              <TextInput
                placeholder="••••••••"
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Botón de Ingreso */}
            <TouchableOpacity 
              className={`mt-8 p-4 rounded-2xl shadow-lg shadow-blue-300 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">Ingresar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register' as any)}
              className="mt-6"
            >
              <Text className="text-center text-slate-500">
                ¿No tienes cuenta? <Text className="text-blue-600 font-bold">Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}