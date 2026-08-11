import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { palette } from '@/components/mobile-ui';
import { useAuth } from '@/providers/auth-provider';

export default function TabLayout() {
  const { session, isRestoring } = useAuth();
  if (isRestoring) return <View style={{ alignItems: 'center', backgroundColor: palette.canvas, flex: 1, justifyContent: 'center' }}><ActivityIndicator color={palette.navy} /></View>;
  if (!session) return <Redirect href="/login" />;

  return <Tabs screenOptions={{
    tabBarActiveTintColor: palette.navy,
    tabBarInactiveTintColor: palette.muted,
    tabBarStyle: { borderTopColor: palette.line, height: 68, paddingBottom: 9, paddingTop: 7 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    headerShown: false,
  }}>
    <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, focused }) => <Ionicons size={22} name={focused ? 'home' : 'home-outline'} color={color} /> }} />
    <Tabs.Screen name="cells" options={{ title: 'Células', tabBarIcon: ({ color, focused }) => <Ionicons size={22} name={focused ? 'people' : 'people-outline'} color={color} /> }} />
    <Tabs.Screen name="schedules" options={{ title: 'Escalas', tabBarIcon: ({ color, focused }) => <Ionicons size={22} name={focused ? 'calendar' : 'calendar-outline'} color={color} /> }} />
    <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: ({ color, focused }) => <Ionicons size={22} name={focused ? 'today' : 'today-outline'} color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, focused }) => <Ionicons size={22} name={focused ? 'person' : 'person-outline'} color={color} /> }} />
  </Tabs>;
}
