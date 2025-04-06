import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import { loadSession } from './redux/actions/authActions';
import { AlertProvider, registerAlertFunction, useAlert } from './utils/Alert/AlertManager';


const MainApp = () => {
  const dispatch = useDispatch();
  const showAlert = useAlert();

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  useEffect(() => {
    registerAlertFunction(showAlert);
  }, [showAlert])

  return <AppNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <ThemeProvider>
              <AlertProvider>
                <AuthProvider>
                  <StatusBar style="auto" />
                  <MainApp />
                </AuthProvider>
              </AlertProvider>
            </ThemeProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}