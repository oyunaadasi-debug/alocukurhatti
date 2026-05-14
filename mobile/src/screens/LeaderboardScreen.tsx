import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { C, R, S, elevation } from '../theme';
import { EmptyState, Divider } from '../components/ui';
import { API_URL } from '../config';

type City = {
  city: string; open_count: string; resolved_count: string;
  total_count: string; total_metoo: string;
};
type District = {
  district: string; open_count: string; resolved_count: string;
  total_count: string; total_metoo: string; center_lat: string; center_lng: string;
};

const MEDALS = ['🥇', '🥈', '🥉'];

function resolveRate(r: { resolved_count: string; total_count: string }) {
  const t = parseInt(r.total_count);
  return t ? Math.round((parseInt(r.resolved_count) / t) * 100) : 0;
}

export default function LeaderboardScreen({ navigation }: any) {
  const [cities, setCities]           = useState<City[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [expandedCity, setExpanded]   = useState<string | null>(null);
  const [districts, setDistricts]     = useState<District[]>([]);
  const [drillLoad, setDrillLoad]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data } = await axios.get(`${API_URL}/stats/cities`);
      setCities(data.cities);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  async function toggleCity(city: string) {
    if (expandedCity === city) { setExpanded(null); setDistricts([]); return; }
    setExpanded(city); setDrillLoad(true);
    try {
      const { data } = await axios.get(`${API_URL}/stats/cities/${encodeURIComponent(city)}`);
      setDistricts(data.districts);
    } finally { setDrillLoad(false); }
  }

  function goMap(filterCity: string, d?: District) {
    navigation.navigate('Map', {
      filterCity,
      filterDistrict: d?.district,
      centerLat: d ? parseFloat(d.center_lat) : undefined,
      centerLng: d ? parseFloat(d.center_lng) : undefined,
    });
  }

  const renderCity = ({ item, index }: { item: City; index: number }) => {
    const open    = parseInt(item.open_count);
    const rate    = resolveRate(item);
    const isOpen  = expandedCity === item.city;

    return (
      <View style={[s.cityCard, elevation(2)]}>
        {/* Satır */}
        <TouchableOpacity style={s.cityRow} onPress={() => toggleCity(item.city)} activeOpacity={0.75}>
          {/* Sıra */}
          <View style={s.rankBox}>
            <Text style={MEDALS[index] ? s.medal : s.rank}>{MEDALS[index] ?? index + 1}</Text>
          </View>

          {/* Şehir + bar */}
          <View style={s.cityMid}>
            <Text style={s.cityName}>{item.city}</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${Math.min(rate, 100)}%` }]} />
            </View>
            <Text style={s.cityMeta}>
              {item.total_count} rapor · %{rate} çözüldü · {item.total_metoo} görmüş
            </Text>
          </View>

          {/* Açık sayısı */}
          <View style={s.openBox}>
            <Text style={s.openNum}>{open}</Text>
            <Text style={s.openLbl}>açık</Text>
          </View>

          {/* Harita chip */}
          <TouchableOpacity style={s.mapChip} onPress={() => goMap(item.city)}>
            <Ionicons name="map-outline" size={16} color={C.secondary} />
          </TouchableOpacity>

          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={C.mute} />
        </TouchableOpacity>

        {/* İlçe drill-down */}
        {isOpen && (
          <View style={s.distPanel}>
            <Divider />
            {drillLoad ? (
              <ActivityIndicator color={C.primary} style={{ padding: S.lg }} />
            ) : districts.length === 0 ? (
              <Text style={s.noDistrict}>İlçe verisi bulunamadı.</Text>
            ) : (
              <>
                <Text style={s.distHeader}>İlçe Bazlı Raporlar</Text>
                {districts.map((d, i) => (
                  <TouchableOpacity key={i} style={s.distRow} onPress={() => goMap(item.city, d)}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.distName}>{d.district}</Text>
                      <Text style={s.distMeta}>{d.total_metoo} görmüş · %{resolveRate(d)} çözüldü</Text>
                    </View>
                    <Text style={s.distCount}>{d.open_count}</Text>
                    <Ionicons name="map-outline" size={16} color={C.secondary} style={{ marginLeft: S.xs }} />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🏆 Şikayet Lider Tablosu</Text>
        <Text style={s.headerSub}>En fazla açık raporu olan iller</Text>
      </View>

      <FlatList
        data={cities}
        keyExtractor={i => i.city}
        renderItem={renderCity}
        contentContainerStyle={{ padding: S.md, gap: S.sm, paddingBottom: S.xl3 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={[C.primary]}
          />
        }
        ListEmptyComponent={<EmptyState text="Henüz rapor yok." />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvasSoft },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: C.primary,
    paddingTop: S.lg, paddingBottom: S.xl, paddingHorizontal: S.xl,
  },
  headerTitle: { color: C.onDark, fontSize: 20, fontWeight: '800' },
  headerSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },

  cityCard: {
    backgroundColor: C.canvas, borderRadius: R.lg, overflow: 'hidden',
  },
  cityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: S.md, paddingHorizontal: S.lg, gap: S.sm,
  },

  rankBox: { width: 30, alignItems: 'center' },
  medal:   { fontSize: 22 },
  rank:    { fontSize: 15, fontWeight: '700', color: C.mute },

  cityMid:  { flex: 1 },
  cityName: { fontSize: 16, fontWeight: '700', color: C.ink },
  barTrack: { height: 4, backgroundColor: C.canvasSofter, borderRadius: R.pill, marginVertical: 5 },
  barFill:  { height: 4, backgroundColor: C.success, borderRadius: R.pill },
  cityMeta: { fontSize: 11, color: C.mute },

  openBox: { alignItems: 'center', minWidth: 40 },
  openNum: { fontSize: 24, fontWeight: '900', color: C.primary },
  openLbl: { fontSize: 11, color: C.mute },

  mapChip: {
    backgroundColor: '#E3F0FF', borderRadius: R.sm,
    padding: S.xs, marginRight: S.xxs,
  },

  // İlçe paneli
  distPanel:  { paddingHorizontal: S.lg, paddingBottom: S.sm },
  distHeader: { fontSize: 13, fontWeight: '700', color: C.ink, marginTop: S.sm, marginBottom: S.xs },
  distRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: S.md,
    borderBottomWidth: 1, borderBottomColor: C.canvasSoft,
  },
  distName:   { fontSize: 14, fontWeight: '600', color: C.ink },
  distMeta:   { fontSize: 11, color: C.mute, marginTop: 2 },
  distCount:  { fontSize: 18, fontWeight: '800', color: C.primary, minWidth: 36, textAlign: 'right' },
  noDistrict: { color: C.mute, padding: S.lg, textAlign: 'center' },
});
