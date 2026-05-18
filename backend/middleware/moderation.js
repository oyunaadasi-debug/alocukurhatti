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

function checkImageSafe(req) {
  if (!req.file) return { safe: false, reason: 'Dosya bulunamadı.' };
  if (!ALLOWED_MIME.includes(req.file.mimetype)) {
    return { safe: false, reason: 'Yalnızca fotoğraf dosyaları kabul edilmektedir.' };
  }
  return { safe: true };
}

module.exports = { checkImageSafe, checkVisionSafe };
