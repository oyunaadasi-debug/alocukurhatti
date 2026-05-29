// Belediye şikayet kanalları dizini + şikayet metni üretici
//
// Türkiye'de belediyelerin çoğu otomatik gönderim için açık API sunmaz. Bu yüzden
// vatandaşı doğru kanala HAZIR metinle yönlendiriyoruz. CİMER her il/her sorun için
// geçerli evrensel resmi kanaldır; büyükşehirler ayrıca Alo 153 çözüm hattını kullanır.
//
// `web` alanı SADECE doğrulanmış doğrudan şikayet/çözüm merkezi linkleri içerir.
// Yeni link eklerken: ilgili belediyenin resmi çözüm merkezi sayfasını doğrula, buraya ekle.

export const CIMER_URL = 'https://www.cimer.gov.tr';
export const ALO_153 = '153';

export const ISSUE_LABELS: Record<string, string> = {
  cukur:          'Çukur',
  bozuk_yol:      'Bozuk Yol',
  kaldirim:       'Kaldırım Hasarı',
  tumsek:         'Tümsek',
  su_birikintisi: 'Su Birikintisi',
};

export function issueLabel(t?: string): string {
  return (t && ISSUE_LABELS[t]) || 'Yol Hasarı';
}

export type BelediyeKanal = {
  buyuksehir: boolean; // true → Alo 153 çözüm hattı geçerli
  web?: string;        // doğrulanmış doğrudan şikayet sayfası (varsa)
};

// 30 büyükşehir — anahtarlar Türkçe büyük harfle normalize edilmiştir.
const BELEDIYELER: Record<string, BelediyeKanal> = {
  'İSTANBUL':      { buyuksehir: true, web: 'https://cozummerkezi.ibb.istanbul/' },
  'ANKARA':        { buyuksehir: true, web: 'https://baskent153.ankara.bel.tr/Portal/BasvuruKanallari' },
  'İZMİR':         { buyuksehir: true, web: 'https://www.bizizmir.com/tr/Him/BasvuruKayit' },
  'ADANA':         { buyuksehir: true },
  'ANTALYA':       { buyuksehir: true },
  'AYDIN':         { buyuksehir: true },
  'BALIKESİR':     { buyuksehir: true },
  'BURSA':         { buyuksehir: true },
  'DENİZLİ':       { buyuksehir: true },
  'DİYARBAKIR':    { buyuksehir: true },
  'ERZURUM':       { buyuksehir: true },
  'ESKİŞEHİR':     { buyuksehir: true },
  'GAZİANTEP':     { buyuksehir: true },
  'HATAY':         { buyuksehir: true },
  'KAHRAMANMARAŞ': { buyuksehir: true },
  'KAYSERİ':       { buyuksehir: true },
  'KOCAELİ':       { buyuksehir: true },
  'KONYA':         { buyuksehir: true },
  'MALATYA':       { buyuksehir: true },
  'MANİSA':        { buyuksehir: true },
  'MARDİN':        { buyuksehir: true },
  'MERSİN':        { buyuksehir: true },
  'MUĞLA':         { buyuksehir: true },
  'ORDU':          { buyuksehir: true },
  'SAKARYA':       { buyuksehir: true },
  'SAMSUN':        { buyuksehir: true },
  'ŞANLIURFA':     { buyuksehir: true },
  'TEKİRDAĞ':      { buyuksehir: true },
  'TRABZON':       { buyuksehir: true },
  'VAN':           { buyuksehir: true },
};

function normalizeIl(il?: string): string {
  return (il || '').trim().toLocaleUpperCase('tr-TR');
}

export function belediyeFor(il?: string): BelediyeKanal | undefined {
  const key = normalizeIl(il);
  return key ? BELEDIYELER[key] : undefined;
}

export type ComplaintReport = {
  city?: string;
  district?: string;
  address?: string;
  description?: string;
  issue_type?: string;
  lat?: number;
  lng?: number;
  photo_url?: string;
};

// Belediyeye / CİMER'e gönderilecek hazır şikayet metni
export function buildComplaintText(r: ComplaintReport): string {
  const yer = [r.address, r.district, r.city].filter(Boolean).join(', ') || 'belirtilen konum';
  const lines = [
    `${yer} adresinde ${issueLabel(r.issue_type).toLocaleLowerCase('tr-TR')} bulunmaktadır.`,
  ];
  if (r.description) lines.push(`Vatandaş açıklaması: ${r.description}`);
  if (r.lat != null && r.lng != null) {
    lines.push(`Konum: https://www.google.com/maps?q=${r.lat},${r.lng}`);
  }
  if (r.photo_url) lines.push(`Fotoğraf: ${r.photo_url}`);
  lines.push('Gerekli onarımın yapılmasını rica ederim.');
  lines.push('(Alo Çukur Hattı üzerinden iletilmiştir.)');
  return lines.join('\n');
}
