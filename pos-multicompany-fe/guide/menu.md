Untuk frontend POS Multi-Company kamu yang menggunakan React + TypeScript, saya sarankan menggunakan pendekatan Feature-Based Architecture. Jadi, folder dikelompokkan berdasarkan fitur bisnis, bukan berdasarkan jenis file saja.

Nama foldernya sebaiknya mengikuti kelompok menu dan modul POS yang sudah kita rancang sebelumnya.

## 1. Struktur folder FE yang disarankan

```

src/
├── app/
│   ├── router/
│   │   └── index.tsx
│   ├── providers/
│   └── layouts/
│       ├── AuthLayout.tsx
│       └── MainLayout.tsx
│
├── features/
│   ├── dashboard/
│   ├── company-management/
│   ├── access-control/
│   ├── master-data/
│   ├── point-of-sale/
│   ├── inventory/
│   ├── purchasing/
│   ├── finance/
│   ├── reports/
│   └── system-settings/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── services/
├── hooks/
├── lib/
├── types/
├── constants/
├── assets/
└── main.tsx

```

## 2. Fungsi setiap nama folder

| Folder               | Isi fitur                                            |
| -------------------- | ---------------------------------------------------- |
| `dashboard`          | Ringkasan penjualan, statistik, grafik               |
| `company-management` | Perusahaan, cabang, anggota perusahaan               |
| `access-control`     | Pengguna, role, permission                           |
| `master-data`        | Produk, kategori, satuan, harga, pelanggan, supplier |
| `point-of-sale`      | Kasir, checkout, pembayaran, retur                   |
| `inventory`          | Stok, gudang, mutasi, transfer stok                  |
| `purchasing`         | Pembelian, penerimaan barang                         |
| `finance`            | Kas masuk/keluar dan ringkasan keuangan              |
| `reports`            | Laporan penjualan, stok, pembelian                   |
| `system-settings`    | Pengaturan perusahaan, metode pembayaran, langganan  |

## 3. Isi di dalam setiap feature

Misalnya fitur produk:

```

features/
└── master-data/
    ├── products/
    │   ├── components/
    │   │   ├── ProductTable.tsx
    │   │   └── ProductForm.tsx
    │   ├── hooks/
    │   │   └── useProducts.ts
    │   ├── services/
    │   │   └── productService.ts
    │   ├── types/
    │   │   └── product.types.ts
    │   └── pages/
    │       ├── ProductListPage.tsx
    │       └── ProductCreatePage.tsx
    │
    ├── categories/
    └── units/

```

Dengan struktur tersebut, kode produk terkumpul di satu tempat. Ketika fitur produk berkembang, kamu tidak perlu mencari komponennya di folder global yang bercampur dengan fitur lain.

## 4. Apa bedanya `components/`, `services/`, dan `hooks/` global?

- `features/` — kode yang khusus digunakan oleh fitur tertentu.
- `components/ui/` — komponen dasar seperti Button, Input, Dialog, dan Select dari shadcn/ui.
- `components/shared/` — komponen yang dipakai lintas fitur, seperti DataTable atau PageHeader.
- `services/` — infrastruktur umum, misalnya konfigurasi Axios dan API client.
- `hooks/` — custom hook yang benar-benar digunakan lintas fitur.
- `types/` — tipe global, misalnya `ApiResponse<T>` dan tipe pagination.
- `lib/` — helper atau utilitas teknis.

Jangan memindahkan semua komponen, hook, dan service ke folder global jika sebenarnya hanya digunakan satu fitur.

## 5. Konvensi penamaan yang saya rekomendasikan

Gunakan nama folder `kebab-case` dan nama komponen React `PascalCase`.

Contohnya:

- Folder: `company-management/`
- File halaman: `CompanyListPage.tsx`
- File service: `companyService.ts`
- File tipe: `company.types.ts`
- Hook: `useCompanies.ts`

Rekomendasi saya: gunakan `features/` sebagai folder utama untuk modul bisnis, lalu gunakan nama `point-of-sale` untuk fitur kasir agar jelas bahwa itu modul transaksi POS, bukan seluruh aplikasi.

Satu hal penting: kelompok menu frontend tidak harus sama persis dengan schema PostgreSQL atau folder backend Laravel. Frontend dikelompokkan berdasarkan pengalaman pengguna, sedangkan backend dan database mengikuti tanggung jawab teknis serta domain bisnis.