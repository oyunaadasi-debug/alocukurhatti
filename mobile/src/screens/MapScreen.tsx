import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { C, R, S, elevation } from '../theme';
import { API_URL } from '../config';

type Report = {
  id: number; lat: number; lng: number;
  address: string; city: string; district: string;
  me_too_count: number; status: string; created_at: string;
};

const STATUS_PIN: Record<string, string> = {
  open:      C.primary,
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
        <View style={s.countBadge}>
          <Text style={s.countBadgeText}>{badgeLabel}</Text>
        </View>
      )}

      {/* Seçili rapor kartı */}
      {selected && (
        <View style={[s.card, elevation(4)]}>
          <Text style={s.cardTitle}>🕳️ Yol Hasarı</Text>
          <Text style={s.cardAddr} numberOfLines={2}>
            {selected.address || selected.district || selected.city || 'Konum bilgisi yok'}
          </Text>
          <Text style={s.cardMeta}>
            👁 {selected.me_too_count} gördü · {new Date(selected.created_at).toLocaleDateString('tr-TR')}
          </Text>
          <TouchableOpacity
            style={s.detailBtn}
            onPress={() => navigation.navigate('ReportDetail', { reportId: selected.id })}
          >
            <Text style={s.detailBtnText}>Detayı Gör →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Konuma git */}
      <TouchableOpacity
        style={[s.locateBtn, elevation(4), selected && { bottom: 240 }]}
        onPress={goToUser}
      >
        <Ionicons name="locate" size={22} color={C.onDark} />
      </TouchableOpacity>

      {/* Çukur Bildir — floating CTA */}
      <TouchableOpacity
        style={[s.cta, elevation(6)]}
        onPress={() => navigation.navigate('AddReport', { userLocation: userLoc })}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle" size={22} color={C.onPrimary} />
        <Text style={s.ctaText}>Çukur Bildir</Text>
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
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  pin: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },

  countBadge: {
    position: 'absolute', top: 14, alignSelf: 'center',
    backgroundColor: 'rgba(33,33,33,0.72)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: R.pill,
  },
  countBadgeText: { color: C.onDark, fontSize: 13, fontWeight: '600' },

  card: {
    position: 'absolute', bottom: 106, left: 16, right: 16,
    backgroundColor: C.canvas, borderRadius: R.xxl,
    padding: S.lg, gap: S.xs,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  cardAddr:  { fontSize: 13, color: C.body },
  cardMeta:  { fontSize: 12, color: C.secondary },
  detailBtn: { marginTop: S.xs, alignSelf: 'flex-end' },
  detailBtnText: { fontSize: 13, color: C.primary, fontWeight: '600' },

  locateBtn: {
    position: 'absolute', bottom: 106, right: 16,
    width: 48, height: 48, borderRadius: R.full,
    backgroundColor: C.secondary,
    justifyContent: 'center', alignItems: 'center',
  },

  cta: {
    position: 'absolute', bottom: 32, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: S.xs,
    backgroundColor: C.primary,
    paddingVertical: S.lg, paddingHorizontal: S.xl3,
    borderRadius: R.pill,
  },
  ctaText: { color: C.onPrimary, fontSize: 15, fontWeight: '700' },
});
