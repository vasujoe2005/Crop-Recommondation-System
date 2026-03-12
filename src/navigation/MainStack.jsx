import React, { useContext } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MapScreen from '../screens/MapScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import AuthContext from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#F4F7F0' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: '#1F2937' },
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
        },
        tabBarActiveTintColor: '#2F855A',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 18, color }}>{route.name === 'DashboardTab' ? '🌿' : '🕘'}</Text>
        ),
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: `Hello${user?.name ? `, ${user.name}` : ''}`,
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          title: 'Recommendation History',
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
        headerStyle: { backgroundColor: '#F4F7F0' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: '#1F2937' },
        contentStyle: { backgroundColor: '#F4F7F0' },
      }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: 'Select Farm Land' }} />
      <Stack.Screen
        name="RecommendationScreen"
        component={RecommendationScreen}
        options={{ title: 'Crop Recommendation' }}
      />
    </Stack.Navigator>
  );
}
