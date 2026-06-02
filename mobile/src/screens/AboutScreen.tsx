import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S, elevation, statusColor, statusLabel } from '../theme';

// "Uygulama Nasıl Çalışır / Hakkında" — her zaman erişilebilir bilgi sayfası.
// Onboarding hikayesinin kalıcı, detaylı sürümü.

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'camera-outline',        title: 'Çukuru bildir',         body: 'Gördüğün yol hasarının fotoğrafını çek, konumunu işaretle. İstersen hesap açmadan, anonim olarak da gönderebilirsin.' },
  { icon: 'map-outline',           title: 'Haritada görünür olsun', body: 'Bildirdiğin çukur anında haritaya düşer; herkes nerede olduğunu görür.' },
  { icon: 'people-outline',        title: '"Ben de Gördüm" de',     body: 'Aynı çukuru gören başkaları da işaretler. Sayı arttıkça o nokta öne çıkar ve önceliklenir.' },
  { icon: 'megaphone-outline',     title: 'Belediyeye iletilsin',   body: 'Biriken bildirimler ilgili belediyeye iletilir. Çözüldüğünde durum güncellenir, takip edenlere bildirim gider.' },
];

const STATUSES = ['open', 'reviewing', 'forwarded', 'resolved'];

export default function AboutScreen() {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.logo}>🕳️</Text>
        <Text style={s.appName}>Alo Çukur Hattı</Text>
        <View style={s.npBadge}>
          <Ionicons name="heart-outline" size={13} color={C.primaryDim} />
          <Text style={s.npBadgeText}>Kâr amacı gütmeyen vatandaş girişimi</Text>
        </View>
      </View>

      {/* Bu uygulama ne için */}
      <View style={[s.card, elevation(1)]}>
        <Text style={s.cardTitle}>Bu uygulama ne için?</Text>
        <Text style={s.paragraph}>
          Alo Çukur Hattı; vatandaşların yollardaki çukur ve hasarları tek tek değil,
          hep birlikte görünür kıldığı bir kamu girişimidir. Reklam göstermez, ücret almaz,
          kâr amacı gütmez.
        </Text>
        <Text style={s.paragraph}>
          Amacımız basit: yol hasarlarını haritalayarak kamuoyu oluşturmak ve yetkili
          belediyeleri sorunları çözmeye çağırmak. Ne kadar çok kişi bildirirse, ses o
          kadar yüksek çıkar.
        </Text>
      </View>

      {/* Nasıl çalışır */}
      <Text style={s.sectionTitle}>Nasıl çalışır?</Text>
      <View style={{ gap: S.sm }}>
        {STEPS.map((step, i) => (
          <View key={i} style={[s.stepCard, elevation(1)]}>
            <View style={s.stepIcon}>
              <Ionicons name={step.icon} size={20} color={C.primaryDim} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{i + 1}. {step.title}</Text>
              <Text style={s.stepBody}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Durum etiketleri */}
      <Text style={s.sectionTitle}>Durum etiketleri ne anlama gelir?</Text>
      <View style={[s.card, elevation(1)]}>
        {STATUSES.map((st, i) => {
          const sc = statusColor(st);
          return (
            <View key={st} style={[s.statusRow, i > 0 && s.statusRowBorder]}>
              <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                <Text style={[s.statusPillText, { color: sc.text }]}>{statusLabel(st)}</Text>
              </View>
              <Text style={s.statusDesc}>{STATUS_DESC[st]}</Text>
            </View>
          );
        })}
      </View>

      {/* Anonimlik */}
      <View style={[s.note, elevation(1)]}>
        <Ionicons name="lock-closed-outline" size={18} color={C.secondary} />
        <Text style={s.noteText}>
          Gizliliğine saygı duyarız. Bildirim için hesap zorunlu değildir; anonim
          gönderebilirsin. Hesap açarsan yalnızca kendi raporlarını takip edebilir ve
          çözüldüğünde bildirim alırsın.
        </Text>
      </View>

      {/* Belediyelere çağrı */}
      <View style={[s.callout, elevation(2)]}>
        <Text style={s.calloutTitle}>📣 Belediyelere çağrımız</Text>
        <Text style={s.calloutText}>
          Bu haritadaki her nokta, zarar gören bir araç ya da risk altındaki bir can demek.
          Belediyeleri, vatandaşların bildirdiği bu hasarları zamanında ve şeffaf biçimde
          gidermeye davet ediyoruz. Birlikte daha güvenli yollar mümkün.
        </Text>
      </View>

      <Text style={s.version}>Alo Çukur Hattı v1.0.0</Text>
    </ScrollView>
  );
}

const STATUS_DESC: Record<string, string> = {
  open:      'Yeni bildirildi, henüz incelenmedi.',
  reviewing: 'Bildirim inceleniyor / doğrulanıyor.',
  forwarded: 'İlgili belediyeye iletildi.',
  resolved:  'Çukur giderildi, sorun çözüldü.',
};

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: C.canvasSoft },
  content: { padding: S.lg, gap: S.lg, paddingBottom: S.xl3 },

  hero: { alignItems: 'center', gap: S.xs, paddingVertical: S.md },
  logo: { fontSize: 56 },
  appName: { fontSize: 22, fontWeight: '800', color: C.ink },
  npBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.primaryContainer, borderRadius: R.pill,
    paddingHorizontal: 12, paddingVertical: 5, marginTop: 2,
  },
  npBadgeText: { fontSize: 12, fontWeight: '700', color: C.primaryDim },

  card: { backgroundColor: C.canvas, borderRadius: R.xl, padding: S.lg, gap: S.sm },
  cardTitle: { fontSize: 17, fontWeight: '800', color: C.ink, marginBottom: 2 },
  paragraph: { fontSize: 14, color: C.body, lineHeight: 22 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.ink, marginBottom: -S.xs },

  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: S.md,
    backgroundColor: C.canvas, borderRadius: R.lg, padding: S.md,
  },
  stepIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primaryContainer, alignItems: 'center', justifyContent: 'center',
  },
  stepTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 2 },
  stepBody:  { fontSize: 13, color: C.body, lineHeight: 19 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm },
  statusRowBorder: { borderTopWidth: 1, borderTopColor: C.canvasSofter },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill, minWidth: 116, alignItems: 'center' },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  statusDesc: { flex: 1, fontSize: 13, color: C.body, lineHeight: 18 },

  note: {
    flexDirection: 'row', alignItems: 'flex-start', gap: S.sm,
    backgroundColor: C.secondaryContainer, borderRadius: R.lg, padding: S.md,
  },
  noteText: { flex: 1, fontSize: 13, color: C.secondary, lineHeight: 19 },

  callout: {
    backgroundColor: C.primary, borderRadius: R.xl, padding: S.lg, gap: S.sm,
  },
  calloutTitle: { fontSize: 16, fontWeight: '800', color: C.onPrimary },
  calloutText: { fontSize: 14, color: C.onPrimary, lineHeight: 22, opacity: 0.95 },

  version: { textAlign: 'center', fontSize: 12, color: C.mute, marginTop: S.xs },
});
