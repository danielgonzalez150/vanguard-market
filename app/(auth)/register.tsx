import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register } from '../../services/authService';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER'); // Rol por defecto
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !idNumber || !email || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, firstName, idNumber, lastName, role);
      Alert.alert("¡Éxito!", `Usuario ${role} creado correctamente.`);
      router.replace('/(auth)' as any);
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert("Error", "No se pudo registrar. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  const roles = ['BUYER', 'SELLER', 'ADMIN'];

  return (
    <ScrollView className="flex-1 bg-white p-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mt-10 mb-6">
        <Text className="text-3xl font-extrabold text-slate-900">Registro</Text>
        <Text className="text-slate-500">Crea tu perfil en Vanguard Market</Text>
      </View>

      <View className="space-y-4">
        <TextInput placeholder="Nombres" className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4" value={firstName} onChangeText={setFirstName} />
        
        <TextInput placeholder="Apellidos" className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4" value={lastName} onChangeText={setLastName} />
        
        <TextInput placeholder="Número de Identificación" className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4" keyboardType="numeric" value={idNumber} onChangeText={setIdNumber} />
        
        <TextInput placeholder="Correo Electrónico" className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        
        <TextInput placeholder="Contraseña" className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4" secureTextEntry value={password} onChangeText={setPassword} />

        {/* Selector de Rol */}
        <Text className="text-slate-700 font-semibold mb-2 ml-1">Selecciona tu Rol:</Text>
        <View className="flex-row justify-between mb-6">
          {roles.map((r) => (
            <TouchableOpacity 
              key={r}
              onPress={() => setRole(r)}
              className={`flex-1 mx-1 p-3 rounded-xl border ${role === r ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={`text-center font-bold text-xs ${role === r ? 'text-white' : 'text-slate-500'}`}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          className={`p-4 rounded-2xl ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold text-lg">Crear Cuenta</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}