const multer = require('multer');
const { put, del } = require('@vercel/blob');

// Dosyaları bellekte tut — Vercel Blob'a sonradan yükle
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Sadece görsel dosyası yüklenebilir.'));
    }
    cb(null, true);
  },
});

// Uzantı ve contentType, istemcinin bildirdiği değil, checkImageSafe'in
// gerçek baytlardan tespit ettiği tipten türetilir (F-004, F-007).
const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heic',
};

async function uploadToBlob(file) {
  const mime = file.detectedMime || 'image/jpeg';
  const ext = MIME_EXT[mime] || 'jpg';
  const filename = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blob = await put(filename, file.buffer, {
    access: 'public',
    contentType: mime,
  });
  return { url: blob.url, pathname: blob.pathname };
}

async function deleteFromBlob(url) {
  try {
    await del(url);
  } catch {
    // Sessizce geç — zaten silinmiş olabilir
  }
}

module.exports = { upload, uploadToBlob, deleteFromBlob };
