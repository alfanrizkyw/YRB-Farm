# Berkah Rizki Bersama Farm

Situs profil dan pemesanan domba untuk kurban, aqiqah, penggemukan, dan pembibitan.
Dibangun dengan Next.js 16 dan React 19. Bahasa Indonesia & Inggris.

- Situs: `/` (ID) dan `/en` (EN)
- Panel internal: tidak ditautkan dari situs, `noindex`, dan diblokir robots
- Database: Vercel Blob (dokumen JSON privat `yrb-farm/db.json`)

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi ADMIN_PASSWORD
npm run dev
```

Buka http://localhost:3000. Tanpa `BLOB_READ_WRITE_TOKEN`, data disimpan
sementara di `.data/db.json` (hanya mode development).

## Database otomatis

Produksi memakai satu dokumen JSON di Vercel Blob. Tidak ada spreadsheet,
tidak ada langkah penyiapan manual di Google.

1. Vercel → project → **Storage** → hubungkan Blob store (Private).
2. Hubungkan ke project untuk Production dan Preview. Vercel otomatis
   menambahkan `BLOB_READ_WRITE_TOKEN`.
3. Isi juga `ADMIN_PASSWORD` dan `SESSION_SECRET` (teks acak 40+ karakter) di
   **Settings → Environment Variables**.
4. **Deployments → Redeploy** agar variabel terbaca.

Berkas data dibuat sendiri saat ulasan/promo/konfigurasi pertama disimpan,
lalu bisa dilihat di Vercel → Storage → Blob → `yrb-farm/db.json`.

## Panel admin

Panel internal terbuka lewat alamat yang hanya dibagikan ke pengelola, lalu masukkan
`ADMIN_PASSWORD`. Di sana bisa:

- menerbitkan, menyembunyikan, mengedit, menambah, dan menghapus ulasan;
- menambah, mengedit, mengaktifkan, dan menghapus promo;
- mengubah nomor WhatsApp, telepon, email, alamat farm/kantor, dan pengumuman header.

Ulasan dari pengunjung masuk dengan status **Menunggu** dan tidak tampil sampai
diterbitkan admin.

## Keamanan

- Password admin hanya dicek di server; tidak pernah dikirim ke browser.
- Sesi memakai cookie HttpOnly bertanda tangan HMAC, berlaku 8 jam.
- Semua endpoint admin menolak permintaan tanpa sesi dan tanpa header `x-yrb-admin`.
- Login dibatasi 5 percobaan salah / 15 menit per IP, dihitung permanen di Blob
  (tahan lintas instance Vercel), pengiriman ulasan 4 / jam per IP.
- Token Blob hanya ada di environment server, tidak masuk bundle klien.
- Teks dari pengunjung dibersihkan dari karakter kontrol sebelum disimpan.
- `.env*`, `.data/`, `node_modules/`, dan hasil build diabaikan git.

## Struktur

```
app/(id)         halaman Indonesia
app/(en)/en      halaman Inggris
app/(admin)      panel admin
app/api          endpoint ulasan publik dan admin
components       header, hero, form ulasan, admin
lib              data store, sesi, validasi, i18n
```
