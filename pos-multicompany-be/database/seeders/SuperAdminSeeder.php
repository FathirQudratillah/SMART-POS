<?php

namespace Database\Seeders;

use App\Models\Core\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) config('admin.superadmin.email');
        $password = (string) config('admin.superadmin.password', '');

        if ($password === '') {
            throw new RuntimeException('Set SUPERADMIN_PASSWORD before running the seeder.');
        }

        $user = User::query()->withTrashed()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => (string) config('admin.superadmin.name'),
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'is_active' => true,
            'is_superadmin' => true,
            'deleted_at' => null,
        ])->save();
    }
}
