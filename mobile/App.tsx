import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  useFonts,
  PlusJakartaSans_200ExtraLight,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { C } from './src/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import HomeScreen         from './src/screens/HomeScreen';
import MapScreen          from './src/screens/MapScreen';
import AddReportScreen    from './src/screens/AddReportScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import LeaderboardScreen  from './src/screens/LeaderboardScreen';
import ProfileScreen      from './src/screens/ProfileScreen';
import LoginScreen        from './src/screens/LoginScreen';
import RegisterScreen     from './src/screens/RegisterScreen';
import AboutScreen        from './src/screens/AboutScreen';
import OnboardingScreen   from './src/screens/OnboardingScreen';
import { KeyboardDismissAccessory } from './src/components/KeyboardDismissAccessory';

const ONBOARDING_KEY = 'onboarding_done';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const headerOpts = {
  headerStyle: { backgroundColor: C.canvas },
  headerTintColor: C.primary,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

// ── Auth Stack — root seviyesinde modal olarak açılır ──────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, ...headerOpts, title: 'Kayıt Ol' }} />
    </Stack.Navigator>
  );
}

// ── Ana Sayfa Stack ────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="Home"         component={HomeScreen}         options={{ title: 'Alo Çukur Hattı 🕳️' }} />
      <Stack.Screen name="AddReport"    component={AddReportScreen}    options={{ title: 'Çukur Bildir' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Rapor Detayı' }} />
    </Stack.Navigator>
  );
}

// ── Harita Stack ───────────────────────────────────────────────
function MapStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="Map"          component={MapScreen}          options={{ title: 'Alo Çukur Hattı 🕳️' }} />
      <Stack.Screen name="AddReport"    component={AddReportScreen}    options={{ title: 'Çukur Bildir' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Rapor Detayı' }} />
    </Stack.Navigator>
  );
}

// ── Lider Tablosu Stack ────────────────────────────────────────
function LeaderboardStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Map"         component={MapScreen}         options={{ title: 'Harita' }} />
    </Stack.Navigator>
  );
}

// ── Profil Stack — artık AuthStack içermiyor ───────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profilim' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Nasıl Çalışır?' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Rapor Detayı' }} />
    </Stack.Navigator>
  );
}

const TAB_ICONS: Record<string, [string, string]> = {
  HomeTab:    ['home',   'home-outline'],
  MapTab:     ['map',    'map-outline'],
  StatsTab:   ['podium', 'podium-outline'],
  ProfileTab: ['person', 'person-outline'],
};

// ── Ana Tab Navigasyonu ────────────────────────────────────────
function MainApp() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   C.primary,
        tabBarInactiveTintColor: C.mute,
        tabBarStyle: { paddingBottom: 4, height: 58, borderTopColor: C.canvasSofter },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
        tabBarBadge: route.name === 'ProfileTab' && !user ? '!' : undefined,
        tabBarBadgeStyle: { backgroundColor: C.primary, color: '#fff', fontSize: 10 },
      })}
    >
      <Tab.Screen name="HomeTab"    component={HomeStack}        options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="MapTab"     component={MapStack}         options={{ title: 'Harita' }} />
      <Tab.Screen name="StatsTab"   component={LeaderboardStack} options={{ title: 'Sıralama' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack}     options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

// ── Root Navigator — Auth modal root seviyesinde ───────────────
function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.canvas }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Ana uygulama — her zaman erişilebilir (anonim dahil) */}
      <Stack.Screen name="Main" component={MainApp} />
      {/* Auth ekranları — modal olarak üstten açılır */}
      <Stack.Screen
        name="Auth"
        component={AuthStack}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_200ExtraLight,
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // İlk açılış mı? null = henüz okunmadı.
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDING_KEY)
      .then(v => setOnboardingDone(v === '1'))
      .catch(() => setOnboardingDone(true)); // okunamazsa hikayeyi atla
  }, []);

  async function finishOnboarding() {
    setOnboardingDone(true);
    try { await SecureStore.setItemAsync(ONBOARDING_KEY, '1'); } catch {}
  }

  if (!fontsLoaded || onboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.canvas }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="dark" />
          {onboardingDone
            ? <RootNavigator />
            : <OnboardingScreen onDone={finishOnboarding} />}
        </NavigationContainer>
        <KeyboardDismissAccessory />
      </View>
    </AuthProvider>
  );
}
