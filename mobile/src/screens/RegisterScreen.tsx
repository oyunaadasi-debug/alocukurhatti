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

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password) {
      return Alert.alert('Eksik Bilgi', 'E-posta ve şifre gereklidir.');
    }
    if (password.length < 6) {
      return Alert.alert('Kısa Şifre', 'Şifre en az 6 karakter olmalı.');
    }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, name.trim());
      navigation.navigate('Main');
    } catch (err: any) {
      const msg = err?.response?.data?.error
        || err?.response?.data?.errors?.[0]?.msg
        || (err?.message === 'Network Error' ? 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.' : 'Kayıt olunamadı.');
      Alert.alert('Kayıt Başarısız', msg);
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
        <View style={s.hero}>
          <Text style={s.logo}>🕳️</Text>
          <Text style={s.appName}>Hesap Oluştur</Text>
          <Text style={s.tagline}>Raporlarınızı takip edin, bildirim alın</Text>
        </View>

        <View style={[s.card, elevation(2)]}>

          {/* İsim */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>İsim (isteğe bağlı)</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color={C.mute} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Adınız Soyadınız"
                placeholderTextColor={C.mute}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* E-posta */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>E-posta *</Text>
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
            <Text style={s.label}>Şifre * (en az 6 karakter)</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={C.mute} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Güçlü bir şifre seçin"
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

          {/* Bilgi notu */}
          <View style={s.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={C.secondary} />
            <Text style={s.infoText}>
              Giriş yapılmadan da anonim rapor gönderilebilir. Hesap oluşturmak; raporlarınızı takip etmenizi ve çözüldüğünde bildirim almanızı sağlar.
            </Text>
          </View>

          {/* Kayıt ol butonu */}
          <TouchableOpacity
            style={[s.primaryBtn, elevation(4), loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading
              ? <ActivityIndicator color={C.onPrimary} />
              : <Text style={s.primaryBtnText}>Kayıt Ol</Text>
            }
          </TouchableOpacity>

          {/* Zaten hesabım var */}
          <TouchableOpacity style={s.linkBtn} onPress={() => navigation.goBack()}>
            <Text style={s.linkText}>Zaten hesabım var → Giriş Yap</Text>
          </TouchableOpacity>
        </View>
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
  tagline: { fontSize: 14, color: C.body, textAlign: 'center' },

  card: {
    backgroundColor: C.canvas,
    borderRadius: R.xl,
    padding: S.xl2,
    gap: S.md,
  },

  fieldWrap: { gap: S.xs },
  label: { fontSize: 13, fontWeight: '600', color: C.body },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.canvasSoft,
    borderRadius: R.md, borderWidth: 1, borderColor: C.canvasSofter,
    paddingHorizontal: S.md,
  },
  inputIcon: { marginRight: S.xs },
  input: { flex: 1, height: 48, fontSize: 15, color: C.ink },
  eyeBtn: { padding: S.xs },

  infoBox: {
    flexDirection: 'row', gap: S.xs,
    backgroundColor: C.secondaryContainer,
    borderRadius: R.md, padding: S.md,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 12, color: C.secondary, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: R.pill, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: S.xs,
  },
  primaryBtnText: { color: C.onPrimary, fontSize: 16, fontWeight: '700' },

  linkBtn: { alignItems: 'center', paddingVertical: S.xs },
  linkText: { fontSize: 13, color: C.mute },
});
