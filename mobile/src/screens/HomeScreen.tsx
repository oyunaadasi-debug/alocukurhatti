import React, { useCallback, useRef, useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, RefreshControl, Platform,
} from 'react-native';
import { Text } from '../components/AppText';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { C, R, S, elevation, severityColor, severityLabel, statusColor, statusLabel } from '../theme';
import { supabase } from '../lib/supabase';
import { issueLabel, issueIcon } from '../data/belediyeler';

type Report = {
  id: number; lat: number; lng: number;
  address: string; city: string; district: string;
  photo_url: string; status: string; me_too_count: number;
  created_at: string; issue_type?: string; severity?: string;
};

export default function HomeScreen({ navigation }: any) {
  const [reports, setReports] = useState<Report[]>([]);
  const [totals, setTotals]   = useState({ total: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const [repRes, countRes, resolvedRes] = await Promise.all([
        supabase
          .from('reports')
          .select('*')
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('moderation_status', 'approved'),
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('moderation_status', 'approved')
          .eq('status', 'resolved'),
      ]);

      if (!repRes.error) {
        setReports(repRes.data || []);
      }
      
      const total = countRes.count || 0;
      const resolved = resolvedRes.count || 0;
      setTotals({ total, resolved });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const recent = reports.slice(0, 5);
  const previewMarkers = reports.slice(0, 30);

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[C.primary]} tintColor={C.primary} />
      }
    >
      {/* Başlık */}
      <View style={s.header}>
        <Text style={s.brand}>Alo Çukur Hattı 🕳️</Text>
        <Text style={s.tagline}>Yoldaki çukuru bildir, haritaya işle, takip et.</Text>
      </View>

      {/* ── Büyük Bildir CTA (button-in-button) ── */}
      <TouchableOpacity
        style={[s.cta, elevation(6)]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddReport')}
      >
        <View style={s.ctaIcon}>
          <Ionicons name="camera" size={26} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.ctaTitle}>Çukur Bildir</Text>
          <Text style={s.ctaSub}>Fotoğrafla, konumla, saniyeler içinde gönder</Text>
        </View>
        <Ionicons name="arrow-forward" size={22} color={C.onPrimary} />
      </TouchableOpacity>

      {/* ── İstatistik şeridi ── */}
      <View style={s.statRow}>
        <View style={[s.statCard, elevation(1)]}>
          <Text style={s.statNum}>{totals.total}</Text>
          <Text style={s.statLbl}>toplam bildirim</Text>
        </View>
        <View style={[s.statCard, elevation(1)]}>
          <Text style={[s.statNum, { color: C.success }]}>{totals.resolved}</Text>
          <Text style={s.statLbl}>çözüldü</Text>
        </View>
      </View>

      {/* ── Son Bildirimler ── */}
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Son Bildirimler</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MapTab')} hitSlop={8}>
          <Text style={s.seeAll}>Haritada gör →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ paddingVertical: S.xl }} />
      ) : recent.length === 0 ? (
        <View style={[s.empty, elevation(1)]}>
          <Ionicons name="checkmark-done-circle-outline" size={28} color={C.dim} />
          <Text style={s.emptyText}>Henüz bildirim yok. İlk çukuru sen bildir!</Text>
        </View>
      ) : (
        recent.map(r => {
          const sc = statusColor(r.status);
          const sev = severityColor(r.severity);
          return (
            <TouchableOpacity
              key={r.id}
              style={[s.repCard, elevation(1)]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
            >
              {r.photo_url ? (
                <Image source={{ uri: r.photo_url }} style={s.repThumb} />
              ) : (
                <View style={[s.repThumb, s.repThumbEmpty]}>
                  <Ionicons name={issueIcon(r.issue_type) as any} size={20} color={C.dim} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.repTitle} numberOfLines={1}>{issueLabel(r.issue_type)}</Text>
                <Text style={s.repAddr} numberOfLines={1}>
                  {[r.district, r.city].filter(Boolean).join(', ') || 'Konum bilgisi yok'}
                </Text>
                <Text style={s.repMeta}>
                  {r.me_too_count} kişi gördü · {new Date(r.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <View style={s.pillStack}>
                <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                  <Text style={[s.statusPillText, { color: sc.text }]}>{statusLabel(r.status)}</Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: sev.bg }]}>
                  <Text style={[s.statusPillText, { color: sev.text }]}>{severityLabel(r.severity)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* ── Harita önizleme (altta, ikincil) ── */}
      <Text style={[s.sectionTitle, { marginTop: S.lg }]}>Harita</Text>
      <TouchableOpacity
        style={[s.mapCard, elevation(2)]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MapTab')}
      >
        <View style={s.mapInner} pointerEvents="none">
          <MapView
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{ latitude: 39.0, longitude: 35.0, latitudeDelta: 9, longitudeDelta: 9 }}
            pointerEvents="none"
          >
            {previewMarkers.map(r => (
              <Marker key={r.id} coordinate={{ latitude: r.lat, longitude: r.lng }} tracksViewChanges={false}>
                <View style={s.miniPin} />
              </Marker>
            ))}
          </MapView>
        </View>
        <View style={s.mapOverlay}>
          <View style={s.mapBtn}>
            <Ionicons name="map" size={16} color={C.onPrimary} />
            <Text style={s.mapBtnText}>Haritada Tümünü Gör</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ height: S.xl3 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: C.canvasSoft },
  content: { padding: S.lg, gap: S.md },

  header: { marginTop: S.xs, marginBottom: S.xs },
  brand:   { fontSize: 24, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  tagline: { fontSize: 14, color: C.body, marginTop: 4, lineHeight: 20 },

  // Bildir CTA
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.primary, borderRadius: R.xxl,
    padding: S.lg,
  },
  ctaIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { color: C.onPrimary, fontSize: 19, fontWeight: '800', letterSpacing: -0.2 },
  ctaSub:   { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 2 },

  // İstatistik
  statRow:  { flexDirection: 'row', gap: S.md },
  statCard: {
    flex: 1, backgroundColor: C.canvas, borderRadius: R.lg,
    paddingVertical: S.lg, alignItems: 'center',
    borderWidth: 1, borderColor: C.canvasSofter,
  },
  statNum: { fontSize: 26, fontWeight: '900', color: C.primary },
  statLbl: { fontSize: 12, color: C.mute, marginTop: 2 },

  // Bölüm başlığı
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: S.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  seeAll: { fontSize: 13, fontWeight: '700', color: C.primary },

  empty: {
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.xl,
    alignItems: 'center', gap: S.sm,
  },
  emptyText: { fontSize: 13.5, color: C.mute, textAlign: 'center' },

  // Rapor kartı
  repCard: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.sm,
  },
  repThumb: { width: 56, height: 56, borderRadius: R.md, backgroundColor: C.canvasSoft },
  repThumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  repTitle: { fontSize: 14.5, fontWeight: '700', color: C.ink },
  repAddr:  { fontSize: 13, color: C.body, marginTop: 1 },
  repMeta:  { fontSize: 11.5, color: C.mute, marginTop: 2 },
  statusPill:     { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.pill },
  statusPillText: { fontSize: 10.5, fontWeight: '700' },
  pillStack: { alignItems: 'flex-end', gap: 4 },

  // Harita kartı
  mapCard: {
    height: 160, borderRadius: R.xl, overflow: 'hidden',
    backgroundColor: C.canvasSofter,
  },
  mapInner: { ...StyleSheet.absoluteFillObject },
  miniPin: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.attention, borderWidth: 2, borderColor: '#fff',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'flex-end', padding: S.md,
  },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: S.xs,
    backgroundColor: C.primary, borderRadius: R.pill,
    paddingHorizontal: S.lg, paddingVertical: S.sm,
  },
  mapBtnText: { color: C.onPrimary, fontSize: 13.5, fontWeight: '700' },
});
