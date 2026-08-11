import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { palette } from '@/components/mobile-ui';
import { useAuth } from '@/providers/auth-provider';

export default function IndexScreen() {
  const { session, isRestoring } = useAuth();
  if (isRestoring) return <View style={{ alignItems: 'center', backgroundColor: palette.canvas, flex: 1, justifyContent: 'center' }}><ActivityIndicator color={palette.navy} /></View>;
  return <Redirect href={session ? '/(tabs)' : '/login'} />;
}
