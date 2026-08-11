import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Card, Page, PageHeader, palette } from '@/components/mobile-ui';
import { useAuth } from '@/providers/auth-provider';

function initials(name: string) { return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  if (!session) return <Redirect href="/login" />;
  const person = session.user.person;
  const logout = () => Alert.alert('Sair da conta', 'Você precisará informar seu usuário e senha novamente.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => void signOut() }]);
  return <Page><PageHeader eyebrow="MINHA CONTA" title="Perfil" subtitle="Informações do seu acesso na IBAG." /><Card style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(person.nome)}</Text></View><View style={styles.profileCopy}><Text style={styles.name}>{person.nome}</Text><Text style={styles.login}>{session.user.loginEmail}</Text><Text style={styles.org}>{session.user.organization.nome}</Text></View></Card><PageHeader eyebrow="VÍNCULOS" title="Campi" compact />{person.campusMemberships.map(({ campus }) => <Card key={campus.id} style={styles.campus}><Ionicons name="location-outline" color={palette.blue} size={20} /><Text style={styles.campusName}>{campus.nome}</Text>{campus.id === person.campusId ? <Text style={styles.mainCampus}>Principal</Text> : null}</Card>)}<PageHeader eyebrow="ACESSO" title="Sessão" compact /><Pressable style={styles.logout} onPress={logout}><Ionicons name="log-out-outline" color={palette.red} size={19} /><Text style={styles.logoutText}>Sair da conta</Text></Pressable><Text style={styles.note}>Seus dados e permissões continuam protegidos pela organização IBAG.</Text></Page>;
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', flexDirection: 'row', gap: 13 }, avatar: { alignItems: 'center', backgroundColor: palette.orangeSoft, borderRadius: 18, height: 58, justifyContent: 'center', width: 58 }, avatarText: { color: palette.orange, fontSize: 17, fontWeight: '800' }, profileCopy: { flex: 1 }, name: { color: palette.ink, fontSize: 17, fontWeight: '800' }, login: { color: palette.muted, fontSize: 12, marginTop: 3 }, org: { color: palette.blue, fontSize: 11, fontWeight: '700', marginTop: 7 }, campus: { alignItems: 'center', flexDirection: 'row', gap: 11, marginBottom: 8 }, campusName: { color: palette.ink, flex: 1, fontSize: 13, fontWeight: '700' }, mainCampus: { backgroundColor: palette.blueSoft, borderRadius: 20, color: palette.blue, fontSize: 9, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textTransform: 'uppercase' }, logout: { alignItems: 'center', backgroundColor: palette.redSoft, borderRadius: 12, flexDirection: 'row', gap: 9, padding: 14 }, logoutText: { color: palette.red, fontSize: 13, fontWeight: '800' }, note: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 15, textAlign: 'center' },
});
