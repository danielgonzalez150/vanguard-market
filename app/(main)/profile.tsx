import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { updatePersonalInfo } from '../../services/authService';

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // Formato YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const data = await SecureStore.getItemAsync('userData');
      if (data) {
        const user = JSON.parse(data);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setPhoneNumber(user.phoneNumber || '');
        setDateOfBirth(user.dateOfBirth || '');
      }
    };
    loadData();
  }, []);

  const handleUpdate = async () => {
    if (!firstName || !lastName || !phoneNumber || !dateOfBirth) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await updatePersonalInfo(firstName, lastName, phoneNumber, dateOfBirth);
      
      // Actualizamos el storage local para que los cambios se vean reflejados
      const sessionData = await SecureStore.getItemAsync('userData');
      const currentFullUser = sessionData ? JSON.parse(sessionData) : {};
      
      const updatedUser = { 
        ...currentFullUser, 
        firstName, 
        lastName, 
        phoneNumber, 
        dateOfBirth 
      };
      
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      
      Alert.alert("¡Éxito!", "Información personal actualizada correctamente.");
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert("Error", "No se pudo actualizar la información. Revisa el formato de los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="mt-10 mb-8">
        <Text className="text-3xl font-extrabold text-slate-900">Mi Perfil</Text>
        <Text className="text-slate-500 mt-1">Gestiona tu información personal</Text>
      </View>

      <View className="space-y-4">
        {/* Nombres */}
        <View>
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Nombres</Text>
          <TextInput
            placeholder="Ej: Diego"
            className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Apellidos */}
        <View className="mt-4">
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Apellidos</Text>
          <TextInput
            placeholder="Ej: Martínez Sánchez"
            className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Teléfono */}
        <View className="mt-4">
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Teléfono</Text>
          <TextInput
            placeholder="+57 300 123 4567"
            className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Fecha de Nacimiento */}
        <View className="mt-4">
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Fecha de Nacimiento (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="1990-05-15"
            className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
        </View>

        <TouchableOpacity 
          className={`mt-8 p-4 rounded-2xl ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={async () => {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            router.replace('/(auth)' as any);
          }}
          className="mt-6 mb-10"
        >
          <Text className="text-center text-red-500 font-bold">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}