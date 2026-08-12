import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Notice, Page, PageHeader, palette, StatusPill } from '@/components/mobile-ui';
import { listMySchedules, updateMyScheduleStatus } from '@/lib/api';
import type { ServiceSchedule } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(value)).replace(',', ' ·');
}

export default function SchedulesScreen() {
  const { session } = useAuth();
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const refresh = useCallback(async () => {
    if (!session) return;
    try { setSchedules(await listMySchedules(session.access_token)); setError(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar suas escalas.'); } finally { setIsLoading(false); }
  }, [session]);
  useEffect(() => { const timer = setTimeout(() => { void refresh(); }, 0); return () => clearTimeout(timer); }, [refresh]);
  const updateStatus = async (schedule: ServiceSchedule, status: 'CONFIRMED' | 'DECLINED') => {
    if (!session) return;
    setSavingId(schedule.id);
    try { const updated = await updateMyScheduleStatus(session.access_token, schedule.id, status); setSchedules((current) => current.map((item) => item.id === updated.id ? updated : item)); } catch (reason) { Alert.alert('Não foi possível atualizar', reason instanceof Error ? reason.message : 'Tente novamente.'); } finally { setSavingId(''); }
  };
  const requestStatusUpdate = (schedule: ServiceSchedule, status: 'CONFIRMED' | 'DECLINED') => {
    const confirming = status === 'CONFIRMED';
    Alert.alert(
      confirming ? 'Confirmar presença?' : 'Recusar esta escala?',
      confirming ? 'Sua equipe será avisada de que você confirmou a participação.' : 'Sua liderança será avisada de que você não poderá servir nesta escala.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: confirming ? 'Confirmar' : 'Recusar', style: confirming ? 'default' : 'destructive', onPress: () => void updateStatus(schedule, status) },
      ],
    );
  };
  const upcoming = schedules.filter((schedule) => new Date(schedule.data) >= new Date());
  return <Page refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { setIsLoading(true); void refresh(); }} tintColor={palette.navy} />}><PageHeader eyebrow="MINHA AGENDA DE SERVIÇO" title="Minhas escalas" subtitle="Confirme sua disponibilidade ou avise sua liderança." />{isLoading ? <ActivityIndicator color={palette.navy} style={styles.loading} /> : error ? <Notice tone="warning" icon="alert-circle-outline" text={error} /> : upcoming.length ? upcoming.map((schedule) => <Card key={schedule.id} style={styles.card}><View style={styles.header}><View style={styles.icon}><Ionicons name="musical-notes-outline" color={palette.blue} size={19} /></View><StatusPill value={schedule.status} /></View><Text style={styles.title}>{schedule.funcao}</Text><Text style={styles.area}>{schedule.team.serviceArea.nome} · {schedule.team.nome}</Text><Text style={styles.date}>{formatDate(schedule.data)}</Text>{schedule.event ? <Text style={styles.event}>{schedule.event.titulo}</Text> : null}{schedule.observacao ? <Text style={styles.note}>{schedule.observacao}</Text> : null}{schedule.status === 'SCHEDULED' ? <View style={styles.actions}><Pressable disabled={savingId === schedule.id} style={styles.secondary} onPress={() => requestStatusUpdate(schedule, 'DECLINED')}><Text style={styles.secondaryText}>Não posso servir</Text></Pressable><Pressable disabled={savingId === schedule.id} style={styles.primary} onPress={() => requestStatusUpdate(schedule, 'CONFIRMED')}>{savingId === schedule.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Confirmar</Text>}</Pressable></View> : null}</Card>) : <Notice tone="info" icon="calendar-outline" text="Você não possui escalas futuras." />}</Page>;
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 }, card: { marginBottom: 10 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, icon: { alignItems: 'center', backgroundColor: palette.blueSoft, borderRadius: 10, height: 36, justifyContent: 'center', width: 36 }, title: { color: palette.ink, fontSize: 19, fontWeight: '800', marginTop: 15 }, area: { color: palette.muted, fontSize: 12, marginTop: 4 }, date: { color: palette.ink, fontSize: 12, fontWeight: '700', marginTop: 14, textTransform: 'capitalize' }, event: { color: palette.blue, fontSize: 11, fontWeight: '700', marginTop: 5 }, note: { color: palette.muted, fontSize: 12, fontStyle: 'italic', lineHeight: 18, marginTop: 9 }, actions: { flexDirection: 'row', gap: 9, marginTop: 16 }, secondary: { alignItems: 'center', borderColor: palette.line, borderRadius: 10, borderWidth: 1, flex: 1, height: 42, justifyContent: 'center' }, secondaryText: { color: palette.ink, fontSize: 12, fontWeight: '800' }, primary: { alignItems: 'center', backgroundColor: palette.navy, borderRadius: 10, flex: 1, height: 42, justifyContent: 'center' }, primaryText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
