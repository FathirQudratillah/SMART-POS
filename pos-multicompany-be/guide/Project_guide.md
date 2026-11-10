# Rancangan Database POS Multi-Company

Kita rancang database untuk POS retail multi-company menggunakan PostgreSQL + Laravel. Rancangan ini ditujukan untuk project yang dapat dikembangkan dari aplikasi kasir sederhana menjadi sistem bisnis multi-cabang.

Prinsip desainnya:

- Satu aplikasi dapat digunakan oleh banyak perusahaan.
- Setiap perusahaan bisa memiliki banyak cabang.
- Satu pengguna bisa memiliki akses ke beberapa perusahaan dan cabang.
- Produk, harga, dan stok dikelola sesuai kebutuhan perusahaan dan cabang.
- Penjualan, pembayaran, serta perubahan stok memiliki riwayat yang dapat ditelusuri.
- Data antarperusahaan tidak boleh saling terbaca atau dimodifikasi tanpa izin.

Saya membagi rancangan menjadi beberapa kelompok agar kamu bisa membuat migration secara berurutan, bukan membuat seluruh tabel tanpa memahami relasinya.

## 1. Gambaran seluruh kelompok tabel

| Kelompok              | Jumlah tabel | Fungsi                                          |
| --------------------- | ------------ | ----------------------------------------------- |
| Perusahaan & pengguna | 5            | Identitas perusahaan, cabang, akun, keanggotaan |
| Role & permission     | 4            | Pengaturan hak akses                            |
| Produk & gudang       | 5            | Katalog, harga, lokasi stok                     |
| Inventory             | 4            | Saldo stok, pergerakan, transfer                |
| Penjualan & kasir     | 9            | Shift, transaksi, pembayaran, retur             |
| Pembelian             | 5            | Supplier, pesanan, penerimaan barang            |
| Pendukung             | 3            | Audit log, pengaturan, langganan                |
| Total rancangan awal  | 35 tabel     | Tidak termasuk tabel bawaan tambahan Laravel    |

Jumlah tersebut adalah rancangan yang bisa dikembangkan, bukan berarti semua tabel wajib dibuat pada hari pertama. Kita akan memprioritaskan fondasi, kemudian menambahkan kelompok tabel ketika diperlukan.

## 2. Konvensi kolom database

Sebelum masuk ke setiap tabel, gunakan standar berikut.

| Konvensi                   | Penggunaan                                   |
| -------------------------- | -------------------------------------------- |
| `id`                       | Primary key, umumnya `BIGINT` auto-increment |
| `company_id`               | Foreign key ke perusahaan                    |
| `branch_id`                | Foreign key ke cabang                        |
| `created_at`, `updated_at` | Waktu pembuatan dan perubahan                |
| `deleted_at`               | Soft delete jika dibutuhkan                  |
| `status`                   | Status data atau proses                      |
| `*_id`                     | Foreign key ke tabel terkait                 |
| `quantity`                 | `NUMERIC`, bukan floating point              |
| `amount`, `price`          | `NUMERIC(18,2)` untuk nilai uang             |

Di Laravel, migration dapat menggunakan `$table->id()`, `$table->foreignId()`, `$table->timestamps()`, dan `$table->softDeletes()`.

Untuk tabel transaksi, hindari menghapus transaksi yang sudah selesai. Gunakan status pembatalan atau proses retur agar riwayat bisnis tetap terjaga.

## 3. Kelompok A — Perusahaan dan pengguna

Lima tabel pertama menjadi fondasi seluruh aplikasi.

### A1. `companies`

Menyimpan perusahaan yang menggunakan POS.

| Kolom           | Tipe PostgreSQL        | Keterangan                            |
| --------------- | ---------------------- | ------------------------------------- |
| `id`            | BIGINT                 | PK                                    |
| `code`          | VARCHAR(30)            | Kode unik perusahaan                  |
| `name`          | VARCHAR(150)           | Nama perusahaan                       |
| `legal_name`    | VARCHAR(200), nullable | Nama legal                            |
| `email`         | VARCHAR(150), nullable | Email perusahaan                      |
| `phone`         | VARCHAR(30), nullable  | Nomor telepon                         |
| `tax_number`    | VARCHAR(50), nullable  | Nomor identitas pajak jika diperlukan |
| `address`       | TEXT, nullable         | Alamat                                |
| `logo_path`     | VARCHAR(255), nullable | Lokasi file logo                      |
| `currency_code` | CHAR(3)                | Contoh `IDR`                          |
| `timezone`      | VARCHAR(50)            | Contoh `Asia/Jakarta`                 |
| `status`        | VARCHAR(20)            | `active`, `suspended`, `inactive`     |
| `created_at`    | TIMESTAMPTZ            | Waktu dibuat                          |
| `updated_at`    | TIMESTAMPTZ            | Waktu diubah                          |
| `deleted_at`    | TIMESTAMPTZ, nullable  | Soft delete                           |

Constraint: `code` harus unik. Jika perusahaan dinonaktifkan, sebaiknya data transaksi historis tetap tersedia.

### A2. `branches`

Menyimpan cabang atau outlet perusahaan.

