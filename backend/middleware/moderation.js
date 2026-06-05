const https = require('https');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// Google Vision SafeSearch — UNSAFE eşiği
const UNSAFE_LEVELS = new Set(['LIKELY', 'VERY_LIKELY']);

async function checkVisionSafe(imageUrl) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) return { safe: true }; // API key yoksa geç (dev modu)

  const body = JSON.stringify({
    requests: [{
      image: { source: { imageUri: imageUrl } },
      features: [{ type: 'SAFE_SEARCH_DETECTION' }],
    }],
  });

  return new Promise((resolve) => {
    const req = https.request(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const annotation = json.responses?.[0]?.safeSearchAnnotation;
            if (!annotation) return resolve({ safe: true });

            const unsafe = ['adult', 'violence', 'racy', 'medical'].some(
              (cat) => UNSAFE_LEVELS.has(annotation[cat])
            );

            if (unsafe) {
              resolve({ safe: false, reason: 'Bu görsel yüklenemedi. Lütfen çukurun net fotoğrafını çekin.' });
            } else {
              resolve({ safe: true });
            }
          } catch {
            resolve({ safe: true }); // Parse hatası → geç
          }
        });
      }
    );
    req.on('error', () => resolve({ safe: true })); // Network hatası → geç
    req.write(body);
    req.end();
  });
}

// Gerçek dosya içeriğinden (magic byte) görsel tipini tespit eder.
// İstemcinin bildirdiği Content-Type'a GÜVENMEZ (F-004).
function sniffImageMime(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buf.toString('ascii', 8, 12);
    if (['heic', 'heix', 'hevc', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1', 'heif'].includes(brand)) {
      return 'image/heic';
    }
  }
  return null;
}

function checkImageSafe(req) {
  if (!req.file) return { safe: false, reason: 'Dosya bulunamadı.' };
  // Bildirilen MIME yerine gerçek baytlardan tespit et.
  const detected = sniffImageMime(req.file.buffer);
  if (!detected || !ALLOWED_MIME.includes(detected)) {
    return { safe: false, reason: 'Yalnızca gerçek fotoğraf dosyaları (JPEG/PNG/WebP/HEIC) kabul edilir.' };
  }
  req.file.detectedMime = detected; // uploadToBlob doğru uzantı/contentType için kullanır
  return { safe: true };
}

module.exports = { checkImageSafe, checkVisionSafe, sniffImageMime };
