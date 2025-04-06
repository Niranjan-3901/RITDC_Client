import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LOCAL_SERVER_BASE_URL, PROD_SERVER_BASE_URL } from "@env";

// Create axios instance
const api = axios.create({
  baseURL: PROD_SERVER_BASE_URL,
});
// const api = axios.create({
//   baseURL: PROD_SERVER_BASE_URL,
// });

// Cancel token handling
let cancelTokenSource = axios.CancelToken.source();

const refreshCancelToken = () => {
  if (!cancelTokenSource || cancelTokenSource.token.reason) {
    cancelTokenSource = axios.CancelToken.source();
  }
};

// Function to cancel requests when needed
const cancelRequests = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel("Request canceled due to unmount");
  }
  refreshCancelToken();
};

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      if (!config.headers.Authorization) {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }

      if (!config.cancelToken) {
        config.cancelToken = cancelTokenSource.token;
      }

      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (!response.data) {
      throw new Error(response.data.message || "API request failed");
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Logging out...");
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// API Request Function
const apiRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body: any = null,
  contentType: string = "application/json"
): Promise<any> => {
  try {
    refreshCancelToken();

    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config: any = {
      method,
      url: endpoint,
      headers,
      cancelToken: cancelTokenSource.token,
    };

    if (body && method !== "GET") {
      config.data = body;
    }

    const response = await api.request(config);
    return response;
  } catch (error: any) {
    console.error(`❌ API Request Error for route ${endpoint}:`, error?.response?.data || error.message);
    throw error?.response?.data || { message: "API request failed" };
  }
};

export { apiRequest, cancelRequests };
export default api;
