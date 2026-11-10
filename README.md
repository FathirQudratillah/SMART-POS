# Smart POS – Multi Company

Aplikasi Point of Sale (POS) berbasis web yang dirancang untuk mendukung pengelolaan beberapa perusahaan (multi-company), dengan fitur manajemen produk, kategori, inventory, purchasing, dan transaksi penjualan.

Project ini menggunakan Laravel sebagai Backend API dan React TypeScript sebagai Frontend.

## Tech Stack

### Backend
- Laravel
- PHP
- PostgreSQL
- Laravel Sanctum
- RESTful API

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Axios
- Lucide React

## Project Structure

Project ini menggunakan dua direktori terpisah untuk Backend dan Frontend.

```text
smart-pos/
├── pos-multicompany/       # Laravel Backend
└── pos-multicompany-fe/    # React Frontend
```

## Requirements

Pastikan perangkat sudah memiliki:

- PHP sesuai versi yang disyaratkan oleh `composer.json`
- Composer
- Node.js dan npm
- PostgreSQL
- Git

## Installation & Setup

### 1. Clone Repository

Clone repository Backend dan Frontend.

```bash
git clone https://github.com/FathirQudratillah/SMART-POS/pos-multicompany

git clone https://github.com/FathirQudratillah/SMART-POS/pos-multicompany-fe
```

Masuk ke direktori project.

```bash
cd pos-multicompany
```

### 2. Backend Setup (Laravel)

Install dependencies:

```bash
composer install
```

Buat file environment:

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

### 3. Database Configuration

Buat database PostgreSQL dengan nama:

```text
pos_multicompany
```

Sesuaikan konfigurasi database pada file `.env`.

```env
APP_NAME="Smart POS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pos_multicompany
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Pastikan konfigurasi koneksi database dan schema PostgreSQL lainnya sudah sesuai dengan konfigurasi project.

### 4. Run Database Migrations

Jalankan migration untuk membuat tabel database.

```bash
php artisan migrate
```

Jika project menyediakan migration atau command khusus untuk multi-schema, gunakan command yang sesuai dengan konfigurasi project.

### 5. Storage Setup

Buat symbolic link agar file yang tersimpan di public storage dapat diakses melalui browser.

```bash
php artisan storage:link
```

### 6. Run Laravel Server

Jalankan development server Laravel:

```bash
php artisan serve
```

Backend API akan berjalan di:

```text
http://127.0.0.1:8000
```

## Frontend Setup (React)

### 1. Install Dependencies

Buka terminal baru dan masuk ke direktori Frontend.

```bash
cd pos-multicompany-fe
```

Install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Buat file `.env` pada direktori Frontend.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Sesuaikan URL API dengan konfigurasi Backend.

### 3. Run Development Server

Jalankan React development server:

```bash
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:5173
```

## Running the Application

Pastikan Backend dan Frontend berjalan secara bersamaan.

| Application | Command | URL |
|---|---|---|
| Laravel Backend | `php artisan serve` | http://127.0.0.1:8000 |
| React Frontend | `npm run dev` | http://localhost:5173 |

## Available Features

- Multi-company Management
- Authentication & Authorization
- Role & Permission Management
- Branch Management
- Product Management
- Category Management
- Warehouse Management
- Inventory Management
- Stock Transfer
- Stock Adjustment
- Stock Opname
- Supplier Management
- Purchasing Management
- Point of Sale (POS)
- Sales Management

*Note: Feature availability may depend on the current development progress.*

## Development

Untuk menjalankan project selama proses development:

**Backend:**
```bash
cd pos-multicompany
php artisan serve
```

**Frontend:**
```bash
cd pos-multicompany-fe
npm run dev
```

## License

This project is developed for educational purposes and portfolio development.
