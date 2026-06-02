import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — Alo Çukur Hattı',
  description: 'Alo Çukur Hattı platformu kullanım koşulları ve sorumluluk sınırları.',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', color: '#212121', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#E53935', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
        ← Ana Sayfaya Dön
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Kullanım Koşulları</h1>
      <p style={{ color: '#9E9E9E', fontSize: 13, marginBottom: 40 }}>Son güncelleme: Mayıs 2026</p>

      <Section title="1. Hizmetin Tanımı">
        <p>
          Alo Çukur Hattı, vatandaşların yol çukuru ve yol hasarlarını fotoğraflı, harita üzerinde
          ve tarih damgalı olarak raporlayabildiği; ücretsiz, kâr amacı gütmeyen bir sosyal sorumluluk
          platformudur. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
        </p>
      </Section>

      <Section title="2. Kullanım Kuralları">
        <p>Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Yalnızca gerçek yol hasarlarını bildirin; sahte, yanıltıcı veya spam içerik göndermeyin.</li>
          <li>Yüklediğiniz fotoğraflarda kişisel veri (yüz, plaka, adres tabelası vb.) bulunmamasına özen gösterin.</li>
          <li>Hakaret, nefret söylemi, müstehcen veya yasadışı içerik göndermeyin.</li>
          <li>Başkalarının telif hakkına sahip olduğu içerikleri izinsiz yüklemeyin.</li>
          <li>Platformun teknik altyapısını bozmaya yönelik girişimlerde bulunmayın.</li>
        </ul>
      </Section>

      <Section title="3. İçerik ve Moderasyon">
        <p>
          Yüklenen tüm fotoğraflar otomatik güvenli içerik kontrolünden (Google Vision SafeSearch)
          geçirilir. Uygunsuz içerik tespit edilirse yükleme reddedilir. Ayrıca topluluk
          tarafından <strong>3 veya daha fazla şikayet</strong> alan içerikler otomatik olarak gizlenir
          ve incelemeye alınır. Yönetim, kurallara aykırı içerikleri önceden bildirimde bulunmaksızın
          kaldırma hakkını saklı tutar.
        </p>
      </Section>

      <Section title="4. İçerik Lisansı">
        <p>
          Gönderdiğiniz raporlar (fotoğraf, konum, açıklama) kamuya açık bir veri tabanında
          yayımlanır. İçeriğinizi göndererek, bu içeriğin platformda ve ilgili kamu kurumlarıyla
          paylaşımda kullanılması için Alo Çukur Hattı'na ücretsiz, dünya çapında bir kullanım hakkı
          tanımış olursunuz. İçeriğin telif hakkı size aittir.
        </p>
      </Section>

      <Section title="5. Sorumluluğun Sınırlandırılması">
        <p>
          Alo Çukur Hattı bir bilgilendirme ve raporlama platformudur. Bildirilen hasarların
          giderilmesi ilgili belediye veya yol bakım kurumlarının sorumluluğundadır; platform
          bu kurumların eylemleri veya eylemsizliğinden sorumlu tutulamaz.
        </p>
        <p>
          Hizmet "olduğu gibi" sunulmaktadır. Platform, verilerin kesintisiz veya hatasız olacağını
          garanti etmez. Kullanıcılar tarafından gönderilen içeriklerin doğruluğundan kullanıcılar
          sorumludur.
        </p>
      </Section>

      <Section title="6. Hesap ve Anonim Kullanım">
        <p>
          Platforma kayıt olmadan (anonim) rapor gönderebilirsiniz. Kayıtlı kullanıcılar, gönderdikleri
          raporları takip edebilir ve sıralamada yer alabilir. Hesabınızdan yapılan tüm işlemlerden siz
          sorumlusunuz. Kuralları ihlal eden hesaplar askıya alınabilir.
        </p>
      </Section>

      <Section title="7. Ücretlendirme">
        <p>
          Platform tamamen <strong>ücretsizdir</strong>. Herhangi bir abonelik veya uygulama içi
          satın alma bulunmamaktadır.
        </p>
      </Section>

      <Section title="8. Koşulların Değiştirilmesi">
        <p>
          Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler platform üzerinden
          duyurulur. Değişikliklerden sonra platformu kullanmaya devam etmeniz, güncel koşulları kabul
          ettiğiniz anlamına gelir.
        </p>
      </Section>

      <Section title="9. İletişim">
        <p>
          Kullanım koşullarıyla ilgili soru ve talepleriniz için:
          <br />
          <strong>E-posta:</strong> oyunaadasi@gmail.com
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #E53935', paddingBottom: 8, marginBottom: 16 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
