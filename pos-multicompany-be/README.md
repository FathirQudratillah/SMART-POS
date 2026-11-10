<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Database POS Multi-Company

Database POS menggunakan satu database PostgreSQL dengan schema `core`, `access`,
`catalog`, `inventory`, `sales`, `purchasing`, `finance`, `audit`, dan `settings`.
Pastikan koneksi `DB_CONNECTION=pgsql` dan user database memiliki izin membuat schema,
tabel, index, serta foreign key sebelum menjalankan:

```bash
php artisan migrate
```

Migration memindahkan tabel Laravel `users` dari `public` ke `core` dan menambahkan
kolom POS. Jika database pernah memakai migration POS versi sebelumnya, tinjau tabel
dan backup terlebih dahulu; jangan menjalankan `migrate:fresh` pada database berisi
data karena perintah itu menghapus seluruh tabel.

Model dan controller dikelompokkan per modul di `app/Models/{Module}` dan
`app/Http/Controllers/Api/{Module}` (`Core`, `Access`, `Catalog`, `Inventory`,
`Sales`, `Purchasing`, `Finance`, `Audit`, dan `Settings`). Endpoint JSON berada di
`/api/v1` dan dilindungi middleware `auth`; pengguna harus memiliki keanggotaan aktif
pada perusahaan terkait. API CRUD umum tidak menyediakan penghapusan transaksi.
Penjualan dan pembelian dibuat sebagai draft. Penerimaan barang diposting melalui
`POST /api/v1/companies/{company}/goods-receipts/{receipt}/post`, yang memperbarui
saldo stok dan riwayat pergerakan dalam satu transaksi database.

Factory tersedia di `database/factories/{Module}` untuk setiap model POS. Jalankan
`php artisan db:seed` pada lingkungan non-produksi untuk membuat data demo yang dapat
dipakai ulang. Akun demo: `admin@pos.test` dengan password `password`. Seeder POS demo
dilewati di lingkungan `production`; jangan gunakan kredensial demo di sistem nyata.
Seeder superadmin tetap berjalan di semua lingkungan dan membutuhkan kata sandi yang
diatur melalui `SUPERADMIN_PASSWORD`.

### Akun Superadmin

Superadmin dikelola terpisah dari akses perusahaan dan hanya dapat melihat dashboard,
daftar/detail pengguna, serta menghapus pengguna (soft delete). Siapkan kredensial
sebelum menjalankan seeder:

```env
SUPERADMIN_NAME="Super Admin"
SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=<kata-sandi-kuat>
```

Jalankan `php artisan migrate` lalu `php artisan db:seed`. `SuperAdminSeeder` tetap
dijalankan di production; `SUPERADMIN_PASSWORD` wajib diisi dan disimpan dengan aman.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