| Kolom        | Tipe PostgreSQL        | Keterangan          |
| ------------ | ---------------------- | ------------------- |
| `id`         | BIGINT                 | PK                  |
| `company_id` | BIGINT                 | FK ke `companies`   |
| `code`       | VARCHAR(30)            | Kode cabang         |
| `name`       | VARCHAR(150)           | Nama cabang         |
| `phone`      | VARCHAR(30), nullable  | Telepon cabang      |
| `address`    | TEXT, nullable         | Alamat cabang       |
| `city`       | VARCHAR(100), nullable | Kota                |
| `is_main`    | BOOLEAN                | Apakah cabang utama |
| `status`     | VARCHAR(20)            | Status cabang       |
| `created_at` | TIMESTAMPTZ            | Waktu dibuat        |
| `updated_at` | TIMESTAMPTZ            | Waktu diubah        |
| `deleted_at` | TIMESTAMPTZ, nullable  | Soft delete         |

Constraint: kombinasi `company_id + code` harus unik. Cabang selalu dimiliki satu perusahaan.

### A3. `users`

Menyimpan akun login. Laravel sudah memiliki migration `users` bawaan, sehingga sesuaikan migration tersebut daripada membuat tabel duplikat.

| Kolom               | Tipe PostgreSQL        | Keterangan                  |
| ------------------- | ---------------------- | --------------------------- |
| `id`                | BIGINT                 | PK                          |
| `name`              | VARCHAR(150)           | Nama pengguna               |
| `email`             | VARCHAR(150)           | Email login, unik           |
| `email_verified_at` | TIMESTAMPTZ, nullable  | Verifikasi email            |
| `password`          | VARCHAR(255)           | Password yang sudah di-hash |
| `remember_token`    | VARCHAR(100), nullable | Token remember me           |
| `is_active`         | BOOLEAN                | Akun aktif atau tidak       |
| `created_at`        | TIMESTAMPTZ            | Waktu dibuat                |
| `updated_at`        | TIMESTAMPTZ            | Waktu diubah                |

Super Admin platform dapat diberi akses khusus melalui mekanisme otorisasi platform. Jangan menjadikan setiap pengguna sebagai administrator perusahaan secara otomatis.

### A4. `company_users`

Menghubungkan pengguna dengan perusahaan.

| Kolom        | Tipe PostgreSQL       | Keterangan         |
| ------------ | --------------------- | ------------------ |
| `id`         | BIGINT                | PK                 |
| `company_id` | BIGINT                | FK perusahaan      |
| `user_id`    | BIGINT                | FK pengguna        |
| `status`     | VARCHAR(20)           | Status keanggotaan |
| `joined_at`  | TIMESTAMPTZ, nullable | Waktu bergabung    |
| `created_at` | TIMESTAMPTZ           | Waktu dibuat       |
| `updated_at` | TIMESTAMPTZ           | Waktu diubah       |

Constraint: kombinasi `company_id + user_id` harus unik.

### A5. `branch_users`

Menghubungkan pengguna dengan cabang yang boleh diakses.

| Kolom        | Tipe PostgreSQL | Keterangan   |
| ------------ | --------------- | ------------ |
| `id`         | BIGINT          | PK           |
| `branch_id`  | BIGINT          | FK cabang    |
| `user_id`    | BIGINT          | FK pengguna  |
| `created_at` | TIMESTAMPTZ     | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ     | Waktu diubah |

Constraint: kombinasi `branch_id + user_id` harus unik. Server harus memverifikasi bahwa pengguna merupakan anggota perusahaan pemilik cabang tersebut.

## 4. Kelompok B — Role dan permission

Empat tabel untuk mengatur hak akses pengguna.

### B1. `roles`

| Kolom                      | Tipe             | Keterangan                                     |
| -------------------------- | ---------------- | ---------------------------------------------- |
| `id`                       | BIGINT           | PK                                             |
| `company_id`               | BIGINT, nullable | FK perusahaan; NULL untuk role platform bawaan |
| `name`                     | VARCHAR(80)      | Contoh Owner, Kasir                            |
| `code`                     | VARCHAR(80)      | Kode role                                      |
| `description`              | TEXT, nullable   | Penjelasan                                     |
| `created_at`, `updated_at` | TIMESTAMPTZ      | Timestamp                                      |

### B2. `permissions`

| Kolom                      | Tipe           | Keterangan              |
| -------------------------- | -------------- | ----------------------- |
| `id`                       | BIGINT         | PK                      |
| `code`                     | VARCHAR(100)   | Contoh `sales.create`   |
| `name`                     | VARCHAR(120)   | Nama permission         |
| `module`                   | VARCHAR(60)    | Contoh sales, inventory |
| `description`              | TEXT, nullable | Penjelasan              |
| `created_at`, `updated_at` | TIMESTAMPTZ    | Timestamp               |

`code` harus unik secara global.

### B3. `role_permissions`

| Kolom           | Tipe        | Keterangan      |
| --------------- | ----------- | --------------- |
| `role_id`       | BIGINT      | FK role         |
| `permission_id` | BIGINT      | FK permission   |
| `created_at`    | TIMESTAMPTZ | Waktu pemberian |

