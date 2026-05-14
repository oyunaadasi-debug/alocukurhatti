const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

function checkImageSafe(req) {
  if (!req.file) return { safe: false, reason: 'Dosya bulunamadı.' };
  if (!ALLOWED_MIME.includes(req.file.mimetype)) {
    return { safe: false, reason: 'Yalnızca fotoğraf dosyaları kabul edilmektedir.' };
  }
  return { safe: true };
}

module.exports = { checkImageSafe };
