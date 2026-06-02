import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Text } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { C, R, S, elevation, statusColor, statusLabel } from '../theme';
import { API_URL, PRIVACY_URL, SUPPORT_URL, TERMS_URL } from '../config';

type MyReport = {
  id: number; address: string; city: string; district: string;
  status: string; me_too_count: number; created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  citizen:      '👤 Vatandaş',
  municipality: '🏛 Belediye Memuru',
  admin:        '⚙️ Admin',
};

function LegalLinks({ compact = false }: { compact?: boolean }) {
  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Lütfen daha sonra tekrar deneyin.');
    }
  }

  return (
    <View style={[s.legalLinks, compact && s.legalLinksCompact]}>
      <TouchableOpacity onPress={() => open(PRIVACY_URL)}>
        <Text style={s.legalLink}>Gizlilik Politikası</Text>
      </TouchableOpacity>
      <Text style={s.legalDot}>·</Text>
      <TouchableOpacity onPress={() => open(TERMS_URL)}>
        <Text style={s.legalLink}>Kullanım Koşulları</Text>
      </TouchableOpacity>
      <Text style={s.legalDot}>·</Text>
      <TouchableOpacity onPress={() => open(SUPPORT_URL)}>
        <Text style={s.legalLink}>Destek</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [myReports, setMyReports] = useState<MyReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoadingReports(true);
      axios.get(`${API_URL}/reports/my`)
        .then(({ data }) => { if (active) setMyReports(data.reports); })
        .catch(() => {})
        .finally(() => { if (active) setLoadingReports(false); });
      return () => { active = false; };
    }, [user])
  );

  const resolvedCount = myReports.filter(r => r.status === 'resolved').length;

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

  async function handleDeleteAccount() {
    Alert.alert(
      'Hesabımı Sil',
      'Hesabın ve sana ait kişisel bilgiler kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabımı Sil', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await axios.delete(`${API_URL}/auth/account`);
              await logout();
              Alert.alert('Hesap silindi', 'Hesabın kalıcı olarak silindi.');
            } catch {
              setDeleting(false);
              Alert.alert('Hata', 'Hesap silinemedi. Lütfen tekrar deneyin.');
            }
          },
        },
      ],
    );
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
        <TouchableOpacity onPress={() => navigation.navigate('About')} style={s.guestAbout}>
          <Ionicons name="information-circle-outline" size={16} color={C.primaryDim} />
          <Text style={s.guestAboutText}>Uygulama nasıl çalışır?</Text>
        </TouchableOpacity>
        <LegalLinks compact />
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

      {/* Raporlarım — çözülenler bildirim olarak öne çıkar */}
      <View style={s.reportsHeader}>
        <Text style={s.sectionTitle}>Raporlarım</Text>
        {resolvedCount > 0 && (
          <View style={s.resolvedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={C.onSuccess} />
            <Text style={s.resolvedBadgeText}>{resolvedCount} çözüldü</Text>
          </View>
        )}
      </View>

      {loadingReports ? (
        <ActivityIndicator color={C.primary} style={{ paddingVertical: S.lg }} />
      ) : myReports.length === 0 ? (
        <View style={[s.emptyReports, elevation(1)]}>
          <Ionicons name="document-text-outline" size={28} color={C.dim} />
          <Text style={s.emptyText}>Henüz rapor göndermediniz.</Text>
        </View>
      ) : (
        myReports.map(r => {
          const sc = statusColor(r.status);
          const isResolved = r.status === 'resolved';
          return (
            <TouchableOpacity
              key={r.id}
              style={[s.reportCard, isResolved && s.reportCardResolved, elevation(1)]}
              onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.reportAddr} numberOfLines={1}>
                  {[r.address, r.district, r.city].filter(Boolean).join(', ') || 'Konum bilgisi yok'}
                </Text>
                <Text style={s.reportMeta}>
                  {new Date(r.created_at).toLocaleDateString('tr-TR')} · {r.me_too_count} kişi gördü
                </Text>
              </View>
              <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                <Text style={[s.statusPillText, { color: sc.text }]}>{statusLabel(r.status)}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Nasıl çalışır */}
      <TouchableOpacity
        style={[s.aboutRow, elevation(1)]}
        onPress={() => navigation.navigate('About')}
        activeOpacity={0.85}
      >
        <Ionicons name="information-circle-outline" size={20} color={C.primaryDim} />
        <Text style={s.aboutText}>Uygulama Nasıl Çalışır?</Text>
        <Ionicons name="chevron-forward" size={18} color={C.mute} />
      </TouchableOpacity>

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

      {/* Hesabı sil — Apple 5.1.1(v) zorunlu */}
      <TouchableOpacity
        style={[s.deleteBtn, deleting && { opacity: 0.6 }]}
        onPress={handleDeleteAccount}
        disabled={deleting || loggingOut}
        activeOpacity={0.8}
      >
        {deleting
          ? <ActivityIndicator color={C.error} />
          : <>
              <Ionicons name="trash-outline" size={18} color={C.error} />
              <Text style={s.deleteText}>Hesabımı Sil</Text>
            </>
        }
      </TouchableOpacity>
      <Text style={s.deleteHint}>Hesabın ve kişisel verilerin kalıcı olarak silinir.</Text>

      <LegalLinks />
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
  guestAbout: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: S.sm },
  guestAboutText: { fontSize: 14, color: C.primaryDim, fontWeight: '600' },

  aboutRow: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.md,
  },
  aboutText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.ink },

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

  // Raporlarım
  reportsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: S.xs,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  resolvedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.success, borderRadius: R.pill,
    paddingHorizontal: S.sm, paddingVertical: 3,
  },
  resolvedBadgeText: { color: C.onSuccess, fontSize: 12, fontWeight: '700' },

  emptyReports: {
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.xl,
    alignItems: 'center', gap: S.sm,
  },
  emptyText: { fontSize: 13, color: C.mute },

  reportCard: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.md,
  },
  reportCardResolved: { borderWidth: 1.5, borderColor: C.success },
  reportAddr: { fontSize: 14, fontWeight: '600', color: C.ink },
  reportMeta: { fontSize: 12, color: C.mute, marginTop: 2 },
  statusPill:     { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.pill },
  statusPillText: { fontSize: 11, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: S.sm, borderRadius: R.pill, height: 52,
    borderWidth: 1.5, borderColor: C.error,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: C.error },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 44, marginTop: S.xs,
  },
  deleteText: { fontSize: 14, fontWeight: '700', color: C.error },
  deleteHint: { textAlign: 'center', fontSize: 11, color: C.mute, marginTop: -4 },

  legalLinks: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    alignItems: 'center', gap: 7, paddingHorizontal: S.sm,
  },
  legalLinksCompact: { marginTop: S.lg },
  legalLink: { fontSize: 12, color: C.primaryDim, fontWeight: '600' },
  legalDot: { fontSize: 12, color: C.mute },

  version: { textAlign: 'center', fontSize: 12, color: C.mute, marginTop: S.sm },
});
