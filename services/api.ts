import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://ecommerce-api.wittysky-ae597b7e.westus2.azurecontainerapps.io/api',
  timeout: 15000, // Le damos un poquito más de tiempo por si la red está lenta
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Fíjate bien que el nombre sea 'userToken'
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✈️ Interceptor: Token enviado con éxito");
    } else {
      console.log("⚠️ Interceptor: ¡NO SE ENCONTRÓ TOKEN!");
    }
    return config;
  }
);

export default api; // Asegúrate de que diga esto al final