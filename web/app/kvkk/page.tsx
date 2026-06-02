import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni — Alo Çukur Hattı',
  description: 'Kişisel verilerin korunması hakkında aydınlatma metni.',
};

export default function KvkkPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', color: '#212121', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#E53935', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
        ← Ana Sayfaya Dön
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</h1>
      <p style={{ color: '#9E9E9E', fontSize: 13, marginBottom: 40 }}>Son güncelleme: Mayıs 2026</p>

      <Section title="1. Veri Sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz,
          veri sorumlusu sıfatıyla <strong>Alo Çukur Hattı</strong> (iletişim: oyunaadasi@gmail.com)
          tarafından aşağıda açıklanan kapsamda işlenmektedir.
        </p>
      </Section>

      <Section title="2. İşlenen Kişisel Veriler">
        <Table rows={[
          ['Konum bilgisi (enlem/boylam)', 'Şikayetin haritada doğru konuma işlenmesi'],
          ['Fotoğraf', 'Yol hasarının görsel olarak belgelenmesi ve moderasyon'],
          ['İsim (isteğe bağlı)', 'Şikayet sahibini haritada anonim şekilde göstermek'],
          ['E-posta (kayıtlı kullanıcı)', 'Hesap oluşturma, giriş ve hesap yönetimi'],
          ['Açıklama metni (isteğe bağlı)', 'Hasarın niteliğini açıklamak'],
          ['Anonim IP özeti*', 'Spam ve tekrarlı bildirim önleme (tek yönlü hash)'],
        ]} />
        <p style={{ fontSize: 12, color: '#9E9E9E', marginTop: 8 }}>
          * IP adresiniz sistemimize ulaştığında geri döndürülemez bir şekilde özetlenir (SHA-256 hash).
          Ham IP adresi hiçbir zaman kaydedilmez.
        </p>
      </Section>

      <Section title="3. Kişisel Veri İşlemenin Hukuki Sebebi ve Amacı">
        <p>Kişisel verileriniz KVKK Madde 5/2 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>Açık rıza (Madde 5/1):</strong> Konum bilginizin alınması için raporlama formunda onayınız alınmaktadır.</li>
          <li><strong>Meşru menfaat (Madde 5/2-f):</strong> Spam ve sahte bildirimlerin önlenmesi amacıyla anonim IP özeti tutulmaktadır.</li>
          <li><strong>Kamu yararı:</strong> Yol hasarlarının yetkili makamlara iletilerek kamu güvenliğinin sağlanması.</li>
        </ul>
      </Section>

      <Section title="4. Kişisel Verilerin Aktarımı">
        <p>
          Kişisel verileriniz; raporunuzun ilgili belediye veya yol bakım kurumuna iletilmesi amacıyla
          yetkili idari makamlarla paylaşılabilir. Bunun dışında herhangi bir üçüncü kişi veya kuruluşa
          aktarılmamaktadır.
        </p>
        <p>
          Fotoğraflarınız Vercel Blob hizmetinde (ABD), konum ve diğer veriler Neon PostgreSQL (AB/ABD)
          altyapısında barındırılmaktadır. Her iki hizmet de GDPR/KVKK kapsamında standart sözleşme
          hükümleriyle güvence altındadır.
        </p>
        <p>
          Güvenli içerik kontrolü etkin olduğunda yüklenen fotoğraflar, uygunsuz içeriği tespit etmek
          amacıyla Google Cloud Vision SafeSearch hizmetine iletilebilir.
        </p>
      </Section>

      <Section title="5. Veri Saklama Süreleri">
        <Table rows={[
          ['Konum, fotoğraf, açıklama', 'Çözüme kavuşmadan sonra 2 yıl, akabinde otomatik silme'],
          ['İsim', 'Rapor silinene kadar'],
          ['Anonim IP özeti', '90 gün (spam önleme amacıyla)'],
        ]} />
      </Section>

      <Section title="6. Haklarınız (KVKK Madde 11)">
        <p>Kişisel verilerinize ilişkin olarak aşağıdaki haklara sahipsiniz:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>Verilerin silinmesini veya yok edilmesini isteme</li>
          <li>İşlemenin kısıtlanmasını talep etme</li>
          <li>Hatalı veri varsa düzeltilmesini isteme</li>
          <li>Verilerinin aktarıldığı üçüncü kişilere bildirilmesini talep etme</li>
          <li>Otomatik karar alma sistemlerine itiraz etme</li>
        </ul>
        <p style={{ marginTop: 16 }}>
          Kayıtlı kullanıcılar mobil uygulamada Profil → "Hesabımı Sil" seçeneğini kullanarak hesaplarını
          ve hesaplarına bağlı kişisel verileri kalıcı olarak silebilir.
        </p>
        <p style={{ marginTop: 16 }}>
          Haklarınızı kullanmak için <strong>oyunaadasi@gmail.com</strong> adresine
          e-posta gönderebilirsiniz. Talepleriniz en geç 30 gün içinde yanıtlanacaktır.
        </p>
      </Section>

      <Section title="7. Çerezler (Cookie)">
        <p>
          Platform yalnızca <strong>zorunlu teknik çerezler</strong> ve oturum bilgileri kullanmaktadır.
          Pazarlama, izleme veya üçüncü taraf analitik çerezi kullanılmamaktadır.
        </p>
        <Table rows={[
          ['token (localStorage)', 'Oturum kimlik doğrulama', 'JWT süresi dolana kadar'],
          ['kvkk_consent (localStorage)', 'Aydınlatma metni onayınızın kaydedilmesi', '365 gün'],
        ]} headers={['İsim', 'Amaç', 'Süre']} />
      </Section>

      <Section title="8. İletişim">
        <p>
          Bu aydınlatma metniyle ilgili soru ve talepleriniz için:
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

function Table({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
      {headers && (
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', background: '#F5F5F5', fontWeight: 700, border: '1px solid #EEEEEE' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '8px 12px', border: '1px solid #EEEEEE', verticalAlign: 'top' }}>
                {j === 0 ? <strong>{cell}</strong> : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
