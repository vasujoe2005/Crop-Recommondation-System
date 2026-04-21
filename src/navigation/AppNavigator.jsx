import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import AuthContext from '../context/AuthContext';
import { colors } from '../theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

export default function AppNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  return <NavigationContainer theme={navigationTheme}>{isAuthenticated ? <MainStack /> : <AuthStack />}</NavigationContainer>;
}
