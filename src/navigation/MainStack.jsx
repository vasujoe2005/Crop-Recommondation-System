import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MapScreen from '../screens/MapScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import FarmDetailsScreen from '../screens/FarmDetailsScreen';
import CropGuideScreen from '../screens/CropGuideScreen';
import { APP_NAME } from '../theme/brand';
import { colors, typography } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardHeaderLogo() {
  return <Image source={require('../../assets/geocrop-growth-logo.png')} style={styles.dashboardHeaderLogo} resizeMode="contain" />;
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { ...typography.display, fontSize: 24, color: colors.text },
        headerTintColor: colors.text,
        tabBarShowIcon: false,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10, backgroundColor: colors.surface, borderTopWidth: 2, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { ...typography.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          headerTitle: '',
          headerLeft: () => <DashboardHeaderLogo />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          title: `${APP_NAME} History`,
          tabBarLabel: 'History',
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { ...typography.display, fontSize: 24, color: colors.text },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: `${APP_NAME} Map` }} />
      <Stack.Screen name="FarmDetailsScreen" component={FarmDetailsScreen} options={{ title: `${APP_NAME} Farm` }} />
      <Stack.Screen name="RecommendationScreen" component={RecommendationScreen} options={{ title: `${APP_NAME} Crops` }} />
      <Stack.Screen name="CropGuideScreen" component={CropGuideScreen} options={{ title: `${APP_NAME} Guide` }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  dashboardHeaderLogo: {
    marginTop:50,
    marginStart: -40,
    width: 180,
    height: 180,
    marginBottom: 50
  },
});
