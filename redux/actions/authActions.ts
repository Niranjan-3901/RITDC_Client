import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreSession } from '../slices/authSlice';
import { AppDispatch } from '../store';

export const loadSession = () => async (dispatch: AppDispatch) => {
  const token = await AsyncStorage.getItem('token');
  const user = await AsyncStorage.getItem('user');

  if (token && user) {
    dispatch(restoreSession({ token, user: JSON.parse(user) }));
  }
};


// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Dispatch } from '@reduxjs/toolkit';
// import apiRequest from '../../services/genericApiHandler';
// import { loginFailure, loginStart, loginSuccess, logout, restoreSession } from '../slices/authSlice';

// // ✅ Login Action (with AsyncStorage)
// export const loginUser = (email: string, password: string) => async (dispatch: Dispatch) => {
//   try {
//     dispatch(loginStart());
    
//     const response:any = await apiRequest('/auth/login', {
//       method: 'POST',
//       data: {email, password}
//     });

//     if (response?.token) {
//       await AsyncStorage.setItem('token', response.token);
//       await AsyncStorage.setItem('user', JSON.stringify(response.user));
//       dispatch(loginSuccess({ user: response.user, token: response.token }));
//     } else {
//       dispatch(loginFailure('Invalid login response.'));
//     }
//   } catch (error: any) {
//     dispatch(loginFailure(error.message || 'Login failed.'));
//   }
// };

// // ✅ Restore Session on App Start
// export const restoreSessionFromStorage = () => async (dispatch: Dispatch) => {
//   try {
//     const token = await AsyncStorage.getItem('token');
//     const user = await AsyncStorage.getItem('user');

//     if (token && user) {
//       dispatch(restoreSession({ user: JSON.parse(user), token }));
//     }
//   } catch (error) {
//     console.error('Failed to restore session:', error);
//   }
// };

// // ✅ Logout Action
// export const logoutUser = () => async (dispatch: Dispatch) => {
//   await AsyncStorage.removeItem('token');
//   await AsyncStorage.removeItem('user');
//   dispatch(logout());
// };
