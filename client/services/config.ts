// Configuração da API
const API_CONFIG = {
  // Para desenvolvimento local (iOS Simulator ou Android Emulator)
  LOCAL_URL: 'http://localhost:5000',
  
  // Para dispositivo físico na mesma rede (substitua pelo IP do seu computador)
  NETWORK_URL: 'http://192.168.1.4:5000',
  
  // URL base atual - mude conforme necessário
  BASE_URL: 'http://192.168.1.4:5000/api'
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_CONFIG.BASE_URL}/auth/register`,
    LOGIN: `${API_CONFIG.BASE_URL}/auth/login`,
    ME: `${API_CONFIG.BASE_URL}/auth/me`,
    USERS: `${API_CONFIG.BASE_URL}/auth/users`
  },
  BARBERSHOPS: `${API_CONFIG.BASE_URL}/barbershops`,
  BARBERS: `${API_CONFIG.BASE_URL}/barbers`,
  CLIENTS: `${API_CONFIG.BASE_URL}/clients`,
  SERVICES: `${API_CONFIG.BASE_URL}/services`,
  BOOKINGS: `${API_CONFIG.BASE_URL}/bookings`
};

export default API_CONFIG;
