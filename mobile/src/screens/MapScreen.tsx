import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import MapboxGL from '@rnmapbox/mapbox-gl';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { C, R, S, elevation } from '../theme';
import { API_URL, MAPBOX_TOKEN } from '../config';

MapboxGL.setAccessToken(MAPBOX_TOKEN);

type Report = {
  id: number; lat: number; lng: number;
  address: string; city: string; district: string;
  me_too_count: number; status: string; created_at: string;
};

export default function MapScreen({ navigation, route }: any) {
  const filterCity: string | undefined     = route?.params?.filterCity;
  const filterDistrict: string | undefined = route?.params?.filterDistrict;
  const centerLat: number | undefined      = route?.params?.centerLat;
  const centerLng: number | undefined      = route?.params?.centerLng;

  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => { load(); }, [filterCity, filterDistrict]);

  async function load() {
    setLoading(true);
    try {
      let lat = centerLat ?? 39.0, lng = centerLng ?? 35.0;
      let zoomLevel = filterDistrict ? 13 : filterCity ? 10 : 5;

      if (!filterCity && !centerLat) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude; lng = loc.coords.longitude;
          setUserLoc({ lat, lng }); zoomLevel = 13;
        }
      }

      cameraRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel,
        animationDuration: 800,
      });

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
    cameraRef.current?.setCamera({
      centerCoordinate: [userLoc.lng, userLoc.lat],
      zoomLevel: 15,
      animationDuration: 500,
    });
  }

  const badgeLabel = filterDistrict
    ? `${filterDistrict} — ${reports.length} rapor`
    : filterCity ? `${filterCity} — ${reports.length} açık rapor`
    : `${reports.length} açık rapor`;

  return (
    <View style={s.container}>
      <MapboxGL.MapView
        style={s.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={() => setSelected(null)}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: [35, 39], zoomLevel: 5 }}
        />
        <MapboxGL.UserLocation visible animated />

        {reports.map(r => (
          <MapboxGL.PointAnnotation
            key={String(r.id)}
            id={`pin-${r.id}`}
            coordinate={[r.lng, r.lat]}
            onSelected={() => setSelected(r)}
            onDeselected={() => setSelected(null)}
          >
            <View style={s.pin}>
              <View style={s.pinDot} />
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

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
  map: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  pin: { alignItems: 'center', justifyContent: 'center', width: 24, height: 24 },
  pinDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.primary,
    borderWidth: 2, borderColor: '#fff',
  },

  countBadge: {
    position: 'absolute', top: 14, alignSelf: 'center',
    backgroundColor: 'rgba(33,33,33,0.72)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: R.pill,
  },
  countBadgeText: { color: C.onDark, fontSize: 13, fontWeight: '600' },

  card: {
    position: 'absolute', bottom: 106, left: 16, right: 16,
    backgroundColor: C.canvas, borderRadius: R.xl,
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
