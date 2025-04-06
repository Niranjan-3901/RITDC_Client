import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ENV from '../config/Env';

const cancelToken = axios.CancelToken.source();

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? ENV.LOCAL_SERVER_BASE_URL : ENV.PROD_SERVER_BASE_URL
})

api.interceptors.request.use((config) => {
  config.cancelToken = cancelToken.token;
  return config;
});

export const cancelRequests = () => {
  cancelToken.cancel('Request canceled due to unmount');
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Add Response Interceptor for Handling Errors
api.interceptors.response.use(
  (response) => {
    if (!response.data) {
      throw new Error(response.data.message || 'API request failed');
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized! Logging out...');
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);


const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body: any = null,
  contentType: string = 'application/json'
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('token'); // ✅ Retrieve token inside request
    // console.log("🔑 Token at Request:", token);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ Ensure token is attached
    };

    const config: any = {
      method,
      url: endpoint,
      headers,
      cancelToken: cancelToken.token,
    };

    if (body && method !== 'GET') {
      config.data = body;
    }

    const response = await api.request(config);
    return response;
  } catch (error: any) {
    console.error(`❌ API Request Error for route ${endpoint}:`, error?.response?.data || error.message);
    throw error?.response?.data || { message: 'API request failed' };
  }
};


export { apiRequest };
export default api;