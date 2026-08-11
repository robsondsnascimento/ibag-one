import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/components/mobile-ui';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { session, signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (session) return <Redirect href="/(tabs)" />;

  const submit = async () => {
    if (!username.trim() || !password) return;
    setError('');
    setIsSaving(true);
    try {
      await signIn(username.trim(), password, remember);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível entrar agora.');
    } finally {
      setIsSaving(false);
    }
  };

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}><View style={styles.top}><View style={styles.brandMark}><Text style={styles.brandMarkText}>I</Text></View><Text style={styles.brand}>IBAG <Text style={styles.brandAccent}>One</Text></Text></View><View style={styles.copy}><Text style={styles.eyebrow}>BEM-VINDO</Text><Text style={styles.title}>Sua igreja{`\n`}na palma da mão.</Text><Text style={styles.subtitle}>Acompanhe sua célula, escalas e agenda de onde estiver.</Text></View><View style={styles.form}><Text style={styles.formTitle}>Entrar na sua conta</Text><Text style={styles.formCopy}>Use apenas seu usuário institucional.</Text><Text style={styles.label}>Usuário</Text><View style={styles.inputWrap}><Ionicons name="person-outline" color={palette.muted} size={18} /><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} editable={!isSaving} placeholder="Seu usuário" placeholderTextColor="#9aa5b5" style={styles.input} /></View><Text style={styles.label}>Senha</Text><View style={styles.inputWrap}><Ionicons name="lock-closed-outline" color={palette.muted} size={18} /><TextInput value={password} onChangeText={setPassword} secureTextEntry={!isVisible} editable={!isSaving} placeholder="Sua senha" placeholderTextColor="#9aa5b5" style={styles.input} onSubmitEditing={() => void submit()} /><Pressable onPress={() => setIsVisible((current) => !current)} hitSlop={10}><Ionicons name={isVisible ? 'eye-off-outline' : 'eye-outline'} color={palette.blue} size={19} /></Pressable></View><View style={styles.remember}><View><Text style={styles.rememberTitle}>Manter conectado</Text><Text style={styles.rememberCopy}>Armazena sua sessão com segurança.</Text></View><Switch value={remember} onValueChange={setRemember} trackColor={{ false: '#dfe5ed', true: '#9fc0fa' }} thumbColor={remember ? palette.blue : '#fff'} /></View>{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable style={[styles.button, (!username.trim() || !password || isSaving) && styles.buttonDisabled]} disabled={!username.trim() || !password || isSaving} onPress={() => void submit()}>{isSaving ? <ActivityIndicator color="#fff" /> : <><Text style={styles.buttonText}>Entrar no IBAG One</Text><Ionicons name="arrow-forward" color="#fff" size={18} /></>}</Pressable><Text style={styles.footnote}>O domínio @ibag.one é completado automaticamente.</Text></View></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.navy, flex: 1 },
  container: { backgroundColor: palette.navy, flex: 1, padding: 24 },
  top: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  brandMark: { alignItems: 'center', backgroundColor: palette.orange, borderRadius: 9, height: 31, justifyContent: 'center', width: 31 },
  brandMarkText: { color: '#fff', fontFamily: 'Georgia', fontSize: 23, fontStyle: 'italic', fontWeight: '700' },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  brandAccent: { color: '#f6c9a4' },
  copy: { marginTop: 58 },
  eyebrow: { color: '#f6c9a4', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#fff', fontFamily: 'Georgia', fontSize: 37, fontWeight: '700', letterSpacing: -0.7, lineHeight: 42, marginTop: 12 },
  subtitle: { color: '#d3def0', fontSize: 14, lineHeight: 21, marginTop: 13, maxWidth: 290 },
  form: { backgroundColor: '#fff', borderRadius: 22, gap: 9, marginTop: 'auto', padding: 20 },
  formTitle: { color: palette.ink, fontFamily: 'Georgia', fontSize: 23, fontWeight: '700' },
  formCopy: { color: palette.muted, fontSize: 12, lineHeight: 18, marginBottom: 6 },
  label: { color: palette.ink, fontSize: 11, fontWeight: '800', marginTop: 5 },
  inputWrap: { alignItems: 'center', backgroundColor: '#fff', borderColor: palette.line, borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 9, height: 48, paddingHorizontal: 12 },
  input: { color: palette.ink, flex: 1, fontSize: 14, height: '100%' },
  remember: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rememberTitle: { color: palette.ink, fontSize: 11, fontWeight: '700' },
  rememberCopy: { color: palette.muted, fontSize: 10, marginTop: 2 },
  error: { backgroundColor: palette.redSoft, borderRadius: 9, color: '#b23f47', fontSize: 11, lineHeight: 16, padding: 10 },
  button: { alignItems: 'center', backgroundColor: palette.navy, borderRadius: 11, flexDirection: 'row', gap: 8, height: 49, justifyContent: 'center', marginTop: 5 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  footnote: { color: '#9aa5b5', fontSize: 10, lineHeight: 14, marginTop: 4, textAlign: 'center' },
});
