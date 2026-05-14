import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { C, R, S, elevation } from '../theme';
import { StatusBadge, MetaRow, SectionTitle, Divider } from '../components/ui';
import { API_URL } from '../config';

export default function ReportDetailScreen({ route }: any) {
  const { reportId } = route.params;
  const [report, setReport]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting]   = useState(false);
  const [voted, setVoted]     = useState(false);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    try {
      const { data } = await axios.get(`${API_URL}/reports/${reportId}`);
      setReport(data);
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

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Fotoğraf */}
      <Image source={{ uri: report.photo_url }} style={s.photo} resizeMode="cover" />

      {/* Durum badge — fotoğraf üstüne overlay */}
      <View style={s.badgeOverlay}>
        <StatusBadge status={report.status} />
      </View>

      <View style={s.body}>
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
                <Text style={s.resDate}>{new Date(res.created_at).toLocaleDateString('tr-TR')}</Text>
              </View>
            ))}
          </>
        )}
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

  // Çözüm kartı
  resCard: {
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.md, marginBottom: S.sm,
  },
  resRole:  { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: S.xs },
  resNote:  { fontSize: 13, color: C.body, marginBottom: S.sm },
  resPhoto: { width: '100%', height: 160, borderRadius: R.md, marginBottom: S.xs },
  resDate:  { fontSize: 11, color: C.mute },
});