Gunakan primary key gabungan `role_id + permission_id`.

### B4. `user_roles`

| Kolom                      | Tipe        | Keterangan    |
| -------------------------- | ----------- | ------------- |
| `id`                       | BIGINT      | PK            |
| `company_id`               | BIGINT      | FK perusahaan |
| `user_id`                  | BIGINT      | FK pengguna   |
| `role_id`                  | BIGINT      | FK role       |
| `created_at`, `updated_at` | TIMESTAMPTZ | Timestamp     |

Tabel ini memberikan role kepada pengguna dalam konteks perusahaan. Untuk role khusus cabang, validasi pula keanggotaan cabangnya. Relasi role dan keanggotaan harus konsisten dengan perusahaan yang sama.

## 5. Kelompok C — Produk, harga, dan gudang

### C1. `categories`

| Kolom                      | Tipe             | Keterangan        |
| -------------------------- | ---------------- | ----------------- |
| `id`                       | BIGINT           | PK                |
| `company_id`               | BIGINT           | FK perusahaan     |
| `parent_id`                | BIGINT, nullable | FK kategori induk |
| `name`                     | VARCHAR(120)     | Nama kategori     |
| `description`              | TEXT, nullable   | Deskripsi         |
| `is_active`                | BOOLEAN          | Status aktif      |
| `created_at`, `updated_at` | TIMESTAMPTZ      | Timestamp         |

Constraint: `company_id + name` unik. `parent_id` memungkinkan kategori bertingkat.

### C2. `products`

| Kolom                      | Tipe                   | Keterangan                 |
| -------------------------- | ---------------------- | -------------------------- |
| `id`                       | BIGINT                 | PK                         |
| `company_id`               | BIGINT                 | FK perusahaan              |
| `category_id`              | BIGINT, nullable       | FK kategori                |
| `sku`                      | VARCHAR(80)            | Kode produk                |
| `barcode`                  | VARCHAR(100), nullable | Barcode                    |
| `name`                     | VARCHAR(200)           | Nama produk                |
| `description`              | TEXT, nullable         | Deskripsi                  |
| `unit_name`                | VARCHAR(30)            | Satuan dasar, misalnya pcs |
| `cost_price`               | NUMERIC(18,2)          | Referensi harga pokok      |
| `track_stock`              | BOOLEAN                | Apakah stok dilacak        |
| `is_active`                | BOOLEAN                | Status aktif               |
| `created_at`, `updated_at` | TIMESTAMPTZ            | Timestamp                  |
| `deleted_at`               | TIMESTAMPTZ, nullable  | Soft delete                |

Constraint: `company_id + sku` unik. Barcode dapat dibuat unik per perusahaan jika aturan bisnis mengharuskannya. `cost_price` adalah referensi, bukan pengganti perhitungan HPP transaksi historis.

### C3. `product_prices`

Menyimpan harga jual yang dapat berbeda antar cabang.

| Kolom                      | Tipe                  | Keterangan    |
| -------------------------- | --------------------- | ------------- |
| `id`                       | BIGINT                | PK            |
| `product_id`               | BIGINT                | FK produk     |
| `branch_id`                | BIGINT                | FK cabang     |
| `selling_price`            | NUMERIC(18,2)         | Harga jual    |
| `effective_from`           | TIMESTAMPTZ           | Awal berlaku  |
| `effective_until`          | TIMESTAMPTZ, nullable | Akhir berlaku |
| `created_at`, `updated_at` | TIMESTAMPTZ           | Timestamp     |

Relasi harus menjamin bahwa produk dan cabang berasal dari perusahaan yang sama. Jika belum membutuhkan riwayat harga, kita bisa mulai dengan satu harga aktif per produk dan cabang.

### C4. `warehouses`

| Kolom                      | Tipe             | Keterangan              |
| -------------------------- | ---------------- | ----------------------- |
| `id`                       | BIGINT           | PK                      |
| `company_id`               | BIGINT           | FK perusahaan           |
| `branch_id`                | BIGINT, nullable | FK cabang               |
| `code`                     | VARCHAR(40)      | Kode gudang             |
| `name`                     | VARCHAR(150)     | Nama gudang             |
| `type`                     | VARCHAR(30)      | Misalnya store, central |
| `is_active`                | BOOLEAN          | Status aktif            |
| `created_at`, `updated_at` | TIMESTAMPTZ      | Timestamp               |

Gudang pusat boleh tidak terikat langsung ke satu cabang. Namun, tetap harus memiliki `company_id`.

### C5. `product_units` (opsional untuk MVP)

Jika produk dijual dalam satuan berbeda, gunakan tabel ini.

| Kolom                      | Tipe                   | Keterangan               |
| -------------------------- | ---------------------- | ------------------------ |
| `id`                       | BIGINT                 | PK                       |
| `product_id`               | BIGINT                 | FK produk                |
| `unit_name`                | VARCHAR(30)            | Dus, box, pcs            |
| `conversion_factor`        | NUMERIC(18,6)          | Konversi ke satuan dasar |
| `barcode`                  | VARCHAR(100), nullable | Barcode satuan           |
| `created_at`, `updated_at` | TIMESTAMPTZ            | Timestamp                |

