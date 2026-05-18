const https = require('https');

// Nominatim (OpenStreetMap) — ücretsiz, API key gerektirmez
// Rate limit: max 1 istek/saniye — rapor gönderme zaten rate limited
async function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr`;

    const req = https.get(url, { headers: { 'User-Agent': 'AlocukurHatti/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const addr = json.address || {};

          const city =
            addr.province ||
            addr.state ||
            addr.city ||
            addr.town ||
            addr.county ||
            null;

          const district =
            addr.district ||
            addr.suburb ||
            addr.city_district ||
            addr.quarter ||
            null;

          const road = addr.road || addr.pedestrian || addr.path || '';
          const houseNumber = addr.house_number ? ` No:${addr.house_number}` : '';
          const neighbourhood = addr.neighbourhood || addr.suburb || '';
          const address = [road + houseNumber, neighbourhood, district, city]
            .filter(Boolean)
            .join(', ') || json.display_name || null;

          resolve({ address, city, district });
        } catch {
          resolve({ address: null, city: null, district: null });
        }
      });
    });

    req.on('error', () => resolve({ address: null, city: null, district: null }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ address: null, city: null, district: null });
    });
  });
}

module.exports = { reverseGeocode };
