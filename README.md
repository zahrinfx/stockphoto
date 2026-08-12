# Sprocket — Jana Metadata Shutterstock

Website standalone yang describe gambar (title, keywords, flag) ikut format Shutterstock, guna Claude API. API key disimpan selamat di server (Vercel Environment Variable) — tidak pernah terdedah di browser.

## Struktur Fail

```
sprocket-web/
├── api/
│   └── describe.js     ← Serverless function (backend, pegang API key)
├── public/
│   └── index.html      ← Frontend (upload gambar, papar hasil, export CSV)
├── package.json
├── .env.example
└── .gitignore
```

## Langkah 1 — Dapatkan API Key Anthropic

1. Pergi ke **https://console.anthropic.com**
2. Daftar/log masuk akaun
3. Pergi ke **Settings → API Keys → Create Key**
4. Salin key tu (bermula dengan `sk-ant-...`) — simpan sementara, tak boleh lihat semula lepas ni
5. Pergi ke **Settings → Billing**, tambah kaedah pembayaran. Kos guna ni sangat kecil (anggaran bawah 5 sen setiap gambar), bayar ikut guna sahaja — bukan subscription bulanan

## Langkah 2 — Push ke GitHub

1. Buat repo baru di **github.com/new** (contoh: `sprocket-web`)
2. Di komputer, dalam folder `sprocket-web` ni, jalankan:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/sprocket-web.git
git push -u origin main
```

(Ganti `USERNAME` dengan username GitHub kau)

## Langkah 3 — Deploy ke Vercel

1. Pergi ke **https://vercel.com** → log masuk (boleh guna akaun GitHub terus)
2. Klik **Add New → Project**
3. Pilih repo `sprocket-web` yang baru push tadi → klik **Import**
4. Vercel akan auto-detect struktur (static + serverless function) — tak perlu ubah apa-apa setting
5. **Sebelum klik Deploy**, buka bahagian **Environment Variables**, tambah:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste API key dari Langkah 1)
6. Klik **Deploy**

Lepas siap deploy, Vercel bagi domain percuma macam `sprocket-web.vercel.app` — buka terus, dah boleh guna.

## Alternatif: Deploy guna Vercel CLI (tanpa GitHub)

```bash
npm i -g vercel
cd sprocket-web
vercel login
vercel
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

## Nota Penting

- **Had saiz gambar**: Vercel serverless function ada had payload ~4.5MB setiap request. Frontend dah auto-resize gambar (maks 1568px sisi terpanjang) sebelum hantar, so ni biasanya tak jadi masalah — tapi kalau upload gambar yang sangat besar (>20MB asal), boleh jadi perlahan sikit semasa resize di browser.
- **Custom domain**: Boleh tambah domain sendiri di Vercel → Project Settings → Domains, kalau nak guna domain kau sendiri instead of `.vercel.app`.
- **Kos**: Anggaran kurang RM0.05 setiap gambar (Claude Sonnet, imej + output metadata). Boleh pantau usage & set spending limit di console.anthropic.com → Billing.
- **Testing lokal**: `vercel dev` di dalam folder ni akan run local server yang baca `.env.local` (salin dari `.env.example` dan isi key sebenar).
