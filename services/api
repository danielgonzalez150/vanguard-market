import axios from 'axios';

// Creamos la instancia con la URL que te pasó el profe
const api = axios.create({
  baseURL: 'https://ecommerce-api.wittysky-ae597b7e.westus2.azurecontainerapps.io/api',
  timeout: 10000, // Si la API tarda más de 10s, cancela (evita que la app se quede pegada)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;