Contoh: satu dus berisi 12 pcs, sehingga faktor konversinya 12. Jika fitur ini belum dibutuhkan, `unit_name` di tabel produk sudah cukup.

## 6. Kelompok D — Inventory dan transfer stok

### D1. `inventory_stocks`

Menyimpan saldo stok terkini per gudang dan produk.

| Kolom          | Tipe          | Keterangan          |
| -------------- | ------------- | ------------------- |
| `id`           | BIGINT        | PK                  |
| `warehouse_id` | BIGINT        | FK gudang           |
| `product_id`   | BIGINT        | FK produk           |
| `quantity`     | NUMERIC(18,3) | Stok tersedia       |
| `updated_at`   | TIMESTAMPTZ   | Terakhir diperbarui |

Constraint: kombinasi `warehouse_id + product_id` harus unik. Gunakan default `0` dan constraint agar stok tidak negatif, kecuali kebijakan bisnis secara eksplisit mengizinkannya.

### D2. `stock_movements`

Catatan setiap perubahan persediaan.

| Kolom            | Tipe             | Keterangan                              |
| ---------------- | ---------------- | --------------------------------------- |
| `id`             | BIGINT           | PK                                      |
| `company_id`     | BIGINT           | FK perusahaan                           |
| `warehouse_id`   | BIGINT           | FK gudang                               |
| `product_id`     | BIGINT           | FK produk                               |
| `movement_type`  | VARCHAR(30)      | IN, OUT, ADJUSTMENT                     |
| `quantity_delta` | NUMERIC(18,3)    | Perubahan stok bertanda positif/negatif |
| `reference_type` | VARCHAR(50)      | Jenis dokumen sumber                    |
| `reference_id`   | BIGINT, nullable | ID dokumen sumber                       |
| `notes`          | TEXT, nullable   | Alasan                                  |
| `created_by`     | BIGINT           | FK pengguna                             |
| `created_at`     | TIMESTAMPTZ      | Waktu pergerakan                        |

Riwayat pergerakan yang sudah diposting sebaiknya tidak diedit sembarangan. Koreksi dilakukan melalui pergerakan pembalik atau penyesuaian baru.

### D3. `stock_transfers`

Header transfer stok antar gudang.

| Kolom                      | Tipe                  | Keterangan                                    |
| -------------------------- | --------------------- | --------------------------------------------- |
| `id`                       | BIGINT                | PK                                            |
| `company_id`               | BIGINT                | FK perusahaan                                 |
| `transfer_no`              | VARCHAR(50)           | Nomor transfer                                |
| `source_warehouse_id`      | BIGINT                | Gudang asal                                   |
| `target_warehouse_id`      | BIGINT                | Gudang tujuan                                 |
| `status`                   | VARCHAR(20)           | draft, approved, shipped, received, cancelled |
| `notes`                    | TEXT, nullable        | Catatan                                       |
| `created_by`               | BIGINT                | FK pengguna                                   |
| `approved_by`              | BIGINT, nullable      | FK pengguna                                   |
| `shipped_at`               | TIMESTAMPTZ, nullable | Waktu dikirim                                 |
| `received_at`              | TIMESTAMPTZ, nullable | Waktu diterima                                |
| `created_at`, `updated_at` | TIMESTAMPTZ           | Timestamp                                     |

Constraint: gudang asal dan tujuan tidak boleh sama.

### D4. `stock_transfer_items`

| Kolom                      | Tipe          | Keterangan      |
| -------------------------- | ------------- | --------------- |
| `id`                       | BIGINT        | PK              |
| `transfer_id`              | BIGINT        | FK transfer     |
| `product_id`               | BIGINT        | FK produk       |
| `quantity`                 | NUMERIC(18,3) | Jumlah dikirim  |
| `received_quantity`        | NUMERIC(18,3) | Jumlah diterima |
| `created_at`, `updated_at` | TIMESTAMPTZ   | Timestamp       |

Ketika transfer diproses, pergerakan stok harus tercatat pada gudang asal dan tujuan sesuai tahap pengiriman serta penerimaan.

## 7. Kelompok E — Kasir, penjualan, pembayaran, dan retur

Inilah kelompok tabel yang menjalankan proses utama POS.

### E1. `cashier_shifts`

| Kolom                      | Tipe                    | Keterangan          |
| -------------------------- | ----------------------- | ------------------- |
| `id`                       | BIGINT                  | PK                  |
| `company_id`               | BIGINT                  | FK perusahaan       |
| `branch_id`                | BIGINT                  | FK cabang           |
| `user_id`                  | BIGINT                  | FK kasir            |
| `shift_no`                 | VARCHAR(50)             | Nomor shift         |
| `opening_cash`             | NUMERIC(18,2)           | Saldo kas awal      |
| `expected_cash`            | NUMERIC(18,2), nullable | Kas yang diharapkan |
| `closing_cash`             | NUMERIC(18,2), nullable | Kas aktual          |
| `opened_at`                | TIMESTAMPTZ             | Waktu buka          |
| `closed_at`                | TIMESTAMPTZ, nullable   | Waktu tutup         |
| `status`                   | VARCHAR(20)             | open, closed        |
| `notes`                    | TEXT, nullable          | Catatan selisih     |
| `created_at`, `updated_at` | TIMESTAMPTZ             | Timestamp           |

