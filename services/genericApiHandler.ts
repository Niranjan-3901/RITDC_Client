// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { LOCAL_SERVER_BASE_URL, PROD_SERVER_BASE_URL } from "@env";
// import Constants from "expo-constants";

// const API_URL = Constants?.expoConfig?.extra?.PROD_SERVER_BASE_URL || PROD_SERVER_BASE_URL;
// console.log("API URL: ",API_URL)

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
// });
// // const api = axios.create({
// //   baseURL: PROD_SERVER_BASE_URL,
// // });

// // Cancel token handling
// let cancelTokenSource = axios.CancelToken.source();

// const refreshCancelToken = () => {
//   if (!cancelTokenSource || cancelTokenSource.token.reason) {
//     cancelTokenSource = axios.CancelToken.source();
//   }
// };

// // Function to cancel requests when needed
// const cancelRequests = () => {
//   if (cancelTokenSource) {
//     cancelTokenSource.cancel("Request canceled due to unmount");
//   }
//   refreshCancelToken();
// };

// // Request Interceptor
// api.interceptors.request.use(
//   async (config) => {
//     try {
//       if (!config.headers.Authorization) {
//         const token = await AsyncStorage.getItem("token");
//         if (token) {
//           config.headers["Authorization"] = `Bearer ${token}`;
//         }
//       }

//       if (!config.cancelToken) {
//         config.cancelToken = cancelTokenSource.token;
//       }

//       return config;
//     } catch (error) {
//       console.error("Error in request interceptor:", error);
//       return Promise.reject(error);
//     }
//   },
//   (error) => Promise.reject(error)
// );

// // Response Interceptor
// api.interceptors.response.use(
//   (response) => {
//     if (!response.data) {
//       throw new Error(response.data.message || "API request failed");
//     }
//     return response.data;
//   },
//   async (error) => {
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized! Logging out...");
//       await AsyncStorage.removeItem("token");
//     }
//     return Promise.reject(error);
//   }
// );

// // API Request Function
// const apiRequest = async (
//   endpoint: string,
//   method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
//   body: any = null,
//   contentType: string = "application/json"
// ): Promise<any> => {
//   try {
//     refreshCancelToken();

//     const token = await AsyncStorage.getItem("token");

//     const headers: Record<string, string> = {
//       "Content-Type": contentType,
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };

//     const config: any = {
//       method,
//       url: endpoint,
//       headers,
//       cancelToken: cancelTokenSource.token,
//     };

//     if (body && method !== "GET") {
//       config.data = body;
//     }

//     const response = await api.request(config);
//     return response;
//   } catch (error: any) {
//     console.error(`❌ API Request Error for route ${endpoint}:`, error?.response?.data || error.message);
//     throw error?.response?.data || { message: "API request failed" };
//   }
// };

// export { apiRequest, cancelRequests };
// export default api;

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

// Get API URL from app.json (Expo Config)
const API_URL = Constants?.expoConfig?.extra?.PROD_SERVER_BASE_URL || "https://ritdc-server.onrender.com/api";
console.log("🌍 API Base URL:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

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

// 📌 Utility function to log limited data
const logLimitedData = (data: any) => {
  if (Array.isArray(data)) {
    return data.slice(0, 2); // First 2 items of the array
  } else if (typeof data === "object" && data !== null) {
    const keys = Object.keys(data).slice(0, 2); // First 2 keys of the object
    return keys.reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {} as any);
  }
  return data; // If it's not an object or array, return as is
};

// 📌 Request Interceptor (Logs Limited Data)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      if (!config.cancelToken) {
        config.cancelToken = cancelTokenSource.token;
      }

      console.log(
        `📡 Request: [${config.method?.toUpperCase()}] ${API_URL}${config.url}`,
        "\nHeaders:", logLimitedData(config.headers),
        "\nBody:", logLimitedData(config.data)
      );

      return config;
    } catch (error) {
      console.error("⚠️ Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// 📌 Response Interceptor (Logs Limited Data)
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Response: [${response.config.method?.toUpperCase()}] ${API_URL}${response.config.url}`,
      "\nStatus:", response.status,
      "\nData:", logLimitedData(response.data)
    );
    return response.data;
  },
  async (error) => {
    console.error(
      `❌ API Error: [${error?.config?.method?.toUpperCase()}] ${API_URL}${error?.config?.url}`,
      "\nStatus:", error?.response?.status,
      "\nResponse:", logLimitedData(error?.response?.data || error.message)
    );

    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized! Logging out...");
      await AsyncStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

// 📌 API Request Function
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
      url: `api${endpoint}`,
      headers,
      cancelToken: cancelTokenSource.token,
    };

    if (body && method !== "GET") {
      config.data = body;
    }

    const response = await api.request(config);
    return response;
  } catch (error: any) {
    console.error(`❌ API Request Error for route ${endpoint}:`, logLimitedData(error?.response?.data || error.message));
    throw error?.response?.data || { message: "API request failed" };
  }
};

export { apiRequest, cancelRequests };
export default api;
