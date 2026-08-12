import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Notice, Page, PageHeader, palette } from '@/components/mobile-ui';
import { listAgendaEvents } from '@/lib/api';
import type { AgendaEvent } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)).replace('.', '').replace(',', ' ·');
}

export default function AgendaScreen() {
  const { session } = useAuth();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => { if (!session) return; try { setEvents(await listAgendaEvents(session.access_token)); setError(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar a agenda.'); } finally { setIsLoading(false); } }, [session]);
  useEffect(() => { const timer = setTimeout(() => { void refresh(); }, 0); return () => clearTimeout(timer); }, [refresh]);
  const upcoming = events.filter((event) => new Date(event.inicio) >= new Date());
  return <Page refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { setIsLoading(true); void refresh(); }} tintColor={palette.navy} />}><PageHeader eyebrow="AGENDA INSTITUCIONAL" title="Próximos eventos" subtitle="Programações da igreja para os próximos dias." />{isLoading ? <ActivityIndicator color={palette.navy} style={styles.loading} /> : error ? <Notice tone="warning" icon="alert-circle-outline" text={error} /> : upcoming.length ? upcoming.map((event) => <Card key={event.id} style={styles.card}><View style={styles.top}><View style={styles.icon}><Ionicons name={event.type === 'WORSHIP' ? 'heart-outline' : 'calendar-outline'} color={palette.orange} size={20} /></View><Text style={styles.type}>{event.type === 'WORSHIP' ? 'CULTO' : event.type}</Text></View><Text style={styles.title}>{event.titulo}</Text><Text style={styles.date}>{formatDate(event.inicio)}</Text><Text style={styles.campus}>{event.campus.nome}</Text>{event.descricao ? <Text style={styles.copy}>{event.descricao}</Text> : null}{event.serviceAreas.length ? <View style={styles.areas}>{event.serviceAreas.map(({ serviceArea }) => <View key={serviceArea.id} style={styles.area}><Text style={styles.areaText}>{serviceArea.nome}</Text></View>)}</View> : null}</Card>) : <Notice tone="info" icon="calendar-outline" text="Não há eventos futuros para exibir." />}</Page>;
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 }, card: { marginBottom: 10 }, top: { alignItems: 'center', flexDirection: 'row', gap: 9 }, icon: { alignItems: 'center', backgroundColor: palette.orangeSoft, borderRadius: 10, height: 36, justifyContent: 'center', width: 36 }, type: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 }, title: { color: palette.ink, fontSize: 18, fontWeight: '800', marginTop: 15 }, date: { color: palette.ink, fontSize: 12, fontWeight: '700', marginTop: 9, textTransform: 'capitalize' }, campus: { color: palette.muted, fontSize: 12, marginTop: 4 }, copy: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }, areas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 }, area: { backgroundColor: palette.blueSoft, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 }, areaText: { color: palette.blue, fontSize: 10, fontWeight: '700' },
});
