import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://your-backend-api.com/api';

// Mock user data for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  }
];

export const login = async (email: string, password: string) => {
  // For a real application, you'd call your API
  // const response = await fetch(`${API_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ email, password }),
  // });
  
  // const data = await response.json();
  
  // if (!response.ok) {
  //   throw new Error(data.message || 'Login failed');
  // }
  
  // return data;

  // Mock implementation for demo
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (user && user.password === password) {
        const { password, ...userWithoutPassword } = user;
        
        resolve({
          user: userWithoutPassword,
          token: 'mock-jwt-token'
        });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000);
  });
};

export const register = async (name: string, email: string, password: string) => {
  // For a real application, you'd call your API
  // const response = await fetch(`${API_URL}/auth/register`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ name, email, password, role: 'admin' }),
  // });
  
  // const data = await response.json();
  
  // if (!response.ok) {
  //   throw new Error(data.message || 'Registration failed');
  // }
  
  // return data;

  // Mock implementation for demo
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_USERS.some(u => u.email === email)) {
        reject(new Error('Email already in use'));
      } else {
        const newUser = {
          id: (MOCK_USERS.length + 1).toString(),
          name,
          email,
          password,
          role: 'admin'
        };
        
        MOCK_USERS.push(newUser);
        
        const { password: _, ...userWithoutPassword } = newUser;
        
        resolve({
          user: userWithoutPassword,
          token: 'mock-jwt-token'
        });
      }
    }, 1000);
  });
};

export const logout = async () => {
  // For a real application, you'd call your API
  // const token = await AsyncStorage.getItem('token');
  
  // const response = await fetch(`${API_URL}/auth/logout`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   }
  // });
  
  // if (!response.ok) {
  //   const data = await response.json();
  //   throw new Error(data.message || 'Logout failed');
  // }
  
  // return true;

  // Mock implementation for demo
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};

export const verifyToken = async () => {
  // For a real application, you'd call your API
  // const token = await AsyncStorage.getItem('token');
  
  // if (!token) {
  //   throw new Error('No token found');
  // }
  
  // const response = await fetch(`${API_URL}/auth/verify`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`
  //   }
  // });
  
  // const data = await response.json();
  
  // if (!response.ok) {
  //   throw new Error(data.message || 'Token verification failed');
  // }
  
  // return data.user;

  // Mock implementation for demo
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userString = AsyncStorage.getItem('user');
      if (userString) {
        resolve(JSON.parse(userString));
      } else {
        reject(new Error('No user found'));
      }
    }, 500);
  });
};