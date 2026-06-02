import React, { useRef, useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Text } from '../components/AppText';
import { C, R, S, elevation } from '../theme';

// İlk açılışta gösterilen hikaye akışı — uygulamanın amacını ve nasıl
// çalıştığını 4 adımda anlatır. Yalnızca bir kez görünür (App.tsx bayrağı).

type Slide = {
  emoji: string;
  title: string;
  body: string;
  steps?: string[];
};

const SLIDES: Slide[] = [
  {
    emoji: '🕳️',
    title: 'Yollardaki çukurlar görünür olsun',
    body: 'Her gün binlerce araç bozuk yollardan zarar görüyor. Çukurların çoğu kimseye bildirilmeden öylece kalıyor.',
  },
  {
    emoji: '📣',
    title: 'Birlikte sesimizi duyuralım',
    body: 'Alo Çukur Hattı, kâr amacı gütmeyen bir vatandaş girişimidir. Amacımız çukurları haritaya işleyip kamuoyu oluşturmak ve belediyeleri çözüme çağırmaktır.',
  },
  {
    emoji: '✅',
    title: 'Nasıl çalışır?',
    body: 'Dört basit adım — hepsi birkaç saniye sürer:',
    steps: [
      'Gördüğün çukuru bildir (istersen anonim)',
      'Konumu haritada herkes görsün',
      'Aynı çukuru görenler "Ben de Gördüm" desin',
      'Bildirim belediyeye iletilsin, çözülsün',
    ],
  },
  {
    emoji: '🚀',
    title: 'Sen de katıl',
    body: 'Sessiz kalma. Tek bir bildirim bile fark yaratır. Hazırsan başlayalım — hesap açmadan da bildirebilirsin.',
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLast = index === SLIDES.length - 1;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  }

  function next() {
    if (isLast) return onDone();
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  }

  return (
    <View style={s.container}>
      {/* Atla */}
      <TouchableOpacity style={s.skip} onPress={onDone} hitSlop={12}>
        <Text style={s.skipText}>Atla</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[s.slide, { width }]}>
            <Text style={s.emoji}>{slide.emoji}</Text>
            <Text style={s.title}>{slide.title}</Text>
            <Text style={s.body}>{slide.body}</Text>

            {slide.steps && (
              <View style={s.steps}>
                {slide.steps.map((step, k) => (
                  <View key={k} style={[s.stepRow, elevation(1)]}>
                    <View style={s.stepNum}>
                      <Text style={s.stepNumText}>{k + 1}</Text>
                    </View>
                    <Text style={s.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Noktalar */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      {/* İleri / Başla */}
      <TouchableOpacity style={[s.cta, elevation(4)]} onPress={next} activeOpacity={0.85}>
        <Text style={s.ctaText}>{isLast ? 'Başla' : 'İleri'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },

  skip: { position: 'absolute', top: 56, right: S.lg, zIndex: 10, padding: S.xs },
  skipText: { fontSize: 14, color: C.mute, fontWeight: '600' },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.xl2 },
  emoji: { fontSize: 76, marginBottom: S.xl },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: S.md, lineHeight: 34 },
  body:  { fontSize: 16, color: C.body, textAlign: 'center', lineHeight: 24 },

  steps: { alignSelf: 'stretch', gap: S.sm, marginTop: S.xl },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.canvasSoft, borderRadius: R.lg, padding: S.md,
  },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: C.onPrimary, fontSize: 14, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, color: C.ink, lineHeight: 20 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: S.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.canvasSofter },
  dotActive: { width: 22, backgroundColor: C.primary },

  cta: {
    backgroundColor: C.primary,
    borderRadius: R.pill, height: 54,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: S.xl2, marginBottom: S.xl3,
  },
  ctaText: { color: C.onPrimary, fontSize: 17, fontWeight: '700' },
});
