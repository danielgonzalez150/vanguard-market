import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/'); // Te manda de vuelta al login
  };

  return (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <Text className="text-2xl font-bold text-slate-900">¡Login Exitoso!</Text>
      <Text className="text-slate-500 mb-8">Bienvenido a Vanguard Market</Text>
      
      <TouchableOpacity 
        onPress={handleLogout}
        className="bg-red-500 p-4 rounded-xl"
      >
        <Text className="text-white font-bold">Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}