### E2. `customers`

| Kolom                      | Tipe                   | Keterangan     |
| -------------------------- | ---------------------- | -------------- |
| `id`                       | BIGINT                 | PK             |
| `company_id`               | BIGINT                 | FK perusahaan  |
| `customer_code`            | VARCHAR(50)            | Kode pelanggan |
| `name`                     | VARCHAR(150)           | Nama pelanggan |
| `phone`                    | VARCHAR(30), nullable  | Nomor telepon  |
| `email`                    | VARCHAR(150), nullable | Email          |
| `address`                  | TEXT, nullable         | Alamat         |
| `is_active`                | BOOLEAN                | Status aktif   |
| `created_at`, `updated_at` | TIMESTAMPTZ            | Timestamp      |

Pelanggan bisa dibuat opsional pada transaksi kasir biasa.

### E3. `sales`

Menyimpan header atau ringkasan penjualan.

| Kolom                      | Tipe             | Keterangan                 |
| -------------------------- | ---------------- | -------------------------- |
| `id`                       | BIGINT           | PK                         |
| `company_id`               | BIGINT           | FK perusahaan              |
| `branch_id`                | BIGINT           | FK cabang                  |
| `shift_id`                 | BIGINT           | FK shift kasir             |
| `customer_id`              | BIGINT, nullable | FK pelanggan               |
| `invoice_no`               | VARCHAR(50)      | Nomor invoice              |
| `cashier_id`               | BIGINT           | FK pengguna/kasir          |
| `subtotal`                 | NUMERIC(18,2)    | Total sebelum diskon/pajak |
| `discount_amount`          | NUMERIC(18,2)    | Total diskon               |
| `tax_amount`               | NUMERIC(18,2)    | Total pajak                |
| `total_amount`             | NUMERIC(18,2)    | Total akhir                |
| `paid_amount`              | NUMERIC(18,2)    | Total pembayaran berhasil  |
| `change_amount`            | NUMERIC(18,2)    | Kembalian                  |
| `status`                   | VARCHAR(20)      | draft, completed, voided   |
| `notes`                    | TEXT, nullable   | Catatan                    |
| `sold_at`                  | TIMESTAMPTZ      | Waktu transaksi            |
| `created_at`, `updated_at` | TIMESTAMPTZ      | Timestamp                  |

Constraint: `company_id + invoice_no` unik. Simpan juga identitas cabang dan waktu transaksi untuk kebutuhan laporan historis.

### E4. `sale_items`

Menyimpan setiap barang dalam transaksi.

| Kolom                      | Tipe                    | Keterangan                         |
| -------------------------- | ----------------------- | ---------------------------------- |
| `id`                       | BIGINT                  | PK                                 |
| `sale_id`                  | BIGINT                  | FK penjualan                       |
| `product_id`               | BIGINT                  | FK produk                          |
| `product_name`             | VARCHAR(200)            | Snapshot nama produk               |
| `sku`                      | VARCHAR(80)             | Snapshot SKU                       |
| `quantity`                 | NUMERIC(18,3)           | Kuantitas                          |
| `unit_price`               | NUMERIC(18,2)           | Harga jual saat transaksi          |
| `discount_amount`          | NUMERIC(18,2)           | Diskon item                        |
| `tax_amount`               | NUMERIC(18,2)           | Pajak item                         |
| `line_total`               | NUMERIC(18,2)           | Total item                         |
| `unit_cost`                | NUMERIC(18,2), nullable | Snapshot HPP jika sudah ditentukan |
| `created_at`, `updated_at` | TIMESTAMPTZ             | Timestamp                          |

Snapshot diperlukan agar struk dan laporan lama tidak berubah ketika nama atau harga produk diperbarui.

### E5. `payment_methods`

| Kolom                      | Tipe         | Keterangan             |
| -------------------------- | ------------ | ---------------------- |
| `id`                       | BIGINT       | PK                     |
| `company_id`               | BIGINT       | FK perusahaan          |
| `code`                     | VARCHAR(40)  | CASH, QRIS, CARD       |
| `name`                     | VARCHAR(100) | Nama metode pembayaran |
| `is_active`                | BOOLEAN      | Status aktif           |
| `created_at`, `updated_at` | TIMESTAMPTZ  | Timestamp              |

Metode pembayaran harus dikonfigurasi dan divalidasi untuk perusahaan yang sedang aktif.

### E6. `payments`

Menyimpan pembayaran aktual untuk suatu transaksi. Satu penjualan dapat memiliki beberapa pembayaran.

