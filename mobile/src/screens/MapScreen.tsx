import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Text } from '../components/AppText';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { C, R, S, elevation, severityColor, severityLabel, statusColor, statusLabel } from '../theme';
import { API_URL } from '../config';
import { ISSUE_TYPES, issueIcon, issueLabel } from '../data/belediyeler';

type Report = {
  id: number; lat: number; lng: number;
  address: string; city: string; district: string;
  me_too_count: number; status: string; created_at: string; issue_type?: string; severity?: string;
};

const STATUS_PIN: Record<string, string> = {
  open:      C.attention,
  forwarded: C.warning,
  reviewing: C.secondary,
  resolved:  C.success,
};

export default function MapScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const filterCity: string | undefined     = route?.params?.filterCity;
  const filterDistrict: string | undefined = route?.params?.filterDistrict;
  const centerLat: number | undefined      = route?.params?.centerLat;
  const centerLng: number | undefined      = route?.params?.centerLng;

  const mapRef = useRef<MapView>(null);
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [userLoc, setUserLoc]   = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState(3);
  const [areaBusy, setAreaBusy] = useState(false);
  const [areaFollowed, setAreaFollowed] = useState(false);
  const [region, setRegion]     = useState<Region>({
    latitude: centerLat ?? 39.0, longitude: centerLng ?? 35.0,
    latitudeDelta: filterDistrict ? 0.05 : filterCity ? 0.5 : 8,
    longitudeDelta: filterDistrict ? 0.05 : filterCity ? 0.5 : 8,
  });

  useEffect(() => { load(); }, [filterCity, filterDistrict, nearbyRadius]);

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
        params: { lat: !filterCity ? lat : undefined, lng: !filterCity ? lng : undefined, radius: !filterCity ? nearbyRadius : 50, city: filterCity },
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

  async function followArea() {
    if (!user) {
      Alert.alert('Giriş Yapın', 'Yakınınızdaki yeni raporlar için bildirim almak üzere giriş yapmanız gerekiyor.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    const center = userLoc ?? { lat: region.latitude, lng: region.longitude };
    setAreaBusy(true);
    try {
      await axios.post(`${API_URL}/notifications/areas`, {
        lat: center.lat,
        lng: center.lng,
        radius_km: nearbyRadius,
        label: filterDistrict || filterCity || `Yakınımda ${nearbyRadius} km`,
      });
      setAreaFollowed(true);
      Alert.alert('Takip başladı', `Bu bölgedeki yeni raporlar için bildirim alacaksınız.`);
    } catch {
      Alert.alert('Hata', 'Bölge takibi başlatılamadı.');
    } finally {
      setAreaBusy(false);
    }
  }

  const visibleReports = typeFilter ? reports.filter(r => r.issue_type === typeFilter) : reports;

  const badgeLabel = filterDistrict
    ? `${filterDistrict} — ${visibleReports.length} rapor`
    : filterCity ? `${filterCity} — ${visibleReports.length} açık rapor`
    : `${visibleReports.length} açık rapor`;

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onPress={() => setSelected(null)}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {visibleReports.map(r => (
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

      {/* Sorun türü filtresi */}
      {!loading && (
        <>
          {!filterCity && (
            <View style={[s.nearbyPanel, elevation(2)]}>
              <View style={s.radiusRow}>
                {[1, 3, 10].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[s.radiusChip, nearbyRadius === r && s.radiusChipActive]}
                    onPress={() => { setNearbyRadius(r); setAreaFollowed(false); }}
                    activeOpacity={0.85}
                  >
                    <Text style={[s.radiusText, nearbyRadius === r && s.radiusTextActive]}>{r} km</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[s.areaFollowBtn, areaFollowed && s.areaFollowBtnActive]}
                onPress={followArea}
                disabled={areaBusy || areaFollowed}
                activeOpacity={0.85}
              >
                {areaBusy ? (
                  <ActivityIndicator color={C.primary} size="small" />
                ) : (
                  <>
                    <Ionicons name={areaFollowed ? 'notifications' : 'notifications-outline'} size={14} color={areaFollowed ? C.onPrimary : C.primary} />
                    <Text style={[s.areaFollowText, areaFollowed && s.areaFollowTextActive]}>
                      {areaFollowed ? 'Bölge takipte' : 'Bu bölgeyi takip et'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[s.filterBar, !filterCity && { top: 124 }]}
            contentContainerStyle={s.filterContent}
          >
            <TouchableOpacity
              style={[s.filterChip, !typeFilter && s.filterChipActive, elevation(1)]}
              onPress={() => setTypeFilter(null)}
              activeOpacity={0.85}
            >
              <Text style={[s.filterChipText, !typeFilter && s.filterChipTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {ISSUE_TYPES.map(t => {
              const active = typeFilter === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[s.filterChip, active && s.filterChipActive, elevation(1)]}
                  onPress={() => setTypeFilter(active ? null : t.key)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={t.icon as any} size={14} color={active ? C.onPrimary : C.body} />
                  <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Seçili rapor kartı — double-bezel (dış kabuk + iç çekirdek) */}
      {selected && (
        <View style={[s.cardShell, elevation(4)]}>
          <View style={s.cardCore}>
            <View style={s.cardTopRow}>
              <Text style={s.cardTitle}>{issueLabel(selected.issue_type)}</Text>
              {(() => {
                const sc = statusColor(selected.status);
                const sev = severityColor(selected.severity);
                return (
                  <View style={s.cardPills}>
                    <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                      <Text style={[s.statusPillText, { color: sc.text }]}>{statusLabel(selected.status)}</Text>
                    </View>
                    <View style={[s.statusPill, { backgroundColor: sev.bg }]}>
                      <Text style={[s.statusPillText, { color: sev.text }]}>{severityLabel(selected.severity)}</Text>
                    </View>
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

  // Sorun türü filtre barı
  filterBar: {
    position: 'absolute', top: 56, left: 0, right: 0,
    maxHeight: 40,
  },
  filterContent: { paddingHorizontal: S.md, gap: S.xs, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.canvas,
    paddingHorizontal: S.md, paddingVertical: S.xs,
    borderRadius: R.pill,
    borderWidth: 1, borderColor: C.canvasSofter,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 12.5, fontWeight: '700', color: C.body },
  filterChipTextActive: { color: C.onPrimary },

  nearbyPanel: {
    position: 'absolute', top: 56, left: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: C.canvas, borderRadius: R.xl,
    borderWidth: 1, borderColor: C.canvasSofter,
    padding: S.sm,
  },
  radiusRow: { flexDirection: 'row', gap: S.xs, flex: 1 },
  radiusChip: {
    flex: 1, minHeight: 34, borderRadius: R.pill,
    backgroundColor: C.canvasSoft, alignItems: 'center', justifyContent: 'center',
  },
  radiusChipActive: { backgroundColor: C.primary },
  radiusText: { fontSize: 12, fontWeight: '800', color: C.body },
  radiusTextActive: { color: C.onPrimary },
  areaFollowBtn: {
    minHeight: 34, paddingHorizontal: S.md, borderRadius: R.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs,
    borderWidth: 1.5, borderColor: C.primary,
  },
  areaFollowBtnActive: { backgroundColor: C.primary },
  areaFollowText: { fontSize: 12, fontWeight: '800', color: C.primary },
  areaFollowTextActive: { color: C.onPrimary },

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
  cardPills: { alignItems: 'flex-end', gap: 4 },
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
