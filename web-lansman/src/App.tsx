import AnimatedHeading from './components/AnimatedHeading';
import FadeIn from './components/FadeIn';

// Uygulamanın canlı adresi. DNS hazır olunca app.alocukurhatti.xyz çalışır;
// o ana kadar demo için web-ten-kappa-37.vercel.app kullanılabilir.
const APP_URL = 'https://app.alocukurhatti.xyz';

export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col font-sans select-none">
      {/* Full-screen Raw Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
      />

      {/* Navbar Container */}
      <header className="w-full px-6 md:px-12 lg:px-16 pt-6 z-10">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between w-full">
          {/* Left: Logo */}
          <a href="/" className="text-2xl font-semibold tracking-tight text-white hover:opacity-90 transition-opacity">
            ALO ÇUKUR HATTI
          </a>

          {/* Center Links (hidden on mobile, visible md+) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#harita" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
              Harita
            </a>
            <a href="#istatistikler" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
              İstatistikler
            </a>
            <a href="#belediyeler" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
              Belediyeler
            </a>
            <a href="#hakkimizda" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
              Hakkımızda
            </a>
          </div>

          {/* Right Button */}
          <div>
            <a href={APP_URL} className="inline-block bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
              İhbar Başlat
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Content (Pushed to bottom) */}
      <main className="flex-1 w-full px-6 md:px-12 lg:px-16 flex flex-col justify-end pb-12 lg:pb-16 z-10">
        <div className="w-full lg:grid lg:grid-cols-2 lg:items-end">
          
          {/* Left Column - Main content */}
          <div className="flex flex-col items-start max-w-xl">
            {/* Animated Character-by-Character Title */}
            <AnimatedHeading text={"Geleceğin yollarını\nvizyon ve eylemle şekillendirin."} />

            {/* Subtitle with FadeIn */}
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 leading-relaxed">
                Vatandaşların gücüyle yol hasarlarını anında bildirip belediyelerle köprü kurarak yolları hep birlikte daha güvenli ve erişilebilir kılıyoruz.
              </p>
            </FadeIn>

            {/* Action Buttons with FadeIn */}
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <a href={APP_URL} className="inline-block bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                  İhbar Başlat
                </a>
                <a href={APP_URL} className="inline-block liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors duration-300">
                  Haritayı Keşfet
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right Column - Status Tag */}
          <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <FadeIn delay={1400} duration={1000} className="w-full lg:w-auto">
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl inline-block lg:block">
                <span className="text-lg md:text-xl lg:text-2xl font-light tracking-wide text-white whitespace-nowrap">
                  Bildir. Çöz. Takip Et.
                </span>
              </div>
            </FadeIn>
          </div>

        </div>
      </main>
    </div>
  );
}
