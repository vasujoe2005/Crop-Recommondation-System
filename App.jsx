import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AuthContext from './src/context/AuthContext';
import { hydrateSession, loginUser, logoutUser, registerUser } from './src/services/auth';

export default function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    token: null,
    user: null,
  });

  useEffect(() => {
    // Restore any previously saved session before rendering navigation.
    const bootstrap = async () => {
      if (Platform.OS !== 'web') {
        await ScreenCapture.allowScreenCaptureAsync();
      }
      const session = await hydrateSession();
      setAuthState({
        isLoading: false,
        token: session?.token ?? null,
        user: session?.user ?? null,
      });
    };

    bootstrap();
  }, []);

  const authContextValue = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token),
      signIn: async (credentials) => {
        const session = await loginUser(credentials);
        setAuthState({
          isLoading: false,
          token: session.token,
          user: session.user,
        });
      },
      signUp: async (payload) => registerUser(payload),
      signOut: async () => {
        await logoutUser();
        setAuthState({
          isLoading: false,
          token: null,
          user: null,
        });
      },
      updateUser: (user) => {
        setAuthState((prev) => ({ ...prev, user }));
      },
    }),
    [authState.token, authState.user],
  );

  if (authState.isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loaderContainer}>
          <StatusBar barStyle="dark-content" />
          <ActivityIndicator size="large" color="#2F855A" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthContext.Provider value={authContextValue}>
        <AppNavigator />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F0',
  },
});
