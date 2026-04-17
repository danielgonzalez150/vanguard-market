import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    router.replace('/(auth)' as any); 
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HEADER SUPERIOR */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-slate-200">
        <Text className="text-xl font-extrabold text-blue-600">Vanguard</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/(main)/profile' as any)}
          className="bg-slate-100 p-2 px-4 rounded-full border border-slate-200"
        >
          <Text className="text-slate-700 font-bold">👤 Mi Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO CENTRAL */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 items-center w-full">
          <Text className="text-3xl text-center font-black text-slate-900">
            ¡Bienvenido!
          </Text>
          <Text className="text-slate-500 text-center mt-2 mb-8 text-lg">
            Has ingresado correctamente a la plataforma.
          </Text>
          
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-50 p-4 rounded-2xl w-full border border-red-100"
          >
            <Text className="text-red-600 text-center font-bold">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}