| Kolom                      | Tipe                   | Keterangan                           |
| -------------------------- | ---------------------- | ------------------------------------ |
| `id`                       | BIGINT                 | PK                                   |
| `sale_id`                  | BIGINT                 | FK penjualan                         |
| `payment_method_id`        | BIGINT                 | FK metode pembayaran                 |
| `amount`                   | NUMERIC(18,2)          | Jumlah pembayaran                    |
| `status`                   | VARCHAR(20)            | pending, succeeded, failed, refunded |
| `reference_no`             | VARCHAR(100), nullable | Referensi penyedia pembayaran        |
| `paid_at`                  | TIMESTAMPTZ, nullable  | Waktu berhasil dibayar               |
| `created_at`, `updated_at` | TIMESTAMPTZ            | Timestamp                            |

Jangan menganggap pembayaran berhasil hanya karena pengguna menekan tombol bayar. Untuk QRIS atau kartu, status harus diverifikasi dengan penyedia pembayaran.

### E7. `sale_returns`

Menyimpan header retur penjualan.

| Kolom                      | Tipe                  | Keterangan                           |
| -------------------------- | --------------------- | ------------------------------------ |
| `id`                       | BIGINT                | PK                                   |
| `company_id`               | BIGINT                | FK perusahaan                        |
| `branch_id`                | BIGINT                | FK cabang                            |
| `sale_id`                  | BIGINT                | FK penjualan asal                    |
| `return_no`                | VARCHAR(50)           | Nomor retur                          |
| `reason`                   | TEXT                  | Alasan retur                         |
| `refund_amount`            | NUMERIC(18,2)         | Nilai pengembalian                   |
| `status`                   | VARCHAR(20)           | draft, approved, completed, rejected |
| `processed_by`             | BIGINT                | FK pengguna                          |
| `returned_at`              | TIMESTAMPTZ, nullable | Waktu retur                          |
| `created_at`, `updated_at` | TIMESTAMPTZ           | Timestamp                            |

### E8. `sale_return_items`

| Kolom                      | Tipe          | Keterangan                    |
| -------------------------- | ------------- | ----------------------------- |
| `id`                       | BIGINT        | PK                            |
| `sale_return_id`           | BIGINT        | FK retur                      |
| `sale_item_id`             | BIGINT        | FK item penjualan             |
| `quantity`                 | NUMERIC(18,3) | Kuantitas diretur             |
| `unit_refund`              | NUMERIC(18,2) | Nilai refund per satuan       |
| `line_refund`              | NUMERIC(18,2) | Total refund item             |
| `restock`                  | BOOLEAN       | Apakah barang kembali ke stok |
| `created_at`, `updated_at` | TIMESTAMPTZ   | Timestamp                     |

Sistem harus mencegah jumlah retur melebihi kuantitas yang benar-benar dijual dikurangi retur sebelumnya.

### E9. `cash_movements`

Mencatat uang masuk dan keluar dari kasir selain arus penjualan biasa.

| Kolom           | Tipe          | Keterangan        |
| --------------- | ------------- | ----------------- |
| `id`            | BIGINT        | PK                |
| `company_id`    | BIGINT        | FK perusahaan     |
| `branch_id`     | BIGINT        | FK cabang         |
| `shift_id`      | BIGINT        | FK shift          |
| `movement_type` | VARCHAR(20)   | cash_in, cash_out |
| `amount`        | NUMERIC(18,2) | Jumlah            |
| `description`   | TEXT          | Keterangan        |
| `created_by`    | BIGINT        | FK pengguna       |
| `created_at`    | TIMESTAMPTZ   | Waktu pencatatan  |

Contoh: uang kecil ditambahkan ke laci kasir atau biaya operasional dibayar menggunakan kas laci. Penjualan tunai tetap dicatat melalui `payments`, bukan diduplikasi sebagai pemasukan manual.

## 8. Kelompok F — Pembelian dari supplier

Kelompok ini berguna ketika POS sudah dikembangkan menjadi sistem pengelolaan stok yang lebih lengkap.

### F1. `suppliers`

| Kolom                      | Tipe                   | Keterangan    |
| -------------------------- | ---------------------- | ------------- |
| `id`                       | BIGINT                 | PK            |
| `company_id`               | BIGINT                 | FK perusahaan |
| `supplier_code`            | VARCHAR(50)            | Kode supplier |
| `name`                     | VARCHAR(150)           | Nama supplier |
| `phone`                    | VARCHAR(30), nullable  | Telepon       |
| `email`                    | VARCHAR(150), nullable | Email         |
| `address`                  | TEXT, nullable         | Alamat        |
| `is_active`                | BOOLEAN                | Status aktif  |
| `created_at`, `updated_at` | TIMESTAMPTZ            | Timestamp     |

### F2. `purchases`

Header pembelian barang.

| Kolom                      | Tipe                  | Keterangan                          |
| -------------------------- | --------------------- | ----------------------------------- |
| `id`                       | BIGINT                | PK                                  |
| `company_id`               | BIGINT                | FK perusahaan                       |
| `branch_id`                | BIGINT                | Cabang pemesan                      |
| `warehouse_id`             | BIGINT                | Gudang penerima                     |
| `supplier_id`              | BIGINT                | FK supplier                         |
| `purchase_no`              | VARCHAR(50)           | Nomor pembelian                     |
| `subtotal`                 | NUMERIC(18,2)         | Subtotal                            |
| `tax_amount`               | NUMERIC(18,2)         | Pajak                               |
| `total_amount`             | NUMERIC(18,2)         | Total                               |
| `status`                   | VARCHAR(20)           | draft, ordered, received, cancelled |
| `ordered_at`               | TIMESTAMPTZ, nullable | Waktu pemesanan                     |
| `created_by`               | BIGINT                | FK pengguna                         |
| `created_at`, `updated_at` | TIMESTAMPTZ           | Timestamp                           |

