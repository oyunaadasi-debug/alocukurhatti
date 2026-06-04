import React, { useEffect, useState } from 'react';
import {
  View, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Share, Linking,
} from 'react-native';
import { Text } from '../components/AppText';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { C, R, S, elevation, severityColor, severityLabel } from '../theme';
import { StatusBadge, MetaRow, SectionTitle, Divider } from '../components/ui';
import { API_URL, WEB_URL } from '../config';
import { belediyeFor, buildComplaintText, issueLabel, issueIcon, CIMER_URL, ALO_153 } from '../data/belediyeler';

// İki tarih arası süreyi Türkçe metne çevir (çözüm süresi için)
function durationText(fromIso: string, toIso: string): string {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  if (!isFinite(ms) || ms < 0) return '';
  const days  = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days >= 1)  return `${days} gün${hours ? ` ${hours} saat` : ''}`;
  if (hours >= 1) return `${hours} saat`;
  return `${Math.max(1, Math.floor(ms / 60000))} dakika`;
}

export default function ReportDetailScreen({ route, navigation }: any) {
  const { reportId } = route.params;
  const { user } = useAuth();
  const [report, setReport]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting]   = useState(false);
  const [voted, setVoted]     = useState(false);
  const [updating, setUpdating] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    try {
      const { data } = await axios.get(`${API_URL}/reports/${reportId}`);
      setReport(data);
      setFollowing(Boolean(data.is_followed));
    } catch {
      Alert.alert('Hata', 'Rapor yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  async function meToo() {
    if (voted) return;
    setVoting(true);
    try {
      const { data } = await axios.post(`${API_URL}/reports/${reportId}/metoo`);
      setReport((p: any) => ({ ...p, me_too_count: data.me_too_count }));
      setVoted(true);
    } catch {
      Alert.alert('Hata', 'Oyunuz kaydedilemedi.');
    } finally {
      setVoting(false);
    }
  }

  async function toggleFollow() {
    if (!user) {
      Alert.alert('Giriş Yapın', 'Raporları takip etmek ve bildirim almak için giriş yapmanız gerekiyor.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    setFollowBusy(true);
    try {
      if (following) {
        await axios.delete(`${API_URL}/reports/${reportId}/follow`);
        setFollowing(false);
      } else {
        await axios.post(`${API_URL}/reports/${reportId}/follow`);
        setFollowing(true);
      }
    } catch {
      Alert.alert('Hata', 'Takip tercihi kaydedilemedi.');
    } finally {
      setFollowBusy(false);
    }
  }

  // Uygunsuz/sahte içerik bildir (App Store Guideline 1.2 — UGC moderasyonu)
  async function flagContent() {
    if (flagged) return;
    Alert.alert(
      'İçeriği bildir',
      'Bu raporu uygunsuz, sahte veya rahatsız edici içerik olarak bildirmek istiyor musunuz? Yeterli bildirim alan içerik otomatik gizlenir ve moderasyon ekibimizce 24 saat içinde incelenir.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Bildir', style: 'destructive', onPress: async () => {
          try {
            await axios.post(`${API_URL}/reports/${reportId}/flag`);
            setFlagged(true);
            Alert.alert('Teşekkürler', 'Bildiriminiz alındı. İçerik moderasyon ekibimizce incelenecek.');
          } catch {
            Alert.alert('Hata', 'Bildirim gönderilemedi. Lütfen tekrar deneyin.');
          }
        } },
      ],
    );
  }

  // Vatandaş güncellemesi: hâlâ aynı / düzeldi (foto ile)
  async function postUpdate(updateType: 'still_unresolved' | 'resolution_proof', photoUri?: string) {
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('update_type', updateType);
      if (photoUri) fd.append('photo', { uri: photoUri, type: 'image/jpeg', name: 'update.jpg' } as any);
      await axios.post(`${API_URL}/reports/${reportId}/updates`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      await fetch();
      Alert.alert('Teşekkürler!', 'Güncellemeniz kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.error || 'Güncelleme gönderilemedi.');
    } finally {
      setUpdating(false);
    }
  }

  async function reportStillSame() {
    if (updating) return;
    Alert.alert('Hâlâ Aynı mı?', 'Bu sorunun hâlâ devam ettiğini bildirmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Evet, hâlâ aynı', onPress: () => postUpdate('still_unresolved') },
    ]);
  }

  async function reportFixed() {
    if (updating) return;
    Alert.alert('Düzelmiş mi?', 'Düzeldiğini kanıtlamak için bir fotoğraf ekleyin.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Kamera', onPress: async () => {
        try {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Kamera İzni Gerekli',
              'Fotoğraf çekmek için ayarlardan kamera iznini açın.',
              [
                { text: 'Ayarlar', onPress: () => Linking.openSettings() },
                { text: 'İptal', style: 'cancel' },
              ],
            );
            return;
          }
          const r = await ImagePicker.launchCameraAsync({ quality: 0.85 });
          if (!r.canceled) postUpdate('resolution_proof', r.assets[0].uri);
        } catch (e) {
          Alert.alert('Hata', 'Kamera açılamadı. Lütfen tekrar deneyin.');
        }
      } },
      { text: 'Galeri', onPress: async () => {
        try {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Galeri İzni Gerekli',
              'Fotoğraf seçmek için ayarlardan galeri iznini açın.',
              [
                { text: 'Ayarlar', onPress: () => Linking.openSettings() },
                { text: 'İptal', style: 'cancel' },
              ],
            );
            return;
          }
          const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });
          if (!r.canceled) postUpdate('resolution_proof', r.assets[0].uri);
        } catch (e) {
          Alert.alert('Hata', 'Galeri açılamadı. Lütfen tekrar deneyin.');
        }
      } },
    ]);
  }

  const complaintText = report ? buildComplaintText(report) : '';
  const bld = report ? belediyeFor(report.city) : undefined;
  const reportUrl = `${WEB_URL}/reports/${reportId}`;
  const publicShareText = report
    ? `Alo Çukur Hattı: ${[report.address, report.district, report.city].filter(Boolean).join(', ') || 'Yol hasarı'} için ${issueLabel(report.issue_type).toLowerCase()} bildirimi. ${report.me_too_count} kişi de gördü. ${reportUrl}`
    : reportUrl;

  async function onShare() {
    try { await Share.share({ message: complaintText }); } catch {}
  }
  async function onSocialShare() {
    try { await Share.share({ message: publicShareText, url: reportUrl }); } catch {}
  }
  async function onCopy() {
    await Clipboard.setStringAsync(complaintText);
    Alert.alert('Kopyalandı', 'Şikayet metni panoya kopyalandı. Açılan forma yapıştırabilirsiniz.');
  }
  async function openWith(url: string, copyFirst = true) {
    if (copyFirst) await Clipboard.setStringAsync(complaintText);
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Alert.alert('Açılamadı', 'Bağlantı açılamadı.');
  }

  if (loading) return (
    <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
  );
  if (!report) return (
    <View style={s.center}><Text style={{ color: C.mute }}>Rapor bulunamadı.</Text></View>
  );

  const addrLine = [report.address, report.district, report.city].filter(Boolean).join(', ');
  const dateStr = new Date(report.created_at).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // Çözüldüyse: bildirimden çözüme kadar geçen süre
  const resolvedAt = report.status === 'resolved' ? report.resolutions?.[0]?.created_at : null;
  const solveDuration = resolvedAt ? durationText(report.created_at, resolvedAt) : '';

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Fotoğraf */}
      <Image source={{ uri: report.photo_url }} style={s.photo} resizeMode="cover" />

      {/* Durum badge — fotoğraf üstüne overlay */}
      <View style={s.badgeOverlay}>
        <StatusBadge status={report.status} />
      </View>

      <View style={s.body}>
        {/* Sorun türü */}
        <View style={s.chipRow}>
          <View style={s.typeChip}>
            <Ionicons name={issueIcon(report.issue_type) as any} size={14} color={C.attention} />
            <Text style={s.typeChipText}>{issueLabel(report.issue_type)}</Text>
          </View>
          {(() => {
            const sc = severityColor(report.severity);
            return (
              <View style={[s.typeChip, { backgroundColor: sc.bg, borderColor: sc.bg }]}>
                <Ionicons name={report.severity === 'dangerous' ? 'warning-outline' : 'trail-sign-outline'} size={14} color={sc.text} />
                <Text style={[s.typeChipText, { color: sc.text }]}>{severityLabel(report.severity)}</Text>
              </View>
            );
          })()}
        </View>

        {/* Çözüm süresi — geçmişe dönük: ne kadar sürede yapıldı */}
        {solveDuration ? (
          <View style={s.solvedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={C.success} />
            <Text style={s.solvedText}>
              <Text style={s.solvedStrong}>{solveDuration}</Text> içinde çözüldü
            </Text>
          </View>
        ) : null}

        {/* Konum */}
        <MetaRow
          icon={<Ionicons name="location" size={16} color={C.primary} />}
          text={addrLine || 'Konum bilgisi yok'}
          color={C.ink}
        />

        {/* Tarih */}
        <MetaRow
          icon={<Ionicons name="time-outline" size={16} color={C.body} />}
          text={dateStr}
        />

        {/* Raporlayan */}
        <MetaRow
          icon={<Ionicons name="person-outline" size={16} color={C.body} />}
          text={report.reporter_name || 'Anonim vatandaş'}
        />

        <TouchableOpacity
          style={[s.followBtn, following && s.followBtnActive]}
          onPress={toggleFollow}
          disabled={followBusy}
          activeOpacity={0.85}
        >
          {followBusy ? (
            <ActivityIndicator color={following ? C.onPrimary : C.primary} />
          ) : (
            <>
              <Ionicons name={following ? 'notifications' : 'notifications-outline'} size={18} color={following ? C.onPrimary : C.primary} />
              <Text style={[s.followText, following && s.followTextActive]}>
                {following ? 'Takip ediliyor' : 'Bu raporu takip et'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Açıklama */}
        {report.description ? (
          <>
            <Divider />
            <View style={[s.descBox, elevation(1)]}>
              <Text style={s.desc}>{report.description}</Text>
            </View>
          </>
        ) : null}

        <Divider />

        {/* Ben de Gördüm */}
        <TouchableOpacity
          style={[s.metooBtn, voted && s.metooBtnVoted, elevation(voted ? 1 : 2)]}
          onPress={meToo}
          disabled={voted || voting}
          activeOpacity={0.82}
        >
          {voting ? (
            <ActivityIndicator color={C.onDark} size="small" />
          ) : (
            <>
              <Ionicons name={voted ? 'eye' : 'eye-outline'} size={20} color={C.onDark} />
              <Text style={s.metooLabel}>{voted ? 'Gördüğünüz kaydedildi' : 'Ben de Gördüm'}</Text>
              <View style={s.meTooCount}>
                <Text style={s.meTooCountText}>{report.me_too_count}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Durum Güncelle — vatandaş geri bildirimi */}
        <Divider />
        <SectionTitle text="Durum Güncelle" />
        <Text style={s.updHint}>Bu sorunu bizzat gördünüz mü? Güncel durumu bildirerek herkese yardımcı olun.</Text>
        <View style={s.updRow}>
          <TouchableOpacity
            style={[s.updBtn, s.updStill]}
            onPress={reportStillSame}
            disabled={updating}
            activeOpacity={0.85}
          >
            <Ionicons name="alert-circle-outline" size={18} color={C.attention} />
            <Text style={[s.updBtnText, { color: C.attention }]}>Hâlâ Aynı</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.updBtn, s.updFixed]}
            onPress={reportFixed}
            disabled={updating}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={C.success} />
            <Text style={[s.updBtnText, { color: C.success }]}>Düzeldi (foto)</Text>
          </TouchableOpacity>
        </View>
        {updating && <ActivityIndicator color={C.primary} style={{ marginTop: S.xs }} />}

        {/* Vatandaş güncellemeleri */}
        {report.updates?.length > 0 && (
          <View style={{ gap: S.sm, marginTop: S.sm }}>
            {report.updates.map((u: any, i: number) => {
              const fixed = u.update_type === 'resolution_proof';
              return (
                <View key={i} style={[s.updCard, elevation(1)]}>
                  <View style={s.updCardHead}>
                    <Ionicons
                      name={fixed ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color={fixed ? C.success : C.attention}
                    />
                    <Text style={s.updCardLabel}>
                      {fixed ? 'Vatandaş düzeldiğini bildirdi' : 'Vatandaş hâlâ aynı dedi'}
                    </Text>
                  </View>
                  {u.note ? <Text style={s.updCardNote}>{u.note}</Text> : null}
                  {u.photo_url ? (
                    <Image source={{ uri: u.photo_url }} style={s.updCardPhoto} resizeMode="cover" />
                  ) : null}
                  <Text style={s.updCardDate}>
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                    {durationText(report.created_at, u.created_at)
                      ? `  ·  bildirimden ${durationText(report.created_at, u.created_at)} sonra`
                      : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Belediyeye İlet */}
        <Divider />
        <SectionTitle text="Belediyeye İlet" />
        <View style={[s.iletShell, elevation(2)]}>
          <View style={s.iletCore}>
            <Text style={s.iletHint}>
              Hazır şikayet metniyle doğru kanala ilet. Web/CİMER açılınca metin panoya kopyalanır,
              forma yapıştırman yeterli.
            </Text>

            <TouchableOpacity style={[s.iletBtn, s.iletPrimary]} onPress={onShare} activeOpacity={0.85}>
              <Ionicons name="share-social" size={18} color={C.onPrimary} />
              <Text style={[s.iletBtnText, { color: C.onPrimary }]}>Paylaş (WhatsApp, e-posta…)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.iletBtn, s.socialBtn]} onPress={onSocialShare} activeOpacity={0.85}>
              <Ionicons name="megaphone-outline" size={18} color={C.onPrimary} />
              <Text style={[s.iletBtnText, { color: C.onPrimary }]}>Sosyal medyada paylaş</Text>
            </TouchableOpacity>

            {bld?.web ? (
              <TouchableOpacity style={s.iletBtn} onPress={() => openWith(bld.web!)} activeOpacity={0.85}>
                <Ionicons name="business-outline" size={18} color={C.ink} />
                <Text style={s.iletBtnText}>{report.city} Belediyesi şikayet sayfası</Text>
                <Ionicons name="open-outline" size={15} color={C.mute} />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={s.iletBtn} onPress={() => openWith(CIMER_URL)} activeOpacity={0.85}>
              <Ionicons name="globe-outline" size={18} color={C.ink} />
              <Text style={s.iletBtnText}>CİMER'e ilet (her il için geçerli)</Text>
              <Ionicons name="open-outline" size={15} color={C.mute} />
            </TouchableOpacity>

            {bld?.buyuksehir ? (
              <TouchableOpacity style={s.iletBtn} onPress={() => openWith(`tel:${ALO_153}`, false)} activeOpacity={0.85}>
                <Ionicons name="call-outline" size={18} color={C.ink} />
                <Text style={s.iletBtnText}>Ara: Alo 153 çözüm hattı</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={s.iletBtn} onPress={onCopy} activeOpacity={0.85}>
              <Ionicons name="copy-outline" size={18} color={C.ink} />
              <Text style={s.iletBtnText}>Şikayet metnini kopyala</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Çözüm kanıtları */}
        {report.resolutions?.length > 0 && (
          <>
            <Divider />
            <SectionTitle text="Çözüm Kanıtları" />
            {report.resolutions.map((res: any, i: number) => (
              <View key={i} style={[s.resCard, elevation(1)]}>
                <Text style={s.resRole}>
                  {res.resolver_role === 'municipality' ? '🏛 Belediye' :
                   res.resolver_role === 'admin' ? '⚙️ Admin' : '👤 Vatandaş'}
                </Text>
                {res.note ? <Text style={s.resNote}>{res.note}</Text> : null}
                {res.photo_url ? (
                  <Image source={{ uri: res.photo_url }} style={s.resPhoto} resizeMode="cover" />
                ) : null}
                <Text style={s.resDate}>
                  {new Date(res.created_at).toLocaleDateString('tr-TR')}
                  {durationText(report.created_at, res.created_at)
                    ? `  ·  bildirimden ${durationText(report.created_at, res.created_at)} sonra`
                    : ''}
                </Text>
              </View>
            ))}
          </>
        )}
        {/* Uygunsuz içerik bildir — UGC moderasyon (Apple 1.2) */}
        <Divider />
        <TouchableOpacity
          style={s.flagBtn}
          onPress={flagContent}
          disabled={flagged}
          activeOpacity={0.7}
        >
          <Ionicons name={flagged ? 'flag' : 'flag-outline'} size={15} color={C.mute} />
          <Text style={s.flagText}>{flagged ? 'İçerik bildirildi' : 'Uygunsuz içeriği bildir'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: S.xl3 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, backgroundColor: C.canvasSoft },

  photo:       { width: '100%', height: 280 },
  badgeOverlay: {
    position: 'absolute', top: S.lg, left: S.lg,
  },

  body: { padding: S.lg, gap: S.md },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  typeChip: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: S.xs,
    backgroundColor: C.canvas, borderWidth: 1, borderColor: C.canvasSofter,
    paddingHorizontal: S.md, paddingVertical: 5, borderRadius: R.pill,
  },
  typeChipText: { fontSize: 12.5, fontWeight: '700', color: C.ink },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm,
    minHeight: 48, borderRadius: R.pill,
    backgroundColor: C.canvas, borderWidth: 1.5, borderColor: C.primary,
  },
  followBtnActive: { backgroundColor: C.primary },
  followText: { fontSize: 14, fontWeight: '800', color: C.primary },
  followTextActive: { color: C.onPrimary },

  // Çözüm süresi banner'ı
  solvedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: '#E7F5EE', borderRadius: R.lg,
    paddingVertical: S.md, paddingHorizontal: S.lg,
  },
  solvedText:   { fontSize: 14, color: C.body },
  solvedStrong: { fontWeight: '800', color: C.success },

  // Belediyeye İlet — double-bezel kart
  iletShell: {
    backgroundColor: C.canvasSoft, borderRadius: R.xxl + 6,
    borderWidth: 1, borderColor: C.canvasSofter, padding: 6,
  },
  iletCore: { backgroundColor: C.canvas, borderRadius: R.xxl, padding: S.lg, gap: S.sm },
  iletHint: { fontSize: 12.5, color: C.body, lineHeight: 18, marginBottom: S.xs },
  iletBtn: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: C.canvasSoft, borderRadius: R.lg,
    paddingVertical: S.md, paddingHorizontal: S.md,
  },
  iletPrimary: { backgroundColor: C.primary },
  socialBtn: { backgroundColor: C.secondary },
  iletBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.ink },

  descBox: {
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.lg,
  },
  desc: { fontSize: 14, color: C.ink, lineHeight: 22 },

  // Ben de Gördüm pill
  metooBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: S.sm, backgroundColor: C.secondary,
    borderRadius: R.pill, paddingVertical: S.lg, paddingHorizontal: S.xl2,
    marginVertical: S.xs,
  },
  metooBtnVoted: { backgroundColor: C.success },
  metooLabel:    { color: C.onDark, fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'center' },
  meTooCount: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 3,
  },
  meTooCountText: { color: C.onDark, fontWeight: '800', fontSize: 15 },

  // Durum güncelle
  updHint: { fontSize: 12.5, color: C.body, lineHeight: 18 },
  updRow:  { flexDirection: 'row', gap: S.sm },
  updBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs,
    backgroundColor: C.canvas, borderWidth: 1.5,
    borderRadius: R.lg, paddingVertical: S.md,
  },
  updStill:    { borderColor: C.attention },
  updFixed:    { borderColor: C.success },
  updBtnText:  { fontSize: 14, fontWeight: '700' },

  updCard: { backgroundColor: C.canvas, borderRadius: R.lg, padding: S.md, gap: S.xs },
  updCardHead:  { flexDirection: 'row', alignItems: 'center', gap: S.xs },
  updCardLabel: { fontSize: 13, fontWeight: '700', color: C.ink },
  updCardNote:  { fontSize: 13, color: C.body },
  updCardPhoto: { width: '100%', height: 160, borderRadius: R.md },
  updCardDate:  { fontSize: 11, color: C.mute },

  // Çözüm kartı
  resCard: {
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.md, marginBottom: S.sm,
  },
  resRole:  { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: S.xs },
  resNote:  { fontSize: 13, color: C.body, marginBottom: S.sm },
  resPhoto: { width: '100%', height: 160, borderRadius: R.md, marginBottom: S.xs },
  resDate:  { fontSize: 11, color: C.mute },

  // Uygunsuz içerik bildir — düşük vurgulu
  flagBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, paddingVertical: S.sm },
  flagText: { fontSize: 12.5, color: C.mute, fontWeight: '600' },
});
