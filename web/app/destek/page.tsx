import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Destek — Alo Çukur Hattı',
  description: 'Alo Çukur Hattı destek, sıkça sorulan sorular ve iletişim.',
};

export default function SupportPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', color: '#212121', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#E53935', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
        ← Ana Sayfaya Dön
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Destek</h1>
      <p style={{ color: '#9E9E9E', fontSize: 13, marginBottom: 40 }}>
        Sorularınız için buradayız. Aşağıdaki sık sorulan sorulara göz atın veya bize yazın.
      </p>

      <div style={{ background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: 12, padding: '20px 24px', marginBottom: 40 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>📧 İletişim</p>
        <p style={{ margin: '8px 0 0' }}>
          Her türlü soru, hata bildirimi ve öneri için: <strong>oyunaadasi@gmail.com</strong>
          <br />
          <span style={{ fontSize: 13, color: '#757575' }}>Genellikle 48 saat içinde yanıt veriyoruz.</span>
        </p>
      </div>

      <Section title="Sıkça Sorulan Sorular">
        <Faq q="Çukur bildirmek için kayıt olmam gerekiyor mu?">
          Hayır. Kayıt olmadan, anonim olarak çukur bildirebilirsiniz. Kayıt olursanız bildirdiğiniz
          raporları takip edebilir ve katkı sıralamasında yer alabilirsiniz.
        </Faq>
        <Faq q="Konum iznini neden istiyorsunuz?">
          Çukurun haritada doğru yere işlenebilmesi için konumunuza ihtiyaç duyuyoruz. Konum izni
          isteğe bağlıdır; dilerseniz haritadan elle de konum seçebilirsiniz. Konum yalnızca rapor
          oluştururken kullanılır, arka planda takip yapılmaz.
        </Faq>
        <Faq q="Fotoğrafım neden reddedildi?">
          Yüklenen tüm fotoğraflar otomatik güvenli içerik kontrolünden geçer. Uygunsuz içerik (şiddet,
          müstehcenlik vb.) tespit edilirse yükleme reddedilir. Lütfen yalnızca yol hasarını gösteren
          net bir fotoğraf yükleyin.
        </Faq>
        <Faq q="Bildirdiğim çukur ne zaman düzeltilecek?">
          Alo Çukur Hattı bir raporlama platformudur; onarım ilgili belediye veya yol bakım kurumunun
          sorumluluğundadır. Raporunuzun durumu (Açık → Belediyeye İletildi → İnceleniyor → Çözüldü)
          uygulamada güncellenir.
        </Faq>
        <Faq q="Bir raporun yanlış/sahte olduğunu düşünüyorum, ne yapmalıyım?">
          Her raporda bulunan "Şikayet Et" seçeneğini kullanabilirsiniz. 3 veya daha fazla şikayet alan
          içerikler otomatik olarak gizlenir ve incelemeye alınır.
        </Faq>
        <Faq q="Hesabımı veya verilerimi nasıl silebilirim?">
          Mobil uygulamada Profil → "Hesabımı Sil" seçeneğini kullanarak hesabınızı ve hesabınıza
          bağlı kişisel verileri kalıcı olarak silebilirsiniz. Ek talepleriniz için oyunaadasi@gmail.com
          adresine yazabilirsiniz. Detaylar için <Link href="/kvkk" style={{ color: '#E53935' }}>KVKK Aydınlatma Metni</Link> sayfasına bakın.
        </Faq>
        <Faq q="Uygulama ücretli mi?">
          Hayır, tamamen ücretsizdir. Herhangi bir abonelik veya uygulama içi satın alma yoktur.
        </Faq>
      </Section>

      <Section title="İlgili Sayfalar">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><Link href="/kvkk" style={{ color: '#E53935' }}>KVKK Aydınlatma Metni (Gizlilik)</Link></li>
          <li><Link href="/kullanim-kosullari" style={{ color: '#E53935' }}>Kullanım Koşulları</Link></li>
        </ul>
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

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{q}</p>
      <p style={{ margin: 0, color: '#424242' }}>{children}</p>
    </div>
  );
}