### F3. `purchase_items`

| Kolom                      | Tipe          | Keterangan        |
| -------------------------- | ------------- | ----------------- |
| `id`                       | BIGINT        | PK                |
| `purchase_id`              | BIGINT        | FK pembelian      |
| `product_id`               | BIGINT        | FK produk         |
| `quantity`                 | NUMERIC(18,3) | Jumlah dipesan    |
| `received_quantity`        | NUMERIC(18,3) | Jumlah diterima   |
| `unit_cost`                | NUMERIC(18,2) | Harga beli satuan |
| `line_total`               | NUMERIC(18,2) | Total item        |
| `created_at`, `updated_at` | TIMESTAMPTZ   | Timestamp         |

### F4. `goods_receipts`

Mencatat penerimaan barang dari supplier.

| Kolom                      | Tipe                  | Keterangan               |
| -------------------------- | --------------------- | ------------------------ |
| `id`                       | BIGINT                | PK                       |
| `company_id`               | BIGINT                | FK perusahaan            |
| `purchase_id`              | BIGINT                | FK pembelian             |
| `receipt_no`               | VARCHAR(50)           | Nomor penerimaan         |
| `status`                   | VARCHAR(20)           | draft, posted, cancelled |
| `received_by`              | BIGINT                | FK pengguna              |
| `received_at`              | TIMESTAMPTZ, nullable | Waktu penerimaan         |
| `notes`                    | TEXT, nullable        | Catatan                  |
| `created_at`, `updated_at` | TIMESTAMPTZ           | Timestamp                |

### F5. `goods_receipt_items`

| Kolom                      | Tipe          | Keterangan        |
| -------------------------- | ------------- | ----------------- |
| `id`                       | BIGINT        | PK                |
| `goods_receipt_id`         | BIGINT        | FK penerimaan     |
| `purchase_item_id`         | BIGINT        | FK item pembelian |
| `product_id`               | BIGINT        | FK produk         |
| `quantity_received`        | NUMERIC(18,3) | Jumlah diterima   |
| `created_at`, `updated_at` | TIMESTAMPTZ   | Timestamp         |

Ketika penerimaan barang di-posting, sistem mencatat pergerakan stok dan memperbarui saldo dalam satu transaksi database. Penerimaan parsial harus didukung jika supplier mengirim barang secara bertahap.

## 9. Kelompok G — Audit, pengaturan, dan langganan

### G1. `audit_logs`

Mencatat aktivitas penting untuk keamanan dan penelusuran masalah.

| Kolom         | Tipe             | Keterangan             |
| ------------- | ---------------- | ---------------------- |
| `id`          | BIGINT           | PK                     |
| `company_id`  | BIGINT, nullable | FK perusahaan          |
| `user_id`     | BIGINT, nullable | FK pengguna            |
| `action`      | VARCHAR(100)     | Contoh `sales.void`    |
| `entity_type` | VARCHAR(100)     | Jenis objek            |
| `entity_id`   | BIGINT, nullable | ID objek               |
| `old_values`  | JSONB, nullable  | Data sebelum perubahan |
| `new_values`  | JSONB, nullable  | Data sesudah perubahan |
| `ip_address`  | INET, nullable   | IP pengguna            |
| `created_at`  | TIMESTAMPTZ      | Waktu aktivitas        |

Jangan menyimpan password, token autentikasi, atau rahasia lain ke dalam log.

### G2. `company_settings`

Menyimpan konfigurasi bisnis per perusahaan.

| Kolom                      | Tipe         | Keterangan              |
| -------------------------- | ------------ | ----------------------- |
| `id`                       | BIGINT       | PK                      |
| `company_id`               | BIGINT       | FK perusahaan           |
| `setting_key`              | VARCHAR(100) | Contoh `receipt_footer` |
| `setting_value`            | JSONB        | Nilai konfigurasi       |
| `created_at`, `updated_at` | TIMESTAMPTZ  | Timestamp               |

Constraint: `company_id + setting_key` harus unik.

Contoh konfigurasi adalah format struk, pengaturan pajak, dan kebijakan stok negatif. Pengaturan yang berpengaruh pada perhitungan transaksi harus memiliki validasi dan jejak perubahan.

### G3. `subscription_plans`

Mendefinisikan paket berlangganan platform.

| Kolom                      | Tipe          | Keterangan      |
| -------------------------- | ------------- | --------------- |
| `id`                       | BIGINT        | PK              |
| `code`                     | VARCHAR(40)   | Kode paket      |
| `name`                     | VARCHAR(100)  | Nama paket      |
| `price`                    | NUMERIC(18,2) | Harga paket     |
| `billing_period`           | VARCHAR(20)   | monthly, yearly |
| `max_branches`             | INTEGER       | Batas cabang    |
| `max_users`                | INTEGER       | Batas pengguna  |
| `features`                 | JSONB         | Fitur paket     |
| `is_active`                | BOOLEAN       | Status paket    |
| `created_at`, `updated_at` | TIMESTAMPTZ   | Timestamp       |

