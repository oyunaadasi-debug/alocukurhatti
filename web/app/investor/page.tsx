export const metadata = {
  title: 'Yatırımcı & Ortak İlişkileri — Alo Çukur Hattı',
  description:
    'Türkiye\'nin yol hasar raporlama platformu. Vatandaş güdümlü, kamu hesap verebilirliği odaklı sivil teknoloji.',
};

const RED = '#E53935';
const BLUE = '#1565C0';
const INK = '#212121';
const BODY = '#616161';
const MUTE = '#9E9E9E';
const CANVAS = '#FFFFFF';
const SOFT = '#F5F5F5';
const SUCCESS = '#2E7D32';
const WARNING = '#F57F17';

export default function InvestorPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif', color: INK, background: CANVAS, lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: CANVAS, borderBottom: `1px solid #EEEEEE`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: 9999, background: RED }} />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Alo Çukur Hattı</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 14, color: BODY }}>
          <a href="#problem" style={{ textDecoration: 'none', color: BODY }}>Sorun</a>
          <a href="#cozum" style={{ textDecoration: 'none', color: BODY }}>Çözüm</a>
          <a href="#etki" style={{ textDecoration: 'none', color: BODY }}>Etki</a>
          <a href="#yatirimci" style={{ textDecoration: 'none', color: BODY }}>Yatırımcılar</a>
          <a href="#iletisim" style={{ textDecoration: 'none', color: BODY }}>İletişim</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: RED, color: '#fff', padding: '80px 24px 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 9999, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 24, textTransform: 'uppercase' }}>
            Sosyal Sorumluluk · Sivil Teknoloji · Kamu İyisi
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Türkiye&apos;nin yolları<br />artık konuşuyor.
          </h1>
          <p style={{ fontSize: 18, opacity: 0.88, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Alo Çukur Hattı — vatandaşların yol hasarlarını fotoğraflı, haritalı ve tarih damgalı olarak raporlayabildiği, belediyeleri hesap vermeye zorlayan platform.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#iletisim" style={{ background: '#fff', color: RED, fontWeight: 700, fontSize: 15, borderRadius: 9999, padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
              Ortak Ol
            </a>
            <a href="#cozum" style={{ border: '2px solid rgba(255,255,255,0.6)', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 9999, padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: INK, padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { n: '81', label: 'İlde çalışır', note: 'Türkiye geneli' },
            { n: '15M+', label: 'Trafik kazası riski', note: 'Yıllık çukur kaynaklı' },
            { n: '₺0', label: 'Kullanıcıya maliyet', note: 'Tamamen ücretsiz' },
            { n: '3', label: 'Katmanlı doğrulama', note: 'Admin · Belediye · Vatandaş' },
          ].map(s => (
            <div key={s.n}>
              <div style={{ fontSize: 40, fontWeight: 800, color: RED, letterSpacing: '-0.02em' }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{s.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <Tag color={RED}>Sorun</Tag>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, marginTop: 12 }}>
          Yollar bozuluyor.<br />Kimse duymak istemiyor.
        </h2>
        <p style={{ fontSize: 17, color: BODY, maxWidth: 600, marginBottom: 48 }}>
          Türkiye&apos;de her yıl binlerce trafik kazası yol hasarından kaynaklanıyor. Vatandaşların şikayet etmek için tek yolu belediye çağrı merkezi — fotoğraf yok, harita yok, takip yok.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: '📞', title: 'Görünmez şikayetler', text: 'Mevcut e-belediye sistemleri kamuya açık değil. Vatandaş bildirdi mi bilmiyor, belediye çözdü mü göremiyor.' },
            { icon: '📍', title: 'Konum bilgisi yok', text: 'Telefon/e-posta şikayetlerinde kesin konum belirtilemiyor. Ekipler saatlerce boşa arıyor.' },
            { icon: '🔇', title: 'Sosyal baskı eksik', text: 'Kamuya açık bir platform olmadan belediyeler üzerinde demokratik hesap sorma mekanizması işlemiyor.' },
            { icon: '🚗', title: 'Maddi kayıplar', text: 'Çukur kaynaklı araç hasarı, trafik kazası ve sigorta maliyetleri yıllık milyarlarca lira.' },
          ].map(c => (
            <div key={c.title} style={{ background: SOFT, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 14, color: BODY, lineHeight: 1.6 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section id="cozum" style={{ background: SOFT, padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Tag color={SUCCESS}>Çözüm</Tag>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, marginTop: 12 }}>
            3 adımda şeffaf belediyecilik.
          </h2>
          <p style={{ fontSize: 17, color: BODY, maxWidth: 600, marginBottom: 52 }}>
            Alo Çukur Hattı, vatandaştan belediyelere uzanan şeffaf bir köprü kuruyor.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '01', color: RED, title: 'Çukuru bildir', text: 'Vatandaş uygulamayı açar, fotoğraf çeker, GPS otomatik konum ekler. 30 saniyede rapor hazır.' },
              { step: '02', color: WARNING, title: 'Belediyeye ilet', text: 'Sistem raporu ilgili belediyeye iletir. Diğer vatandaşlar "Ben de gördüm" ile onaylar, sosyal baskı oluşur.' },
              { step: '03', color: SUCCESS, title: 'Kanıtla & kapat', text: 'Belediye onarım fotoğrafı yükler, rapor kapatılır. Herkes görür — şeffaf, tartışmasız.' },
            ].map(s => (
              <div key={s.step} style={{ background: CANVAS, borderRadius: 16, padding: 28, borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color, letterSpacing: '0.06em', marginBottom: 12 }}>ADIM {s.step}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{s.text}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, background: CANVAS, borderRadius: 16, padding: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Platform özellikleri</div>
              {['Mobil uygulama (iOS + Android)', 'Kamuya açık harita', 'Anonim rapor desteği', 'Fotoğraf kanıtlı çözüm sistemi'].map(f => (
                <div key={f} style={{ fontSize: 14, color: BODY, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: SUCCESS, fontWeight: 700, marginTop: 1 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Teknoloji altyapısı</div>
              {['React Native / Expo (mobil)', 'Node.js + PostgreSQL + PostGIS', 'Google Vision AI moderasyon', 'Cloudinary CDN, JWT güvenlik'].map(f => (
                <div key={f} style={{ fontSize: 14, color: BODY, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: BLUE, fontWeight: 700, marginTop: 1 }}>◆</span> {f}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Mevcut durum</div>
              {['Backend API tamamlandı', 'Mobil uygulama geliştirme aktif', 'Web harita arayüzü hazır', 'Tasarım sistemi tamamlandı'].map(f => (
                <div key={f} style={{ fontSize: 14, color: BODY, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: WARNING, fontWeight: 700, marginTop: 1 }}>●</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="etki" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <Tag color={BLUE}>Sosyal Etki</Tag>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, marginTop: 12 }}>
          Neden bu proje önemli?
        </h2>
        <p style={{ fontSize: 17, color: BODY, maxWidth: 600, marginBottom: 48 }}>
          Alo Çukur Hattı, Türkiye&apos;de sivil hesap verebilirlik kültürünü inşa eden yapıtaşlarından biridir.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { icon: '🏛️', color: BLUE, title: 'Demokratik şeffaflık', text: 'Her vatandaş vergi parasının nereye gittiğini, yolların ne kadar sürede onarıldığını kamuya açık veritabanıyla görebilir.' },
            { icon: '🦺', color: RED, title: 'Trafik güvenliği', text: 'Çukur nedeniyle yaşanan kaza ve araç hasarları haritada görünür hale gelir. Tehlikeli noktalar önceliklendirilir.' },
            { icon: '📊', color: SUCCESS, title: 'Veri odaklı yönetim', text: 'Belediyeler hangi ilçede en çok hasar olduğunu nesnel veriyle görür. Bütçe ve ekip planlaması optimize edilir.' },
            { icon: '🤝', color: WARNING, title: 'Vatandaş katılımı', text: '"Ben de gördüm" özelliği toplumsal sorunların ortaklaşa sahiplenilmesini sağlar. Pasif şikayet değil, aktif katılım.' },
            { icon: '🌍', color: INK, title: 'Küresel model', text: 'SeeClickFix (ABD) ve FixMyStreet (İngiltere) gibi dünyada kanıtlanmış modelin Türkiye&apos;ye adaptasyonu.' },
            { icon: '🎓', color: MUTE, title: 'Akademik değer', text: 'Coğrafi veri, şehir planlama, kamu yönetimi araştırmaları için açık veri kaynağı. Üniversite iş birlikleri.' },
          ].map(c => (
            <div key={c.title} style={{ borderLeft: `4px solid ${c.color}`, paddingLeft: 20, paddingTop: 4 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INVESTOR TYPES */}
      <section id="yatirimci" style={{ background: INK, padding: '80px 24px', color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(229,57,53,0.25)', borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: RED, letterSpacing: '0.06em', marginBottom: 16, textTransform: 'uppercase' }}>Kimler Yatırım Yapmalı</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, color: '#fff' }}>
            Doğru yatırımcı profili.
          </h2>
          <p style={{ fontSize: 17, color: '#9E9E9E', maxWidth: 600, marginBottom: 52 }}>
            Alo Çukur Hattı hem kamu fonu hem kurumsal KSS hem de etkili yatırım kaynakları için ideal bir platform.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                category: 'Devlet Destekleri',
                color: RED,
                items: [
                  { name: 'TÜBİTAK 1512', desc: 'Teknogirişim / Bireysel Genç Girişimci — sivil tech uygun alan' },
                  { name: 'KOSGEB Teknogirişim', desc: '150.000 ₺ hibeye kadar, yazılım tabanlı projeler' },
                  { name: 'Kalkınma Ajansları', desc: 'İl bazlı akıllı şehir ve altyapı fonları' },
                ],
              },
              {
                category: 'AB & Uluslararası Fonlar',
                color: BLUE,
                items: [
                  { name: 'Horizon Europe', desc: 'Smart Cities & Communities — kentsel dijital dönüşüm' },
                  { name: 'UNDP Türkiye', desc: 'Sivil katılım ve demokratik hesap verebilirlik programları' },
                  { name: 'World Bank Smart Cities', desc: 'Gelişmekte olan ülkeler için kentsel teknoloji fonları' },
                ],
              },
              {
                category: 'Kurumsal KSS Bütçeleri',
                color: SUCCESS,
                items: [
                  { name: 'Telekomünikasyon', desc: 'Türk Telekom, Vodafone TR — altyapı güvenliği çakışır' },
                  { name: 'Otomotiv / Sigorta', desc: 'TOGG, Allianz — çukur = araç hasarı = maliyet azaltma' },
                  { name: 'İnşaat & Yol Yapım', desc: 'Limak, Kalyon — KSS + bakım iş fırsatı çakışır' },
                ],
              },
              {
                category: 'Belediyeler (B2G)',
                color: WARNING,
                items: [
                  { name: 'Büyükşehir Belediyeleri', desc: 'İstanbul, Ankara, İzmir, Adana — doğrudan lisans anlaşması' },
                  { name: 'İlçe Belediyeleri', desc: 'SaaS model: aylık abonelik, belediye paneli + API erişimi' },
                  { name: 'Dijital Dönüşüm Ofisleri', desc: 'Cumhurbaşkanlığı DDO — akıllı şehir entegrasyonu' },
                ],
              },
              {
                category: 'Etkili Yatırım (Impact)',
                color: '#9C27B0',
                items: [
                  { name: 'Accel, 500 Startups', desc: 'Civic tech portföyü olan küresel VCler' },
                  { name: 'Akbank Lab / İş Startup', desc: 'Türkiye odaklı erken evre yatırımcılar' },
                  { name: 'İTÜ Çekirdek / ODTÜ', desc: 'Üniversite kuluçka programları, mentorluk + sermaye' },
                ],
              },
              {
                category: 'Akademik İş Birliği',
                color: MUTE,
                items: [
                  { name: 'Şehir Planlama Bölümleri', desc: 'Ortak araştırma projesi, veri paylaşımı, yayın fırsatı' },
                  { name: 'Kamu Yönetimi Anabilim', desc: 'Belediye hesap verebilirliği tezleri için veri tabanı' },
                  { name: 'BAP / Araştırma Fonları', desc: 'Üniversite araştırma projeleri için uygulamalı platform' },
                ],
              },
            ].map(group => (
              <div key={group.category} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, borderTop: `3px solid ${group.color}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: group.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>{group.category}</div>
                {group.items.map(item => (
                  <div key={item.name} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 3 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: '#9E9E9E', lineHeight: 1.55 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVENUE MODEL */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <Tag color={WARNING}>Gelir Modeli</Tag>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, marginTop: 12 }}>
          Sürdürülebilir ve ücretsiz.
        </h2>
        <div style={{ background: SOFT, borderRadius: 12, padding: '16px 20px', marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 18, marginTop: 1 }}>ℹ️</span>
          <div style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>
            <strong style={{ color: INK }}>Platform tamamen ücretsizdir.</strong> Kullanıcıdan, belediyeden veya vatandaştan herhangi bir ücret talep edilmez.
            Temel yatırım ihtiyaçları <strong style={{ color: INK }}>sunucu giderleri</strong> ve <strong style={{ color: INK }}>yazılım geliştirme maliyetlerinden</strong> ibarettir.
            Gelir, yalnızca uygulama içi reklam üzerinden sağlanır; aşağıdaki modeller orta ve uzun vadeli yol haritasını göstermektedir.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 36 }}>
          {[
            { icon: '📱', title: 'Google AdMob', text: 'Uygulama içi reklamlar — kullanıcıya ücretsiz, platform gelir üretir', badge: 'Mevcut' },
            { icon: '🏢', title: 'Belediye Paneli', text: 'Belediye paneli + API erişimi — belediye ile işbirliği anlaşması yapılınca aktif', badge: 'Orta vadeli' },
            { icon: '📊', title: 'Veri & Analitik', text: 'Anonimleştirilmiş yol hasar verisi — sigorta, inşaat, akademi sektörü', badge: 'Uzun vadeli' },
            { icon: '🤝', title: 'Kurumsal Sponsor', text: 'KSS bütçesiyle kurumsal görünürlük ve özel rapor kategorisi', badge: 'Uzun vadeli' },
          ].map(r => (
            <div key={r.title} style={{ border: `1px solid #EEEEEE`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ display: 'inline-block', background: SOFT, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 600, color: BODY, marginBottom: 10 }}>{r.badge}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{r.title}</div>
              <div style={{ fontSize: 14, color: BODY, lineHeight: 1.6 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ background: SOFT, padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Tag color={INK}>Rakip Analizi</Tag>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 40, marginTop: 12 }}>
            Dünyada kanıtlandı. Türkiye&apos;de yok.
          </h2>
          <div style={{ background: CANVAS, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: INK, color: '#fff' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Platform</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>Türkiye</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>Harita</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>Fotoğraf</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>Kamuya Açık</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'SeeClickFix', country: 'ABD', harita: true, foto: true, kamusal: true, tr: false },
                  { name: 'FixMyStreet', country: 'İngiltere', harita: true, foto: true, kamusal: true, tr: false },
                  { name: 'e-Belediye Şikayet', country: 'Türkiye', harita: false, foto: false, kamusal: false, tr: true },
                  { name: 'Alo Çukur Hattı', country: 'Türkiye', harita: true, foto: true, kamusal: true, tr: true, highlight: true },
                ].map((p, i) => (
                  <tr key={p.name} style={{ background: p.highlight ? '#FFF8F8' : i % 2 === 0 ? CANVAS : SOFT, borderBottom: `1px solid #EEEEEE` }}>
                    <td style={{ padding: '14px 20px', fontWeight: p.highlight ? 700 : 400 }}>
                      {p.name}
                      {p.highlight && <span style={{ marginLeft: 8, fontSize: 11, background: RED, color: '#fff', borderRadius: 9999, padding: '2px 8px', fontWeight: 700 }}>BİZ</span>}
                      <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{p.country}</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 18 }}>{p.tr ? '✅' : '❌'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 18 }}>{p.harita ? '✅' : '❌'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 18 }}>{p.foto ? '✅' : '❌'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 18 }}>{p.kamusal ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <Tag color={SUCCESS}>Ekip</Tag>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, marginTop: 12 }}>
          Proje arkasında kim var?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 36 }}>
          <div style={{ background: SOFT, borderRadius: 16, padding: 28 }}>
            {/* Fotoğraf placeholder — gerçek fotoğraf eklenince img etiketi ile değiştirilecek */}
            <div style={{ width: 80, height: 80, borderRadius: 9999, background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, marginBottom: 16 }}>TY</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>Talha Yılmaz</div>
            <div style={{ fontSize: 13, color: MUTE, marginBottom: 8 }}>Adana</div>
            <div style={{ fontSize: 14, color: RED, fontWeight: 600, marginBottom: 16 }}>Kurucu & Proje Sahibi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Eğitim', value: 'Siyaset Bilimi ve Kamu Yönetimi — Lisans · Yüksek Lisans · Doktora (Tez Aşaması)' },
                { label: 'Sektör', value: 'Gayrimenkul' },
              ].map(r => (
                <div key={r.label} style={{ fontSize: 13, color: BODY }}>
                  <span style={{ fontWeight: 600, color: INK }}>{r.label}:</span> {r.value}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>
              Belediyelerle doğrudan işbirliği kurarak şeffaf belediyecilik anlayışını dijitalleştirmeyi hedefliyor. Proje, Yeni Kamu İşletmeciliği (YKİ) ilkeleri ve Dünya Bankası&apos;nın yönetişim çerçevesiyle uyumlu olarak tasarlanmıştır.
            </div>
          </div>
          <div style={{ background: SOFT, borderRadius: 16, padding: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 9999, background: SOFT, border: `2px dashed #BDBDBD`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>+</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Teknik Ortak Aranıyor</div>
            <div style={{ fontSize: 14, color: BLUE, fontWeight: 600, marginBottom: 12 }}>CTO / Full-Stack Geliştirici</div>
            <div style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>React Native, Node.js ve PostgreSQL tecrübeli bir teknik kurucu arıyoruz. Açık bir pozisyon.</div>
          </div>
          <div style={{ background: SOFT, borderRadius: 16, padding: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 9999, background: SOFT, border: `2px dashed #BDBDBD`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>+</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Belediye Danışmanı Aranıyor</div>
            <div style={{ fontSize: 14, color: WARNING, fontWeight: 600, marginBottom: 12 }}>Kamu İlişkileri Uzmanı</div>
            <div style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>Belediye ile anlaşma süreçlerini yönetecek, kamu kurumu deneyimi olan bir danışman.</div>
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="iletisim" style={{ background: RED, padding: '80px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Birlikte Türkiye&apos;yi<br />daha güvenli yapalım.
          </h2>
          <p style={{ fontSize: 17, opacity: 0.88, marginBottom: 40, lineHeight: 1.65 }}>
            Yatırımcı, belediye yöneticisi, kurumsal sponsor veya teknik ortak olarak iletişime geçebilirsiniz.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <a href="mailto:talhayilmaz1@gmail.com" style={{ background: '#fff', color: RED, fontWeight: 700, fontSize: 16, borderRadius: 9999, padding: '16px 40px', textDecoration: 'none', display: 'inline-block' }}>
              talhayilmaz1@gmail.com
            </a>
            <a href="tel:+905546597998" style={{ fontSize: 15, color: '#fff', opacity: 0.88, textDecoration: 'none', fontWeight: 600 }}>
              +90 554 659 79 98
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: RED }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Alo Çukur Hattı</span>
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>
          Türkiye genelinde vatandaş güdümlü yol hasar raporlama platformu · 2026
        </div>
      </footer>
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: `${color}18`,
      borderRadius: 9999,
      padding: '4px 14px',
      fontSize: 12,
      fontWeight: 700,
      color,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
    }}>
      {children}
    </div>
  );
}
