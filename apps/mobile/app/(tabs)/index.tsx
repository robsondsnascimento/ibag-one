import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Notice, Page, PageHeader, palette, StatusPill } from '@/components/mobile-ui';
import { getCurrentStudy, listAgendaEvents, listMySchedules } from '@/lib/api';
import type { AgendaEvent, CellStudy, ServiceSchedule } from '@/lib/api';
import { shareCurrentStudyAttachment } from '@/lib/study-attachment';
import { useAuth } from '@/providers/auth-provider';

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' }).format(new Date(value)).replace('.', '');
}

export default function HomeScreen() {
  const { session } = useAuth();
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [study, setStudy] = useState<CellStudy | null>(null);
  const [studyMessage, setStudyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningStudy, setIsOpeningStudy] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) return;
    const [scheduleResult, eventResult, studyResult] = await Promise.allSettled([
      listMySchedules(session.access_token),
      listAgendaEvents(session.access_token),
      getCurrentStudy(session.access_token),
    ]);
    if (scheduleResult.status === 'fulfilled') setSchedules(scheduleResult.value);
    if (eventResult.status === 'fulfilled') setEvents(eventResult.value);
    if (studyResult.status === 'fulfilled') {
      setStudy(studyResult.value);
      setStudyMessage('');
    } else {
      setStudy(null);
      setStudyMessage(studyResult.reason instanceof Error ? studyResult.reason.message : 'Estudo indisponível no momento.');
    }
    setIsLoading(false);
  }, [session]);

  useEffect(() => { const timer = setTimeout(() => { void refresh(); }, 0); return () => clearTimeout(timer); }, [refresh]);

  const openStudyAttachment = async () => {
    if (!session || !study) return;
    setIsOpeningStudy(true);
    try {
      await shareCurrentStudyAttachment(session.access_token);
    } catch (reason) {
      Alert.alert('Não foi possível abrir o anexo', reason instanceof Error ? reason.message : 'Tente novamente em alguns instantes.');
    } finally {
      setIsOpeningStudy(false);
    }
  };

  const upcomingSchedules = schedules.filter((schedule) => new Date(schedule.data) >= new Date()).slice(0, 3);
  const upcomingEvents = events.filter((event) => new Date(event.inicio) >= new Date()).slice(0, 3);

  return <Page refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { setIsLoading(true); void refresh(); }} tintColor={palette.navy} />}>
    <PageHeader eyebrow="IBAG ONE" title={`Olá, ${session?.user.person.nome.split(' ')[0] ?? ''}`} subtitle="Sua vida na igreja, organizada em um só lugar." />
    <View style={styles.hero}><View><Text style={styles.heroEyebrow}>PRÓXIMOS PASSOS</Text><Text style={styles.heroTitle}>{upcomingSchedules.length ? `${upcomingSchedules.length} escala${upcomingSchedules.length === 1 ? '' : 's'} para acompanhar` : 'Sua agenda está tranquila'}</Text><Text style={styles.heroCopy}>{upcomingSchedules.length ? 'Confirme sua presença e mantenha sua equipe informada.' : 'Novos compromissos aparecerão aqui.'}</Text></View><Ionicons name="heart" color="#f6c9a4" size={42} /></View>
    <View style={styles.metrics}><Card style={styles.metric}><Ionicons name="calendar-outline" color={palette.blue} size={20} /><Text style={styles.metricValue}>{upcomingSchedules.length}</Text><Text style={styles.metricLabel}>Escalas futuras</Text></Card><Card style={styles.metric}><Ionicons name="people-outline" color={palette.orange} size={20} /><Text style={styles.metricValue}>{upcomingEvents.length}</Text><Text style={styles.metricLabel}>Eventos próximos</Text></Card></View>
    <PageHeader eyebrow="ESTUDO DA SEMANA" title="Célula" compact />
    {study ? <Card><Text style={styles.cardTitle}>{study.titulo}</Text>{study.descricao ? <Text style={styles.copy}>{study.descricao}</Text> : null}<Notice tone="success" icon="checkmark-circle-outline" text="O estudo está liberado para sua célula." /><Pressable disabled={isOpeningStudy} onPress={() => void openStudyAttachment()} style={[styles.attachment, isOpeningStudy && styles.attachmentDisabled]}><View style={styles.attachmentIcon}><Ionicons name="document-text-outline" color={palette.blue} size={20} /></View><View style={styles.attachmentCopy}><Text style={styles.attachmentTitle}>{study.attachmentName}</Text><Text style={styles.attachmentHint}>Toque para abrir ou salvar o anexo</Text></View>{isOpeningStudy ? <ActivityIndicator color={palette.blue} /> : <Ionicons name="open-outline" color={palette.blue} size={20} />}</Pressable></Card> : <Notice tone="info" icon="book-outline" text={studyMessage || 'Consultando a disponibilidade do estudo.'} />}
    <PageHeader eyebrow="SUA AGENDA" title="Próximos compromissos" compact />
    {isLoading ? <ActivityIndicator color={palette.navy} style={styles.loading} /> : upcomingSchedules.length ? upcomingSchedules.map((schedule) => <Card key={schedule.id} style={styles.row}><View style={styles.dateBox}><Text style={styles.dateDay}>{new Date(schedule.data).getDate()}</Text><Text style={styles.dateMonth}>{dateLabel(schedule.data).split(' ')[1] ?? ''}</Text></View><View style={styles.rowMain}><Text style={styles.cardTitle}>{schedule.funcao}</Text><Text style={styles.copy}>{schedule.team.serviceArea.nome} · {schedule.team.nome}</Text><Text style={styles.caption}>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(schedule.data))}{schedule.event ? ` · ${schedule.event.titulo}` : ''}</Text></View><StatusPill value={schedule.status} /></Card>) : <Notice tone="info" icon="calendar-outline" text="Você não possui escalas futuras." />}
  </Page>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: palette.navy, borderRadius: 22, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, padding: 24 },
  heroEyebrow: { color: '#f6c9a4', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontFamily: 'Georgia', fontSize: 27, fontWeight: '700', lineHeight: 32, marginTop: 12, maxWidth: 255 },
  heroCopy: { color: '#d3def0', fontSize: 13, lineHeight: 19, marginTop: 9, maxWidth: 260 },
  metrics: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metric: { flex: 1, gap: 6 },
  metricValue: { color: palette.ink, fontSize: 28, fontWeight: '800' },
  metricLabel: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  cardTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  copy: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  caption: { color: palette.muted, fontSize: 11, marginTop: 5 },
  attachment: { alignItems: 'center', backgroundColor: palette.blueSoft, borderRadius: 12, flexDirection: 'row', gap: 10, marginTop: 12, padding: 11 },
  attachmentDisabled: { opacity: 0.6 },
  attachmentIcon: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 9, height: 36, justifyContent: 'center', width: 36 },
  attachmentCopy: { flex: 1 },
  attachmentTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  attachmentHint: { color: palette.muted, fontSize: 10, marginTop: 3 },
  loading: { marginVertical: 28 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 9 },
  rowMain: { flex: 1 },
  dateBox: { alignItems: 'center', backgroundColor: palette.blueSoft, borderRadius: 12, justifyContent: 'center', minHeight: 52, width: 48 },
  dateDay: { color: palette.blue, fontSize: 19, fontWeight: '800' },
  dateMonth: { color: palette.blue, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
});
