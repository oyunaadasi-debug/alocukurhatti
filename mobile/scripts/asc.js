// App Store Connect API helper — headless iOS credential setup.
// Auth via .p8 key (ES256 JWT). No secrets hardcoded; all from env.
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

const KEY_PATH  = process.env.EXPO_ASC_API_KEY_PATH;
const KEY_ID    = process.env.EXPO_ASC_KEY_ID;
const ISSUER_ID = process.env.EXPO_ASC_ISSUER_ID;

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeJWT() {
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' };
  const signingInput = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(payload));
  const key = crypto.createPrivateKey(fs.readFileSync(KEY_PATH));
  const sig = crypto.sign('sha256', Buffer.from(signingInput), { key, dsaEncoding: 'ieee-p1363' });
  return signingInput + '.' + b64url(sig);
}

function api(method, path, body) {
  const token = makeJWT();
  const data = body ? JSON.stringify(body) : null;
  const opts = {
    method,
    hostname: 'api.appstoreconnect.apple.com',
    path,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => resolve({ status: res.statusCode, body: chunks ? JSON.parse(chunks) : null }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const { execSync } = require('child_process');
const path = require('path');

const BUNDLE_ID = 'com.talha.alocukurhatti';
const OUT_DIR = path.join(__dirname, '..', 'credentials');

async function setup() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const keyPem  = path.join(OUT_DIR, 'dist.key');
  const csrPem  = path.join(OUT_DIR, 'dist.csr');
  const cerDer  = path.join(OUT_DIR, 'dist.cer');
  const cerPem  = path.join(OUT_DIR, 'dist.cer.pem');
  const p12Path = path.join(OUT_DIR, 'dist.p12');
  const profilePath = path.join(OUT_DIR, 'profile.mobileprovision');
  const P12_PASS = crypto.randomBytes(12).toString('hex');

  // 1) RSA key + CSR
  console.log('1) RSA anahtar + CSR üretiliyor...');
  execSync(`openssl req -new -newkey rsa:2048 -nodes -keyout "${keyPem}" -out "${csrPem}" -subj "/CN=Alo Cukur Hatti/O=TALHA NURI YILMAZ/C=US"`, { stdio: 'pipe' });
  const csrContent = fs.readFileSync(csrPem, 'utf8');

  // 2) Distribution certificate
  console.log('2) Dağıtım sertifikası oluşturuluyor (ASC API)...');
  const certRes = await api('POST', '/v1/certificates', {
    data: { type: 'certificates', attributes: { certificateType: 'IOS_DISTRIBUTION', csrContent } },
  });
  if (certRes.status !== 201) { console.error('CERT FAIL', certRes.status, JSON.stringify(certRes.body)); process.exit(1); }
  const certId = certRes.body.data.id;
  fs.writeFileSync(cerDer, Buffer.from(certRes.body.data.attributes.certificateContent, 'base64'));
  execSync(`openssl x509 -inform DER -in "${cerDer}" -out "${cerPem}"`, { stdio: 'pipe' });
  console.log('   cert id:', certId);

  // 3) .p12 (key + cert)
  console.log('3) .p12 paketleniyor...');
  execSync(`openssl pkcs12 -export -inkey "${keyPem}" -in "${cerPem}" -out "${p12Path}" -passout pass:${P12_PASS} -legacy`, { stdio: 'pipe' });

  // 4) Bundle ID (varsa atla)
  console.log('4) Bundle ID kaydı...');
  let bundleIdRecordId;
  const existing = await api('GET', `/v1/bundleIds?filter[identifier]=${BUNDLE_ID}`);
  if (existing.body.data && existing.body.data.length) {
    bundleIdRecordId = existing.body.data[0].id;
    console.log('   zaten kayıtlı:', bundleIdRecordId);
  } else {
    const bidRes = await api('POST', '/v1/bundleIds', {
      data: { type: 'bundleIds', attributes: { identifier: BUNDLE_ID, name: 'Alo Cukur Hatti', platform: 'IOS' } },
    });
    if (bidRes.status !== 201) { console.error('BUNDLE FAIL', bidRes.status, JSON.stringify(bidRes.body)); process.exit(1); }
    bundleIdRecordId = bidRes.body.data.id;
    console.log('   oluşturuldu:', bundleIdRecordId);
  }

  // 5) App Store provisioning profile
  console.log('5) App Store provisioning profile oluşturuluyor...');
  const profRes = await api('POST', '/v1/profiles', {
    data: {
      type: 'profiles',
      attributes: { name: 'alocukurhatti AppStore', profileType: 'IOS_APP_STORE' },
      relationships: {
        bundleId:     { data: { type: 'bundleIds', id: bundleIdRecordId } },
        certificates: { data: [{ type: 'certificates', id: certId }] },
      },
    },
  });
  if (profRes.status !== 201) { console.error('PROFILE FAIL', profRes.status, JSON.stringify(profRes.body)); process.exit(1); }
  fs.writeFileSync(profilePath, Buffer.from(profRes.body.data.attributes.profileContent, 'base64'));
  console.log('   profile yazıldı:', profilePath);

  // 6) credentials.json
  const credJson = {
    ios: {
      provisioningProfilePath: 'credentials/profile.mobileprovision',
      distributionCertificate: { path: 'credentials/dist.p12', password: P12_PASS },
    },
  };
  fs.writeFileSync(path.join(__dirname, '..', 'credentials.json'), JSON.stringify(credJson, null, 2));
  console.log('\n✅ Tamamlandı. credentials.json yazıldı. p12 şifresi credentials.json içinde.');
}

module.exports = { makeJWT, api, b64url };

// CLI: node asc.js <command>
if (require.main === module) {
  const cmd = process.argv[2];
  (async () => {
    if (cmd === 'setup') {
      await setup();
      return;
    }
    if (cmd === 'createapp') {
      // bundle id record
      const bids = await api('GET', '/v1/bundleIds?filter[identifier]=com.talha.alocukurhatti');
      const bundleRecId = bids.body.data[0].id;
      const payload = {
        data: {
          type: 'apps',
          attributes: {
            bundleId: 'com.talha.alocukurhatti',
            name: 'Alo Çukur Hattı',
            primaryLocale: 'tr',
            sku: 'alocukurhatti',
          },
          relationships: {
            bundleId: { data: { type: 'bundleIds', id: bundleRecId } },
          },
        },
      };
      const res = await api('POST', '/v1/apps', payload);
      console.log('create app status:', res.status);
      console.log(JSON.stringify(res.body, null, 2));
      return;
    }
    if (cmd === 'listapps') {
      const res = await api('GET', '/v1/apps?limit=50');
      console.log('status:', res.status);
      (res.body.data || []).forEach((a) =>
        console.log('  -', a.id, a.attributes.bundleId, '|', a.attributes.name));
      if (res.body.errors) console.log(JSON.stringify(res.body, null, 2));
      return;
    }
    if (cmd === 'test') {
      const certs = await api('GET', '/v1/certificates?limit=20');
      console.log('certificates status:', certs.status);
      if (certs.body && certs.body.data) {
        certs.body.data.forEach((c) =>
          console.log('  -', c.id, c.attributes.certificateType, c.attributes.displayName, 'exp:', c.attributes.expirationDate));
      } else {
        console.log(JSON.stringify(certs.body, null, 2));
      }
      const bids = await api('GET', '/v1/bundleIds?filter[identifier]=com.talha.alocukurhatti');
      console.log('bundleIds status:', bids.status);
      if (bids.body && bids.body.data) {
        bids.body.data.forEach((b) => console.log('  -', b.id, b.attributes.identifier, b.attributes.name));
        if (bids.body.data.length === 0) console.log('  (bundle id kayıtlı değil)');
      } else {
        console.log(JSON.stringify(bids.body, null, 2));
      }
    }
  })().catch((e) => { console.error(e); process.exit(1); });
}
