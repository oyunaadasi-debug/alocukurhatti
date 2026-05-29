import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Text } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { C, R, S, elevation } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      return Alert.alert('Eksik Bilgi', 'E-posta ve şifre gereklidir.');
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigation.navigate('Main');
    } catch (err: any) {
      const msg = err?.response?.data?.error
        || (err?.message === 'Network Error' ? 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.' : 'E-posta veya şifre hatalı.');
      Alert.alert('Giriş Başarısız', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Başlık */}
        <View style={s.hero}>
          <Text style={s.logo}>🕳️</Text>
          <Text style={s.appName}>Alo Çukur Hattı</Text>
          <Text style={s.tagline}>Türkiye'nin yol hasar haritası</Text>
        </View>

        {/* Kart */}
        <View style={[s.card, elevation(2)]}>
          <Text style={s.cardTitle}>Giriş Yap</Text>

          {/* E-posta */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>E-posta</Text>
            <View style={s.inputRow}>
              <Ionicons name="mail-outline" size={18} color={C.mute} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="ornek@email.com"
                placeholderTextColor={C.mute}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Şifre */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Şifre</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={C.mute} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="En az 6 karakter"
                placeholderTextColor={C.mute}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showPass ? 'eye' : 'eye-off-outline'} size={18} color={C.mute} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Giriş butonu */}
          <TouchableOpacity
            style={[s.primaryBtn, elevation(4), loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading
              ? <ActivityIndicator color={C.onPrimary} />
              : <Text style={s.primaryBtnText}>Giriş Yap</Text>
            }
          </TouchableOpacity>

          {/* Ayraç */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>veya</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Kayıt ol */}
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={s.secondaryBtnText}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>

        {/* Anonim devam */}
        <TouchableOpacity style={s.skipBtn} onPress={() => navigation.goBack()}>
          <Text style={s.skipText}>Giriş yapmadan devam et →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: C.canvasSoft,
    padding: S.lg,
    justifyContent: 'center',
  },

  hero: { alignItems: 'center', marginBottom: S.xl3 },
  logo:    { fontSize: 56, marginBottom: S.sm },
  appName: { fontSize: 24, fontWeight: '800', color: C.ink, marginBottom: 4 },
  tagline: { fontSize: 14, color: C.body },

  card: {
    backgroundColor: C.canvas,
    borderRadius: R.xl,
    padding: S.xl2,
    gap: S.md,
    marginBottom: S.lg,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: S.xs },

  fieldWrap: { gap: S.xs },
  label:    { fontSize: 13, fontWeight: '600', color: C.body },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.canvasSoft,
    borderRadius: R.md, borderWidth: 1, borderColor: C.canvasSofter,
    paddingHorizontal: S.md,
  },
  inputIcon: { marginRight: S.xs },
  input: {
    flex: 1, height: 48,
    fontSize: 15, color: C.ink,
  },
  eyeBtn: { padding: S.xs },

  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: R.pill,
    height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: S.xs,
  },
  primaryBtnText: { color: C.onPrimary, fontSize: 16, fontWeight: '700' },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.canvasSofter },
  dividerText: { fontSize: 13, color: C.mute },

  secondaryBtn: {
    borderRadius: R.pill, height: 52,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: C.canvasSofter,
  },
  secondaryBtnText: { color: C.ink, fontSize: 15, fontWeight: '600' },

  skipBtn: { alignItems: 'center', marginTop: S.sm },
  skipText: { fontSize: 13, color: C.mute },
});
