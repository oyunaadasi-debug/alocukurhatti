# Alo Çukur Hattı — Claude Code Otomasyonları

**Kurulum tarihi:** 2026-05-19  
**Durum:** Tüm otomasyonlar aktif ✅

---

## 🔌 MCP Sunucuları (Kuruldu)

### context7
- **Ne yapar:** Express, Next.js, React Native, Leaflet, PostGIS, Cloudinary belgelerini anında getirir
- **Kurulum:** `claude mcp add context7 -- npx -y @upstash/context7-mcp`
- **Kullanım:** "use context7" yazarak soru sor — Claude güncel dokümana bakar
- **Durum:** ✅ Kuruldu

### GitHub MCP
- **Ne yapar:** PR oluşturma, issue takibi, CI log okuma doğrudan Claude'dan
- **Kurulum:** `claude mcp add github -- npx -y @modelcontextprotocol/server-github`
- **Gerekli env:** `GITHUB_PERSONAL_ACCESS_TOKEN` (GitHub Settings → Developer settings → Personal access tokens)
- **Durum:** ✅ Kuruldu — Token girilmeli

---

## ⚡ Hooks (Aktif)

### .env Koruma (PreToolUse)
- **Ne yapar:** `backend/.env` ve `mobile/.env` dosyalarını yanlışlıkla editlemeden korur
- **Tetikleyici:** Edit veya Write tool çağrıldığında
- **İzin verilen:** Sadece `.env.example` düzenlenebilir
- **Dosya:** `.claude/settings.json`
- **Durum:** ✅ Aktif

### TypeScript Type-Check (PostToolUse)
- **Ne yapar:** `web/` içinde `.ts/.tsx` dosyası editlendiğinde otomatik `tsc --noEmit` çalıştırır
- **Tetikleyici:** web/ altındaki TypeScript dosyaları değiştiğinde
- **Dosya:** `.claude/settings.json`
- **Durum:** ✅ Aktif

---

## 🎯 Skills (Kullanıma Hazır)

### /api-endpoint
- **Ne yapar:** Yeni Express route endpoint'i scaffold eder
- **Pattern:** express-validator + pool.query + hata yönetimi
- **Dosya:** `.claude/skills/api-endpoint/SKILL.md`
- **Nasıl çağırılır:** Konuşmada "yeni endpoint ekle" veya `/api-endpoint` yaz
- **Durum:** ✅ Hazır

### /db-migration
- **Ne yapar:** Yeni PostgreSQL migration dosyası oluşturur
- **Pattern:** IF NOT EXISTS, idempotent, PostGIS uyumlu
- **Dosya:** `.claude/skills/db-migration/SKILL.md`
- **Nasıl çağırılır:** "yeni tablo ekle" veya `/db-migration` yaz
- **Durum:** ✅ Hazır

---

## 🤖 Subagentler (Kullanıma Hazır)

### security-reviewer
- **Ne yapar:** JWT, SQL injection, dosya yükleme, rate limiting güvenlik taraması
- **Odak:** OWASP Top 10, backend route'ları
- **Dosya:** `.claude/agents/security-reviewer.md`
- **Nasıl çağırılır:** `/security-review` komutu veya "güvenlik tara" yaz
- **Durum:** ✅ Hazır

### api-documenter
- **Ne yapar:** Tüm route dosyalarından OpenAPI 3.0 YAML üretir
- **Çıktı:** `backend/docs/openapi.yaml`
- **Dosya:** `.claude/agents/api-documenter.md`
- **Nasıl çağırılır:** "API belgesi oluştur" yaz
- **Durum:** ✅ Hazır

### growth-council
- **Ne yapar:** CEO, sosyal medya, reklam, data, ASO, belediye, moderasyon ve UX perspektiflerini tek faz planında birleştirir
- **Dosya:** `.codex/agents/growth-council.toml`
- **Nasıl çağırılır:** "büyüme ekibiyle düşün", "faz planı çıkar", "ürün şirketi gibi değerlendir" yaz
- **Durum:** ✅ Hazır

### product-ceo
- **Ne yapar:** Faz 1/2/3 ürün stratejisi ve önceliklendirme yapar
- **Dosya:** `.codex/agents/product-ceo.toml`
- **Durum:** ✅ Hazır

### social-media-manager
- **Ne yapar:** TikTok, Instagram, X ve yerel topluluk içerikleri üretir
- **Dosya:** `.codex/agents/social-media-manager.toml`
- **Durum:** ✅ Hazır

### data-analyst
- **Ne yapar:** Funnel, şehir/ilçe metrikleri ve büyüme raporları çıkarır
- **Dosya:** `.codex/agents/data-analyst.toml`
- **Durum:** ✅ Hazır

### ads-manager
- **Ne yapar:** Düşük bütçeli reklam testleri, hedef kitle ve kreatif planı çıkarır
- **Dosya:** `.codex/agents/ads-manager.toml`
- **Durum:** ✅ Hazır

### app-store-aso-specialist
- **Ne yapar:** App Store / Google Play başlık, açıklama, anahtar kelime ve screenshot stratejisi üretir
- **Dosya:** `.codex/agents/app-store-aso-specialist.toml`
- **Durum:** ✅ Hazır

### municipality-partnerships-lead
- **Ne yapar:** Belediye ve kurum iş birlikleri için güvenli teklif ve pilot stratejisi üretir
- **Dosya:** `.codex/agents/municipality-partnerships-lead.toml`
- **Durum:** ✅ Hazır

### community-moderation-lead
- **Ne yapar:** UGC güvenliği, kötüye kullanım ve moderasyon risklerini yönetir
- **Dosya:** `.codex/agents/community-moderation-lead.toml`
- **Durum:** ✅ Hazır

### ux-researcher
- **Ne yapar:** Teknik olmayan vatandaş gözüyle ekran akışlarını ve sürtünmeleri inceler
- **Dosya:** `.codex/agents/ux-researcher.toml`
- **Durum:** ✅ Hazır

---

## 🎨 Yüklü Plugin'ler ve Kullanım Senaryoları

| Plugin | Ne İçin Kullanılır |
|---|---|
| **frontend-design** | Admin paneli web UI, MapView yeniden tasarımı |
| **figma** | DESIGN.md tasarım sistemini Figma'ya aktar |
| **superpowers** | Backend + mobile ekranları paralel ajan ile yaz |
| **code-review** | PR push öncesi `/review` ile kod inceleme |
| **playground** | API endpoint'lerini test eden interaktif HTML arayüzü |
| **skill-creator** | Yeni skill dosyaları oluştur ve geliştir |
| **github** | GitHub MCP ile PR/issue yönetimi |
| **learning-output-style** | Öğrenme odaklı açıklama formatı |

---

## Dosya Yapısı

```
alocukurhatti/
├── .claude/
│   ├── settings.json          ← Hooks (env koruma + tsc)
│   ├── skills/
│   │   ├── api-endpoint/
│   │   │   └── SKILL.md
│   │   └── db-migration/
│   │       └── SKILL.md
│   └── agents/
│       ├── security-reviewer.md
│       └── api-documenter.md
└── CLAUDE_AUTOMATIONS.md      ← Bu dosya
```

---

## Sonraki Önerilen Adımlar

1. `GITHUB_PERSONAL_ACCESS_TOKEN` env değişkenini ekle → GitHub MCP tam çalışsın
2. `/security-review` çalıştır → Yeni eklenen auth/route kodlarını tara
3. `api-documenter` çalıştır → `backend/docs/openapi.yaml` oluştur (belediye entegrasyonu için)
4. Auth rate limit ekle → `/api/auth/login` brute force koruması