### G4. `company_subscriptions`

Menghubungkan perusahaan dengan paket yang digunakan.

| Kolom                      | Tipe                  | Keterangan                         |
| -------------------------- | --------------------- | ---------------------------------- |
| `id`                       | BIGINT                | PK                                 |
| `company_id`               | BIGINT                | FK perusahaan                      |
| `subscription_plan_id`     | BIGINT                | FK paket                           |
| `status`                   | VARCHAR(20)           | trial, active, past_due, cancelled |
| `starts_at`                | TIMESTAMPTZ           | Awal langganan                     |
| `ends_at`                  | TIMESTAMPTZ, nullable | Akhir langganan                    |
| `trial_ends_at`            | TIMESTAMPTZ, nullable | Akhir masa percobaan               |
| `created_at`, `updated_at` | TIMESTAMPTZ           | Timestamp                          |

Tabel pembayaran langganan belum dimasukkan. Jika nantinya ingin menerima pembayaran SaaS secara langsung, kita bisa menambahkan `subscription_invoices` dan `subscription_payments`.

## 10. Relasi utama antartabel

Berikut ringkasan hubungan yang paling penting untuk dipahami sebelum mulai menulis migration.

## Perusahaan dan akses

Perusahaan memiliki cabang. Pengguna dapat menjadi anggota beberapa perusahaan dan ditugaskan ke cabang tertentu.

```

companies
 ├── branches
 ├── company_users ── users
 ├── company_settings
 ├── products
 └── company_subscriptions
       └── subscription_plans
  
```

## Produk dan stok

```

categories ── products ── product_prices
                   │
                   ├── inventory_stocks ── warehouses
                   └── stock_movements

stock_transfers ── stock_transfer_items
  
```

## Penjualan dan pembayaran

```

cashier_shifts
      │
      └── sales ── sale_items
            │
            ├── payments ── payment_methods
            └── sale_returns ── sale_return_items
  
```

## 11. Aturan database yang wajib diterapkan

Sebelum menulis migration, ada beberapa keputusan teknis yang harus dipertahankan:

1. Foreign key dan integritas perusahaan. Jangan hanya memastikan `product_id` valid. Pastikan produk, gudang, cabang, dan transaksi yang dihubungkan memang berasal dari perusahaan yang sama. Ini bisa diperkuat dengan foreign key gabungan dan constraint database.
2. Transaksi atomik. Checkout, pembayaran, dan pengurangan stok perlu dikerjakan dalam transaksi database agar tidak ada penjualan yang berhasil tetapi stok gagal diperbarui.
3. Pencegahan transaksi ganda. Gunakan nomor invoice unik dan mekanisme idempotensi untuk permintaan checkout yang dikirim berulang.
4. Indeks. Tambahkan indeks pada kolom pencarian dan filter seperti `company_id`, `branch_id`, `sold_at`, `invoice_no`, dan foreign key yang sering digunakan.
5. Data historis. Simpan snapshot nama barang, harga, pajak, dan HPP yang relevan pada transaksi. Data transaksi yang selesai tidak boleh berubah hanya karena master data diperbarui.
6. Soft delete secara selektif. Gunakan untuk master data bila dibutuhkan, tetapi jangan menjadikan soft delete sebagai cara menghapus jejak transaksi.

## 12. Tabel mana yang dibuat terlebih dahulu?

Walaupun rancangan keseluruhan di atas mencakup banyak tabel, kita tidak akan membuat 36 tabel sekaligus.

Saya sarankan urutan implementasi migration seperti ini:

| Urutan | Tabel                                                    | Target                                |
| ------ | -------------------------------------------------------- | ------------------------------------- |
| 1      | `companies`                                              | Menyimpan perusahaan                  |
| 2      | `branches`                                               | Menyimpan cabang milik perusahaan     |
| 3      | `users`                                                  | Menyediakan akun login                |
| 4      | `company_users`                                          | Menghubungkan pengguna dan perusahaan |
| 5      | `branch_users`                                           | Mengatur akses cabang                 |
| 6      | `roles`, `permissions`, `role_permissions`, `user_roles` | Mengatur hak akses                    |
| 7      | `categories`, `products`, `product_prices`               | Mengelola barang dan harga            |
| 8      | `warehouses`, `inventory_stocks`, `stock_movements`      | Mengelola stok                        |
| 9      | `cashier_shifts`, `sales`, `sale_items`, `payments`      | Menjalankan POS                       |
| 10     | Tabel retur, transfer, pembelian, dan laporan pendukung  | Memperluas operasional                |

Langkah berikutnya yang paling tepat: kita implementasikan migration `companies` dan `branches` terlebih dahulu, lengkap dengan tipe data Laravel, primary key, foreign key, unique constraint, dan indeks. Setelah berhasil dijalankan di PostgreSQL, kita periksa hasilnya sebelum melanjutkan ke tabel pengguna.