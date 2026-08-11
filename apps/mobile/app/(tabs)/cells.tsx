import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Notice, Page, PageHeader, palette } from '@/components/mobile-ui';
import { listMyCells } from '@/lib/api';
import type { CellMembership } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

const days: Record<string, string> = { MONDAY: 'Segunda-feira', TUESDAY: 'Terça-feira', WEDNESDAY: 'Quarta-feira', THURSDAY: 'Quinta-feira', FRIDAY: 'Sexta-feira', SATURDAY: 'Sábado', SUNDAY: 'Domingo' };

export default function CellsScreen() {
  const { session } = useAuth();
  const [cells, setCells] = useState<CellMembership[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try { setCells(await listMyCells(session.access_token)); setError(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar sua célula.'); } finally { setIsLoading(false); }
  }, [session]);
  useEffect(() => { void refresh(); }, [refresh]);
  return <Page refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor={palette.navy} />}><PageHeader eyebrow="CUIDADO QUE COMEÇA PERTO" title="Minha célula" subtitle="Encontre o dia, horário e campus do seu encontro." />{isLoading ? <ActivityIndicator color={palette.navy} style={styles.loading} /> : error ? <Notice tone="warning" icon="alert-circle-outline" text={error} /> : cells.length ? cells.map((membership) => <Card key={membership.id} style={styles.card}><View style={styles.icon}><Ionicons name="people" color={palette.blue} size={23} /></View><Text style={styles.title}>{membership.cell.nome}</Text><Text style={styles.copy}>{membership.cell.descricao || 'Crescimento, cuidado e comunhão.'}</Text><View style={styles.details}><View><Text style={styles.detailLabel}>ENCONTRO</Text><Text style={styles.detailValue}>{membership.cell.meetingDay ? days[membership.cell.meetingDay] ?? membership.cell.meetingDay : 'A definir'}{membership.cell.meetingTime ? ` · ${membership.cell.meetingTime}` : ''}</Text></View><View><Text style={styles.detailLabel}>CAMPUS</Text><Text style={styles.detailValue}>{membership.cell.campus.nome}</Text></View></View></Card>) : <Notice tone="info" icon="people-outline" text="Você ainda não possui vínculo ativo com uma célula." />}</Page>;
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 },
  card: { gap: 8 },
  icon: { alignItems: 'center', backgroundColor: palette.blueSoft, borderRadius: 13, height: 46, justifyContent: 'center', marginBottom: 4, width: 46 },
  title: { color: palette.ink, fontFamily: 'Georgia', fontSize: 23, fontWeight: '700' },
  copy: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  details: { borderTopColor: palette.line, borderTopWidth: 1, flexDirection: 'row', gap: 26, marginTop: 7, paddingTop: 13 },
  detailLabel: { color: '#9aa5b5', fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  detailValue: { color: palette.ink, fontSize: 12, fontWeight: '700', marginTop: 4 },
});
