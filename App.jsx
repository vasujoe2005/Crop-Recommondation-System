import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AuthContext from './src/context/AuthContext';
import { hydrateSession, loginUser, logoutUser, registerUser } from './src/services/auth';
import { colors } from './src/theme/colors';

export default function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    token: null,
    user: null,
  });

  useEffect(() => {
    const bootstrap = async () => {
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
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
    backgroundColor: colors.background,
  },
});
