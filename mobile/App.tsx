import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from './src/theme';

import MapScreen from './src/screens/MapScreen';
import AddReportScreen from './src/screens/AddReportScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const headerOpts = {
  headerStyle: { backgroundColor: C.canvas },
  headerTintColor: C.primary,
  headerTitleStyle: { fontWeight: '700' as const },
};

function MapStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Alo Çukur Hattı 🕳️' }} />
      <Stack.Screen name="AddReport" component={AddReportScreen} options={{ title: 'Çukur Bildir' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Rapor Detayı' }} />
    </Stack.Navigator>
  );
}

function LeaderboardStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Harita' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.primary,
          tabBarInactiveTintColor: C.mute,
          tabBarStyle: { paddingBottom: 4, height: 58 },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, string> = {
              MapTab: focused ? 'map' : 'map-outline',
              StatsTab: focused ? 'podium' : 'podium-outline',
            };
            return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="MapTab" component={MapStack} options={{ title: 'Harita' }} />
        <Tab.Screen name="StatsTab" component={LeaderboardStack} options={{ title: 'Lider Tablosu' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
