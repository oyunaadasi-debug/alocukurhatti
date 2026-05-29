import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { C, R, S, elevation, statusColor, statusLabel } from '../theme';
import { API_URL } from '../config';

type Report = {
  id: number; lat: number; lng: number;
  address: string; city: string; district: string;
  me_too_count: number; status: string; created_at: string;
};

const STATUS_PIN: Record<string, string> = {
  open:      C.attention,
  forwarded: C.warning,
  reviewing: C.secondary,
  resolved:  C.success,
};

export default function MapScreen({ navigation, route }: any) {
  const filterCity: string | undefined     = route?.params?.filterCity;
  const filterDistrict: string | undefined = route?.params?.filterDistrict;
  const centerLat: number | undefined      = route?.params?.centerLat;
  const centerLng: number | undefined      = route?.params?.centerLng;

  const mapRef = useRef<MapView>(null);
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [userLoc, setUserLoc]   = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);
  const [region, setRegion]     = useState<Region>({
    latitude: centerLat ?? 39.0, longitude: centerLng ?? 35.0,
    latitudeDelta: filterDistrict ? 0.05 : filterCity ? 0.5 : 8,
    longitudeDelta: filterDistrict ? 0.05 : filterCity ? 0.5 : 8,
  });

  useEffect(() => { load(); }, [filterCity, filterDistrict]);

  async function load() {
    setLoading(true);
    try {
      let lat = centerLat ?? 39.0, lng = centerLng ?? 35.0;

      if (!filterCity && !centerLat) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude; lng = loc.coords.longitude;
          setUserLoc({ lat, lng });
          setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        }
      }

      const { data } = await axios.get(`${API_URL}/reports`, {
        params: { lat: !filterCity ? lat : undefined, lng: !filterCity ? lng : undefined, radius: 50, city: filterCity },
      });
      const all: Report[] = data.reports;
      setReports(filterDistrict ? all.filter(r => r.district === filterDistrict) : all);
    } catch {
      Alert.alert('Hata', 'Raporlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  function goToUser() {
    if (!userLoc) return;
    mapRef.current?.animateToRegion({
      latitude: userLoc.lat, longitude: userLoc.lng,
      latitudeDelta: 0.02, longitudeDelta: 0.02,
    }, 500);
  }

  const badgeLabel = filterDistrict
    ? `${filterDistrict} — ${reports.length} rapor`
    : filterCity ? `${filterCity} — ${reports.length} açık rapor`
    : `${reports.length} açık rapor`;

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onPress={() => setSelected(null)}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {reports.map(r => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.lat, longitude: r.lng }}
            onPress={() => setSelected(r)}
            tracksViewChanges={false}
          >
            <View style={[s.pin, { backgroundColor: STATUS_PIN[r.status] ?? C.primary }]}>
              <View style={s.pinDot} />
            </View>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}

      {!loading && (
        <View style={[s.countBadge, elevation(2)]}>
          <View style={s.countDot} />
          <Text style={s.countBadgeText}>{badgeLabel}</Text>
        </View>
      )}

      {/* Seçili rapor kartı — double-bezel (dış kabuk + iç çekirdek) */}
      {selected && (
        <View style={[s.cardShell, elevation(4)]}>
          <View style={s.cardCore}>
            <View style={s.cardTopRow}>
              <Text style={s.cardTitle}>Yol Hasarı</Text>
              {(() => {
                const sc = statusColor(selected.status);
                return (
                  <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                    <Text style={[s.statusPillText, { color: sc.text }]}>{statusLabel(selected.status)}</Text>
                  </View>
                );
              })()}
            </View>
            <Text style={s.cardAddr} numberOfLines={2}>
              {selected.address || selected.district || selected.city || 'Konum bilgisi yok'}
            </Text>
            <Text style={s.cardMeta}>
              {selected.me_too_count} kişi gördü · {new Date(selected.created_at).toLocaleDateString('tr-TR')}
            </Text>
            <TouchableOpacity
              style={s.detailBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReportDetail', { reportId: selected.id })}
            >
              <Text style={s.detailBtnText}>Detayı Gör</Text>
              <View style={s.detailBtnIcon}>
                <Ionicons name="arrow-forward" size={15} color={C.onPrimary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Konuma git */}
      <TouchableOpacity
        style={[s.locateBtn, elevation(2), selected && { bottom: 248 }]}
        activeOpacity={0.85}
        onPress={goToUser}
      >
        <Ionicons name="locate" size={21} color={C.ink} />
      </TouchableOpacity>

      {/* Çukur Bildir — floating CTA (button-in-button) */}
      <TouchableOpacity
        style={[s.cta, elevation(6)]}
        onPress={() => navigation.navigate('AddReport', { userLocation: userLoc })}
        activeOpacity={0.9}
      >
        <Text style={s.ctaText}>Çukur Bildir</Text>
        <View style={s.ctaIcon}>
          <Ionicons name="add" size={20} color={C.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(251,249,244,0.6)',
  },

  pin: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },

  countBadge: {
    position: 'absolute', top: 14, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: S.xs,
    backgroundColor: C.canvas,
    paddingHorizontal: S.lg, paddingVertical: S.sm,
    borderRadius: R.pill,
    borderWidth: 1, borderColor: C.canvasSofter,
  },
  countDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.attention },
  countBadgeText: { color: C.ink, fontSize: 13, fontWeight: '700', letterSpacing: 0.1 },

  // Double-bezel: dış kabuk (sıcak yüzey + hairline) → iç çekirdek (krem)
  cardShell: {
    position: 'absolute', bottom: 110, left: 16, right: 16,
    backgroundColor: C.canvasSoft,
    borderRadius: R.xxl + 6,
    borderWidth: 1, borderColor: C.canvasSofter,
    padding: 6,
  },
  cardCore: {
    backgroundColor: C.canvas,
    borderRadius: R.xxl,
    padding: S.lg, gap: S.xs,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.sm },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.ink, letterSpacing: -0.2 },
  statusPill: { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.pill },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  cardAddr:  { fontSize: 13.5, color: C.body, lineHeight: 19 },
  cardMeta:  { fontSize: 12, color: C.mute, fontWeight: '500' },
  detailBtn: {
    marginTop: S.sm, alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: C.primary,
    paddingLeft: S.lg, paddingRight: 5, paddingVertical: 5,
    borderRadius: R.pill,
  },
  detailBtnText: { fontSize: 13, color: C.onPrimary, fontWeight: '700' },
  detailBtnIcon: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },

  locateBtn: {
    position: 'absolute', bottom: 108, right: 16,
    width: 48, height: 48, borderRadius: R.full,
    backgroundColor: C.canvas,
    borderWidth: 1, borderColor: C.canvasSofter,
    justifyContent: 'center', alignItems: 'center',
  },

  cta: {
    position: 'absolute', bottom: 34, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.primary,
    paddingVertical: S.md, paddingLeft: S.xl3, paddingRight: S.sm,
    borderRadius: R.pill,
  },
  ctaText: { color: C.onPrimary, fontSize: 15.5, fontWeight: '800', letterSpacing: 0.1 },
  ctaIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.canvas,
    alignItems: 'center', justifyContent: 'center',
  },
});
