import { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  ink: '#17273d',
  muted: '#68758a',
  line: '#e5eaf1',
  canvas: '#f6f8fb',
  surface: '#ffffff',
  navy: '#18335d',
  blue: '#2e6fe8',
  blueSoft: '#edf4ff',
  orange: '#ef8f4a',
  orangeSoft: '#fff2e9',
  green: '#2caa81',
  greenSoft: '#eaf8f3',
  red: '#e76668',
  redSoft: '#fff0f0',
};

export function Page({ children, refreshControl }: { children: ReactNode; refreshControl?: ReactNode }) {
  return <SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={styles.page} refreshControl={refreshControl as never} showsVerticalScrollIndicator={false}>{children}</ScrollView></SafeAreaView>;
}

export function PageHeader({ eyebrow, title, subtitle, compact = false }: { eyebrow: string; title: string; subtitle?: string; compact?: boolean }) {
  return <View style={[styles.header, compact && styles.headerCompact]}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Notice({ tone, icon, text }: { tone: 'info' | 'success' | 'warning'; icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const color = tone === 'success' ? palette.green : tone === 'warning' ? palette.orange : palette.blue;
  const background = tone === 'success' ? palette.greenSoft : tone === 'warning' ? palette.orangeSoft : palette.blueSoft;
  return <View style={[styles.notice, { backgroundColor: background }]}><Ionicons name={icon} size={18} color={color} /><Text style={[styles.noticeText, { color }]}>{text}</Text></View>;
}

const statusLabels = { SCHEDULED: 'Pendente', CONFIRMED: 'Confirmada', DECLINED: 'Recusada', COMPLETED: 'Concluída' } as const;

export function StatusPill({ value }: { value: keyof typeof statusLabels }) {
  const color = value === 'CONFIRMED' || value === 'COMPLETED' ? palette.green : value === 'DECLINED' ? palette.red : palette.orange;
  const background = value === 'CONFIRMED' || value === 'COMPLETED' ? palette.greenSoft : value === 'DECLINED' ? palette.redSoft : palette.orangeSoft;
  return <View style={[styles.pill, { backgroundColor: background }]}><Text style={[styles.pillText, { color }]}>{statusLabels[value]}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.canvas, flex: 1 },
  page: { padding: 20, paddingBottom: 36 },
  header: { marginBottom: 20 },
  headerCompact: { marginBottom: 11, marginTop: 11 },
  eyebrow: { color: '#9aa5b5', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontFamily: 'Georgia', fontSize: 29, fontWeight: '700', letterSpacing: -0.5, marginTop: 6 },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  card: { backgroundColor: palette.surface, borderColor: palette.line, borderRadius: 16, borderWidth: 1, padding: 16 },
  notice: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 9, marginBottom: 8, padding: 13 },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  pill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  pillText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
});
