# Yahya Rizki Bersama Farm

Situs profil dan pemesanan domba untuk kurban, aqiqah, penggemukan, dan pembibitan.
Dibangun dengan Next.js 16, React 19, dan Three.js. Bahasa Indonesia & Inggris.

- Situs: `/` (ID) dan `/en` (EN)
- Panel admin: `/admin`
- Database: Google Sheets via Google Apps Script

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi ADMIN_PASSWORD
npm run dev
```

Buka http://localhost:3000. Tanpa `SHEET_API_URL`, data disimpan sementara di
`.data/db.json` (hanya mode development).

## Menghubungkan Google Sheets

1. Buka spreadsheet database → menu **Extensions** → **Apps Script**.
2. Hapus isi `Code.gs`, tempel seluruh isi `google-apps-script/Code.gs`, lalu **Save**.
3. **Project Settings** (ikon gerigi) → **Script Properties** → **Add script property**.
   - Property: `API_SECRET`
   - Value: teks acak panjang (contoh buat dengan 40+ karakter). Simpan.
4. **Deploy** → **New deployment** → pilih **Web app**.
   - Description: `YRB Farm API`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**, izinkan akses, lalu salin URL yang berakhiran `/exec`.
5. Di Vercel → project → **Settings** → **Environment Variables**, tambahkan:
   - `ADMIN_PASSWORD` = password panel admin (jangan disimpan di repo)
   - `SESSION_SECRET` = teks acak 40+ karakter untuk menandatangani sesi login
   - `SHEET_API_URL` = URL `/exec` tadi
   - `SHEET_API_TOKEN` = nilai `API_SECRET` tadi
   - Setiap kali `Code.gs` berubah: **Deploy → Manage deployments → Edit → New version → Deploy** (URL tetap sama).
6. **Deployments** → **Redeploy** agar variabel terbaca.

Tab `reviews`, `promos`, dan `settings` dibuat otomatis oleh Apps Script saat
pertama kali dipakai.

## Panel admin

Buka `/admin`, masukkan `ADMIN_PASSWORD`. Di sana bisa:

- menerbitkan, menyembunyikan, mengedit, menambah, dan menghapus ulasan;
- menambah, mengedit, mengaktifkan, dan menghapus promo;
- mengubah nomor WhatsApp, telepon, email, alamat farm/kantor, dan pengumuman header.

Ulasan dari pengunjung masuk dengan status **Menunggu** dan tidak tampil sampai
diterbitkan admin.

## Keamanan

- Password admin hanya dicek di server; tidak pernah dikirim ke browser.
- Sesi memakai cookie HttpOnly bertanda tangan HMAC, berlaku 8 jam.
- Semua endpoint admin menolak permintaan tanpa sesi dan tanpa header `x-yrb-admin`.
- Login dibatasi 5 percobaan salah / 15 menit per IP, dihitung permanen di Apps Script (tahan lintas instance Vercel), pengiriman ulasan 4 / jam per IP.
- Token Apps Script hanya ada di environment server, tidak masuk bundle klien.
- Nilai sel yang diawali `=`, `+`, `-`, `@` dinetralkan agar tidak jadi formula.
- `.env*`, `.data/`, `node_modules/`, dan hasil build diabaikan git.

## Struktur

```
app/(id)         halaman Indonesia
app/(en)/en      halaman Inggris
app/(admin)      panel admin
app/api          endpoint ulasan publik dan admin
components       header, hero 3D, form ulasan, admin
lib              data store, sesi, validasi, i18n
google-apps-script/Code.gs   API Google Sheets
```
