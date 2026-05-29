// DESIGN.md token sistemi — tüm renkler, tipografi, spacing buradan gelir
// Ekranlarda doğrudan renk kodu yazmak yasak; T. kullanılır

// Soft Structuralism paleti — sıcak krem zemin + nane/teal vurgu, yumuşak yüzen yüzeyler
export const C = {
  // Yüzeyler (sıcak krem katmanları)
  canvas:        '#FBF9F4',
  canvasSoft:    '#F2EEE5',
  canvasSofter:  '#E8E2D6',
  pressed:       '#DED7C8',
  dim:           '#B7B0A2',

  // Metin (sıcak siyah → sıcak gri)
  ink:    '#1B1A16',
  body:   '#5C574D',
  mute:   '#9A9488',
  onDark: '#FBF9F4',

  // Birincil — Nane/Teal vurgu
  primary:          '#1FA98B',
  primaryDim:       '#178A70',
  onPrimary:        '#FFFFFF',
  primaryContainer: '#CDEDE3',

  // İkincil — Yumuşatılmış otorite mavisi (sadece "Ben de Gördüm")
  secondary:   '#3B6EA5',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D6E4F2',

  // Dikkat — açık raporlar için sıcak mercan (alarm değil ama göz çeker)
  attention:   '#E76F4F',
  onAttention: '#FFFFFF',

  // Anlam renkleri (yumuşatılmış)
  success:   '#2E9E6B',
  onSuccess: '#FFFFFF',
  warning:   '#E0A23B',
  onWarning: '#FFFFFF',
  error:     '#C9524B',
  onError:   '#FFFFFF',
} as const;

export const R = {
  sm:   6,
  md:   10,
  lg:   12,
  xl:   16,
  xxl:  20,
  pill: 999,
  full: 9999,
} as const;

export const S = {
  xxs: 4,
  xs:  6,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xl2: 24,
  xl3: 32,
} as const;

// Yumuşak, dağılmış ambient gölge (sıcak gölge rengi, geniş yarıçap — Soft Structuralism)
export const elevation = (level: 0 | 1 | 2 | 4 | 6) => ({
  elevation: level,
  shadowColor: '#3A352A',
  shadowOffset: { width: 0, height: level * 1.6 },
  shadowOpacity: level === 0 ? 0 : 0.05 + level * 0.012,
  shadowRadius: level * 4,
});

// Durum rengi (rapor statüsüne göre)
export const statusColor = (status: string) => {
  switch (status) {
    case 'resolved':  return { bg: C.success,   text: C.onSuccess };
    case 'forwarded': return { bg: C.warning,   text: C.onWarning };
    case 'reviewing': return { bg: C.secondary, text: C.onSecondary };
    case 'rejected':  return { bg: C.canvasSofter, text: C.mute };
    default:          return { bg: C.attention, text: C.onAttention };
  }
};

export const statusLabel = (status: string) => {
  switch (status) {
    case 'resolved':  return 'Çözüldü ✓';
    case 'forwarded': return 'Belediyeye İletildi';
    case 'reviewing': return 'İnceleniyor';
    case 'rejected':  return 'Reddedildi';
    default:          return 'Açık';
  }
};
