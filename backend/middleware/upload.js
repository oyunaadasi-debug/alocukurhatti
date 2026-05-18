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

async function uploadToBlob(file) {
  const ext = file.originalname.split('.').pop() || 'jpg';
  const filename = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blob = await put(filename, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
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
