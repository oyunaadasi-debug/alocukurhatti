import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { C, R, S, elevation } from '../theme';

const ROLE_LABEL: Record<string, string> = {
  citizen:      '👤 Vatandaş',
  municipality: '🏛 Belediye Memuru',
  admin:        '⚙️ Admin',
};

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive', onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  }

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={s.logo}>🕳️</Text>
        <Text style={s.guestTitle}>Giriş Yapılmadı</Text>
        <Text style={s.guestSub}>Raporlarınızı takip etmek ve bildirim almak için giriş yapın.</Text>
        <TouchableOpacity
          style={[s.loginBtn, elevation(4)]}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={s.loginBtnText}>Giriş Yap / Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = (user.name || user.email)[0].toUpperCase();

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Avatar + isim */}
      <View style={s.avatarSection}>
        <View style={[s.avatar, elevation(4)]}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <Text style={s.userName}>{user.name || 'Anonim Kullanıcı'}</Text>
        <Text style={s.userEmail}>{user.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{ROLE_LABEL[user.role] ?? user.role}</Text>
        </View>
      </View>

      {/* Bilgi kartı */}
      <View style={[s.infoCard, elevation(1)]}>
        <InfoRow icon="mail-outline" label="E-posta" value={user.email} />
        <View style={s.sep} />
        <InfoRow icon="shield-checkmark-outline" label="Hesap tipi" value={ROLE_LABEL[user.role] ?? user.role} />
        <View style={s.sep} />
        <InfoRow icon="finger-print-outline" label="Kullanıcı ID" value={`#${user.id}`} />
      </View>

      {/* Çıkış */}
      <TouchableOpacity
        style={[s.logoutBtn, loggingOut && { opacity: 0.6 }]}
        onPress={handleLogout}
        disabled={loggingOut}
        activeOpacity={0.8}
      >
        {loggingOut
          ? <ActivityIndicator color={C.error} />
          : <>
              <Ionicons name="log-out-outline" size={20} color={C.error} />
              <Text style={s.logoutText}>Çıkış Yap</Text>
            </>
        }
      </TouchableOpacity>

      <Text style={s.version}>Alo Çukur Hattı v1.0.0</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon as any} size={18} color={C.body} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: C.canvasSoft },
  content: { padding: S.lg, gap: S.lg, paddingBottom: S.xl3 },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: S.xl3, backgroundColor: C.canvasSoft, gap: S.md,
  },
  logo:      { fontSize: 56 },
  guestTitle:{ fontSize: 22, fontWeight: '800', color: C.ink },
  guestSub:  { fontSize: 14, color: C.body, textAlign: 'center', lineHeight: 22 },
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: R.pill,
    paddingVertical: S.lg, paddingHorizontal: S.xl3,
    marginTop: S.sm,
  },
  loginBtnText: { color: C.onPrimary, fontSize: 16, fontWeight: '700' },

  avatarSection: { alignItems: 'center', gap: S.sm, paddingVertical: S.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: C.onPrimary },
  userName:   { fontSize: 22, fontWeight: '800', color: C.ink },
  userEmail:  { fontSize: 14, color: C.body },
  roleBadge: {
    backgroundColor: C.primaryContainer,
    borderRadius: R.pill,
    paddingHorizontal: 14, paddingVertical: 4,
    marginTop: S.xs,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: C.primaryDim },

  infoCard: {
    backgroundColor: C.canvas,
    borderRadius: R.xl, padding: S.lg, gap: S.md,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: S.md },
  infoLabel: { fontSize: 12, color: C.mute },
  infoValue: { fontSize: 15, color: C.ink, fontWeight: '500' },
  sep:       { height: 1, backgroundColor: C.canvasSofter },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: S.sm, borderRadius: R.pill, height: 52,
    borderWidth: 1.5, borderColor: C.error,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: C.error },

  version: { textAlign: 'center', fontSize: 12, color: C.mute, marginTop: S.sm },
});
