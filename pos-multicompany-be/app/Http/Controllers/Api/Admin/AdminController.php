<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Audit\AuditLog;
use App\Models\Core\Company;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $users = User::query();

        $activities = DB::table('audit.audit_logs as logs')
            ->leftJoin('core.users as actors', 'actors.id', '=', 'logs.user_id')
            ->latest('logs.created_at')
            ->limit(10)
            ->get([
                'logs.id',
                'logs.action',
                'logs.entity_type',
                'logs.entity_id',
                'logs.created_at',
                'actors.name as actor_name',
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin dashboard summary retrieved successfully.',
            'data' => [
                'users' => [
                    'total' => (clone $users)->count(),
                    'active' => (clone $users)->where('is_active', true)->count(),
                    'inactive' => (clone $users)->where('is_active', false)->count(),
                ],
                'companies' => Company::query()->count(),
                'recent_activities' => $activities,
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $search = trim($filters['search'] ?? '');

        $users = User::query()
            ->with('companies:id,name,code')
            ->withCount('companies')
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($search): void {
                $query->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 25);

        return response()->json([
            'status' => 'success',
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ]);
    }

    public function show(int $user): JsonResponse
    {
        $record = User::query()
            ->with([
                'companies:id,name,code',
                'branches:id,company_id,name,code',
                'roles:id,name,code',
            ])
            ->findOrFail($user);

        return response()->json([
            'status' => 'success',
            'message' => 'User details retrieved successfully.',
            'data' => $record,
        ]);
    }

    public function destroy(Request $request, int $user): JsonResponse
    {
        $record = User::query()->findOrFail($user);
        abort_if((int) $record->id === (int) $request->user()->id, 422, 'You cannot delete your own account.');
        abort_if($record->is_superadmin, 422, 'Superadmin accounts cannot be deleted here.');

        DB::transaction(function () use ($request, $record): void {
            AuditLog::query()->create([
                'company_id' => null,
                'user_id' => $request->user()->id,
                'action' => 'user.deleted',
                'entity_type' => 'user',
                'entity_id' => $record->id,
                'old_values' => [
                    'name' => $record->name,
                    'email' => $record->email,
                    'is_active' => $record->is_active,
                ],
                'new_values' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            $record->tokens()->delete();
            $record->forceFill(['is_active' => false])->save();
            $record->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully.',
        ]);
    }
}
