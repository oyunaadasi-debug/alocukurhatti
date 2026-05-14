// DESIGN.md token sistemi — tüm renkler, tipografi, spacing buradan gelir
// Ekranlarda doğrudan renk kodu yazmak yasak; T. kullanılır

export const C = {
  // Yüzeyler
  canvas:        '#FFFFFF',
  canvasSoft:    '#F5F5F5',
  canvasSofter:  '#EEEEEE',
  pressed:       '#E0E0E0',
  dim:           '#BDBDBD',

  // Metin
  ink:    '#212121',
  body:   '#616161',
  mute:   '#9E9E9E',
  onDark: '#FFFFFF',

  // Birincil — Alarm Kırmızısı (tek aksan)
  primary:          '#E53935',
  primaryDim:       '#C62828',
  onPrimary:        '#FFFFFF',
  primaryContainer: '#FFCDD2',

  // İkincil — Otorite Mavisi (sadece Ben de Gördüm)
  secondary:   '#1565C0',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#BBDEFB',

  // Anlam renkleri
  success:   '#2E7D32',
  onSuccess: '#FFFFFF',
  warning:   '#F57F17',
  onWarning: '#FFFFFF',
  error:     '#B71C1C',
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

// Elevation gölgesi (iOS + Android)
export const elevation = (level: 0 | 1 | 2 | 4 | 6) => ({
  elevation: level,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: level * 0.8 },
  shadowOpacity: level === 0 ? 0 : 0.08 + level * 0.02,
  shadowRadius: level * 2,
});

// Durum rengi (rapor statüsüne göre)
export const statusColor = (status: string) => {
  switch (status) {
    case 'resolved':  return { bg: C.success,  text: C.onSuccess };
    case 'forwarded': return { bg: C.warning,  text: C.onWarning };
    case 'reviewing': return { bg: C.secondary,text: C.onSecondary };
    case 'rejected':  return { bg: C.canvasSofter, text: C.mute };
    default:          return { bg: C.primary,  text: C.onPrimary };
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
