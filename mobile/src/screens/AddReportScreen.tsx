import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import MapboxGL from '@rnmapbox/mapbox-gl';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { C, R, S, elevation } from '../theme';
import { PillBtn, Divider, SectionTitle } from '../components/ui';
import { API_URL, MAPBOX_TOKEN } from '../config';

MapboxGL.setAccessToken(MAPBOX_TOKEN);

export default function AddReportScreen({ route, navigation }: any) {
  const passedLoc = route?.params?.userLocation;

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    passedLoc ? { lat: passedLoc.lat, lng: passedLoc.lng } : null
  );
  const [address, setAddress]     = useState('');
  const [city, setCity]           = useState('');
  const [district, setDistrict]   = useState('');
  const [photo, setPhoto]         = useState<string | null>(null);
  const [description, setDesc]    = useState('');
  const [name, setName]           = useState('');
  const [manualMode, setManual]   = useState(false);
  const [locating, setLocating]   = useState(!passedLoc);
  const [submitting, setSubmit]   = useState(false);

  const cameraRef = useRef<MapboxGL.Camera>(null);

  useEffect(() => {
    if (!passedLoc) getLocation();
    else reverseGeo(passedLoc.lat, passedLoc.lng);
  }, []);

  async function getLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setManual(true); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude: lat, longitude: lng } = loc.coords;
      setCoords({ lat, lng });
      cameraRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel: 16,
        animationDuration: 500,
      });
      await reverseGeo(lat, lng);
    } catch {
      setManual(true);
    } finally {
      setLocating(false);
    }
  }

  async function reverseGeo(lat: number, lng: number) {
    try {
      const [r] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (r) {
        setAddress([r.street, r.streetNumber].filter(Boolean).join(' '));
        setCity(r.city || r.region || '');
        setDistrict(r.subregion || r.district || '');
      }
    } catch {}
  }

  function onMapPress(feature: any) {
    if (!manualMode) return;
    const [lng, lat] = feature.geometry.coordinates as [number, number];
    setCoords({ lat, lng });
    reverseGeo(lat, lng);
  }

  async function addPhoto() {
    Alert.alert('Fotoğraf Ekle', '', [
      { text: 'Kamera', onPress: openCamera },
      { text: 'Galeri',  onPress: openGallery },
      { text: 'İptal', style: 'cancel' },
    ]);
  }

  async function openCamera() {
    const r = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!r.canceled) setPhoto(r.assets[0].uri);
  }

  async function openGallery() {
    const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!r.canceled) setPhoto(r.assets[0].uri);
  }

  async function submit() {
    if (!photo)  return Alert.alert('Fotoğraf Gerekli', 'Lütfen çukurun fotoğrafını ekleyin.');
    if (!coords) return Alert.alert('Konum Gerekli', 'GPS konumunuz alınıyor veya haritadan seçin.');

    setSubmit(true);
    try {
      const fd = new FormData();
      fd.append('lat', String(coords.lat));
      fd.append('lng', String(coords.lng));
      fd.append('photo', { uri: photo, type: 'image/jpeg', name: 'report.jpg' } as any);
      if (description) fd.append('description', description);
      if (name)        fd.append('reporter_name', name);
      if (address)     fd.append('address', address);
      if (city)        fd.append('city', city);
      if (district)    fd.append('district', district);

      await axios.post(`${API_URL}/reports`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      Alert.alert('Teşekkürler!', 'Raporunuz alındı. Haritada görünecek.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.error || 'Rapor gönderilemedi.');
    } finally {
      setSubmit(false);
    }
  }

  const addrLine = [address, district, city].filter(Boolean).join(', ');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* ── Konum ── */}
        <SectionTitle text={locating ? 'Konum tespit ediliyor…' : 'Konum'} />
        <View style={[s.mapBox, elevation(1)]}>
          <MapboxGL.MapView
            style={s.map}
            styleURL="mapbox://styles/mapbox/streets-v12"
            onPress={onMapPress}
          >
            <MapboxGL.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: coords ? [coords.lng, coords.lat] : [35, 39],
                zoomLevel: coords ? 15 : 5,
              }}
            />
            {coords && (
              <MapboxGL.PointAnnotation
                id="selected-location"
                coordinate={[coords.lng, coords.lat]}
              >
                <View style={s.pin}>
                  <View style={s.pinDot} />
                </View>
              </MapboxGL.PointAnnotation>
            )}
          </MapboxGL.MapView>
          {locating && (
            <View style={s.mapOverlay}>
              <ActivityIndicator color={C.primary} size="large" />
            </View>
          )}
        </View>

        {/* GPS / Manuel butonlar */}
        <View style={s.row}>
          <TouchableOpacity style={[s.chip, { backgroundColor: C.secondary }]} onPress={getLocation}>
            <Ionicons name="locate" size={14} color={C.onDark} />
            <Text style={[s.chipText, { color: C.onDark }]}>GPS Al</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.chip, { backgroundColor: manualMode ? C.primary : C.canvasSoft }]}
            onPress={() => setManual(v => !v)}
          >
            <Ionicons name="map" size={14} color={manualMode ? C.onPrimary : C.ink} />
            <Text style={[s.chipText, { color: manualMode ? C.onPrimary : C.ink }]}>
              {manualMode ? 'Haritadan seçiliyor' : 'Manuel Seç'}
            </Text>
          </TouchableOpacity>
        </View>
        {addrLine ? <Text style={s.addrText}>{addrLine}</Text> : null}

        <Divider mx={0} />

        {/* ── Fotoğraf ── */}
        <SectionTitle text="Fotoğraf *" />
        <TouchableOpacity style={[s.photoBox, elevation(photo ? 0 : 1)]} onPress={addPhoto} activeOpacity={0.8}>
          {photo ? (
            <Image source={{ uri: photo }} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Ionicons name="camera" size={40} color={C.dim} />
              <Text style={s.photoHint}>Çukurun fotoğrafını ekleyin</Text>
            </View>
          )}
        </TouchableOpacity>
        {photo && (
          <TouchableOpacity onPress={() => setPhoto(null)} style={s.removePhoto}>
            <Text style={{ color: C.primary, fontSize: 13 }}>Fotoğrafı Kaldır</Text>
          </TouchableOpacity>
        )}

        <Divider mx={0} />

        {/* ── Açıklama ── */}
        <SectionTitle text="Açıklama (isteğe bağlı)" />
        <TextInput
          style={s.input}
          placeholder="Çukurun büyüklüğü, tehlikesi vb."
          placeholderTextColor={C.mute}
          value={description}
          onChangeText={setDesc}
          multiline
          maxLength={500}
        />

        {/* ── İsim ── */}
        <SectionTitle text="İsminiz (isteğe bağlı)" />
        <TextInput
          style={[s.input, s.inputSingle]}
          placeholder="Anonim bildirmek için boş bırakın"
          placeholderTextColor={C.mute}
          value={name}
          onChangeText={setName}
          maxLength={100}
        />

        {/* ── Gönder ── */}
        <View style={s.submitWrap}>
          <PillBtn
            label="Çukuru Bildir"
            onPress={submit}
            loading={submitting}
            fullWidth
          />
        </View>

        <View style={{ height: S.xl3 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: C.canvasSoft },
  content:  { padding: S.lg, gap: S.md },
  mapBox:   { borderRadius: R.lg, overflow: 'hidden', height: 210, marginBottom: S.sm },
  map:      { flex: 1 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  pin: { alignItems: 'center', justifyContent: 'center', width: 24, height: 24 },
  pinDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.primary, borderWidth: 3, borderColor: '#fff',
  },

  row:      { flexDirection: 'row', gap: S.sm, marginBottom: S.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: S.xxs,
    paddingHorizontal: S.md, paddingVertical: S.xs,
    borderRadius: R.pill,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  addrText: { fontSize: 12, color: C.body, marginBottom: S.xs },

  photoBox: {
    borderRadius: R.lg, overflow: 'hidden', height: 200,
    backgroundColor: C.canvas, marginBottom: S.sm,
  },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: S.sm,
  },
  photoHint: { fontSize: 14, color: C.mute },
  removePhoto: { alignSelf: 'flex-end', marginBottom: S.sm },

  input: {
    backgroundColor: C.canvas, borderRadius: R.md, padding: S.lg,
    fontSize: 14, color: C.ink, minHeight: 80, textAlignVertical: 'top',
    borderWidth: 1, borderColor: C.canvasSofter, marginBottom: S.sm,
  },
  inputSingle: { minHeight: 48, textAlignVertical: 'center' },
  submitWrap: { marginTop: S.sm },
});
