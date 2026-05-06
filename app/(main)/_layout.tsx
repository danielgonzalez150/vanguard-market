import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile" />
      <Stack.Screen name="product-form" />
      <Stack.Screen name="manage-products" />

      {/* 👇 ESTA LÍNEA ES LA CLAVE */}
      <Stack.Screen name="seller/index" options={{ title: 'Panel Seller' }} />
    </Stack>
  );
}