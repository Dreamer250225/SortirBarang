# 📦 Sistem Penyortiran & Tracking Barang

Aplikasi web sederhana untuk mengelola dan melacak barang kiriman menggunakan sistem barcode. Dibuat dengan HTML, CSS, JavaScript murni tanpa framework.

## Tentang Project Ini

Sistem ini dirancang untuk membantu proses penyortiran dan pelacakan barang dalam gudang atau sistem pengiriman. Setiap barang yang masuk akan diberikan kode barcode unik, kemudian bisa dilacak perjalanannya hingga sampai tujuan.

## Fitur Utama

- **Login System** - Sistem autentikasi sederhana sebelum mengakses aplikasi
- **Generate Barcode** - Membuat kode barcode unik otomatis untuk setiap barang
- **Input Data Barang** - Form untuk input informasi barang (nama, berat, tujuan, penerima)
- **Tracking Real-time** - Lacak posisi dan status barang dengan kode barcode
- **Peta Interaktif** - Visualisasi lokasi barang menggunakan Leaflet.js
- **Timeline Perjalanan** - Riwayat lengkap perjalanan barang dari gudang hingga tujuan
- **Update Status** - Update lokasi dan status barang (Di Gudang / Dalam Perjalanan / Terkirim)
- **Daftar Barang** - Melihat semua barang yang terdaftar dengan fitur pencarian

## Teknologi

- HTML5
- CSS3
- JavaScript (Vanilla)
- JsBarcode (untuk generate barcode)
- Leaflet.js (untuk peta interaktif)
- LocalStorage (penyimpanan data)

## Cara Menggunakan

1. Buka file HTML di browser
2. Login dengan username: `admin` dan password: `admin123`
3. Input barang baru dan generate barcode
4. Lacak barang menggunakan kode barcode
5. Update status dan lokasi barang saat dipindahkan

## Catatan

- Data tersimpan di localStorage browser (akan hilang jika cache dibersihkan)
- Aplikasi ini untuk keperluan demo/development
- Untuk production, disarankan menggunakan backend dan database proper

## 👨‍💻 Developer

Dibuat sebagai project pembelajaran sistem manajemen logistik sederhana.
