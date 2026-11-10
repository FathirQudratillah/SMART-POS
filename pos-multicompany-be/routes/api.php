<?php

use App\Http\Controllers\Api\Access\RoleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Catalog\CategoryController;
use App\Http\Controllers\Api\Catalog\ProductController;
use App\Http\Controllers\Api\Core\BranchController;
use App\Http\Controllers\Api\Core\CompanyController;
use App\Http\Controllers\Api\Core\CompanyUserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Finance\CashMovementController;
use App\Http\Controllers\Api\Inventory\InventoryStockController;
use App\Http\Controllers\Api\Inventory\StockAdjustmentController;
use App\Http\Controllers\Api\Inventory\StockMovementController;
use App\Http\Controllers\Api\Inventory\StockOpnameController;
use App\Http\Controllers\Api\Inventory\StockTransferController;
use App\Http\Controllers\Api\Inventory\WarehouseController;
use App\Http\Controllers\Api\Purchasing\GoodsReceiptController;
use App\Http\Controllers\Api\Purchasing\PurchaseController;
use App\Http\Controllers\Api\Purchasing\SupplierController;
use App\Http\Controllers\Api\Sales\CustomerController;
use App\Http\Controllers\Api\Sales\SaleController;
use App\Http\Controllers\Api\Settings\PaymentMethodController;
use App\Http\Middleware\EnsureActiveUser;
use App\Models\Core\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('health', function () {
        return response()->json(['status' => 'ok']);
    });

    Route::get('/email/verify/{id}/{hash}', function (
        Request $request,
        string $id,
        string $hash
    ) {
        $user = User::findOrFail($id);

        // Pastikan hash sesuai dengan email user.
        abort_unless(
            hash_equals($hash, sha1($user->getEmailForVerification())),
            403
        );

        // Pastikan URL memiliki signature yang valid.
        abort_unless($request->hasValidSignature(), 403);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect('http://localhost:5173/email-verified');
    })->name('verification.verify');

    Route::post('auth/signup', [AuthController::class, 'signup']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

    Route::post('auth/spa/login', [
        AuthController::class,
        'spaLogin',
    ]);

    Route::middleware(['auth:sanctum', EnsureActiveUser::class])->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::prefix('admin')->middleware('superadmin')->group(function () {
            Route::get('dashboard', [AdminController::class, 'dashboard']);
            Route::get('users', [AdminController::class, 'users']);
            Route::get('users/{user}', [AdminController::class, 'show'])->whereNumber('user');
            Route::delete('users/{user}', [AdminController::class, 'destroy'])->whereNumber('user');
        });
        Route::get('companies/{company}/dashboard', DashboardController::class)
            ->middleware('permission:dashboard.view');
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/spa/logout', [AuthController::class, 'spaLogout']);

        Route::apiResource('companies', CompanyController::class)
            ->only(['index', 'store', 'show', 'update', 'destroy'])
            ->middlewareFor('show', 'permission:core.companies.view')
            ->middlewareFor('update', 'permission:core.companies.update')
            ->middlewareFor('destroy', 'permission:core.companies.delete');

        Route::apiResource('companies/{company}/branches', BranchController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['branches' => 'record'])
            ->middlewareFor('index', 'permission:core.branches.view')
            ->middlewareFor('store', 'permission:core.branches.create')
            ->middlewareFor('show', 'permission:core.branches.view')
            ->middlewareFor('update', 'permission:core.branches.update');
        Route::delete('companies/{company}/branches', [BranchController::class, 'destroy'])
            ->middleware('permission:core.branches.delete');

        Route::get('companies/{company}/users', [CompanyUserController::class, 'index'])
            ->middleware('permission:core.users.manage');
        Route::post('companies/{company}/users', [CompanyUserController::class, 'store'])
            ->middleware('permission:core.users.manage');
        Route::get('companies/{company}/users/{user}', [CompanyUserController::class, 'show'])
            ->middleware('permission:core.users.manage');
        Route::patch('companies/{company}/users/{user}', [CompanyUserController::class, 'update'])
            ->middleware('permission:core.users.manage');
        Route::patch('companies/{company}/users/{user}/password', [CompanyUserController::class, 'changePassword'])
            ->middleware('permission:core.users.manage');
        Route::put('companies/{company}/users/{user}/permissions', [CompanyUserController::class, 'updatePermissions'])
            ->middleware('permission:core.users.manage');
        Route::delete('companies/{company}/users', [CompanyUserController::class, 'destroy'])
            ->middleware('permission:core.users.manage');

        Route::apiResource('companies/{company}/categories', CategoryController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['categories' => 'record'])
            ->middlewareFor('index', 'permission:catalog.categories.view')
            ->middlewareFor('store', 'permission:catalog.categories.create')
            ->middlewareFor('show', 'permission:catalog.categories.view')
            ->middlewareFor('update', 'permission:catalog.categories.update');
        Route::delete('companies/{company}/categories', [CategoryController::class, 'destroy'])
            ->middleware('permission:catalog.categories.delete');

        Route::apiResource('companies/{company}/products', ProductController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['products' => 'record'])
            ->middlewareFor('index', 'permission:catalog.products.view')
            ->middlewareFor('store', 'permission:catalog.products.create')
            ->middlewareFor('show', 'permission:catalog.products.view')
            ->middlewareFor('update', 'permission:catalog.products.update');

        Route::delete('companies/{company}/products', [ProductController::class, 'destroy'])
            ->middleware('permission:catalog.products.delete');

        Route::apiResource('companies/{company}/warehouses', WarehouseController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['warehouses' => 'record'])
            ->middlewareFor('index', 'permission:inventory.warehouses.view')
            ->middlewareFor('store', 'permission:inventory.warehouses.create')
            ->middlewareFor('show', 'permission:inventory.warehouses.view')
            ->middlewareFor('update', 'permission:inventory.warehouses.update');
        Route::delete('companies/{company}/warehouses', [WarehouseController::class, 'destroy'])
            ->middleware('permission:inventory.warehouses.delete');

        Route::apiResource('companies/{company}/customers', CustomerController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['customers' => 'record'])
            ->middlewareFor('index', 'permission:sales.customers.view')
            ->middlewareFor('store', 'permission:sales.customers.create')
            ->middlewareFor('show', 'permission:sales.customers.view')
            ->middlewareFor('update', 'permission:sales.customers.update');
        Route::delete('companies/{company}/customers', [CustomerController::class, 'destroy'])
            ->middleware('permission:sales.customers.delete');

        Route::apiResource('companies/{company}/suppliers', SupplierController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['suppliers' => 'record'])
            ->middlewareFor('index', 'permission:purchasing.suppliers.view')
            ->middlewareFor('store', 'permission:purchasing.suppliers.create')
            ->middlewareFor('show', 'permission:purchasing.suppliers.view')
            ->middlewareFor('update', 'permission:purchasing.suppliers.update');
        Route::delete('companies/{company}/suppliers', [SupplierController::class, 'destroy'])
            ->middleware('permission:purchasing.suppliers.delete');

        Route::apiResource('companies/{company}/payment-methods', PaymentMethodController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['payment-methods' => 'record'])
            ->middlewareFor('index', 'permission:settings.payment_methods.view')
            ->middlewareFor('store', 'permission:settings.payment_methods.create')
            ->middlewareFor('show', 'permission:settings.payment_methods.view')
            ->middlewareFor('update', 'permission:settings.payment_methods.update');
        Route::delete('companies/{company}/payment-methods', [PaymentMethodController::class, 'destroy'])
            ->middleware('permission:settings.payment_methods.delete');

        Route::apiResource('companies/{company}/roles', RoleController::class)
            ->only(['index', 'store', 'show', 'update'])
            ->parameters(['roles' => 'record'])
            ->middlewareFor('index', 'permission:access.roles.view')
            ->middlewareFor('store', 'permission:access.roles.create')
            ->middlewareFor('show', 'permission:access.roles.view')
            ->middlewareFor('update', 'permission:access.roles.update');
        Route::delete('companies/{company}/roles', [RoleController::class, 'destroy'])
            ->middleware('permission:access.roles.delete');

        Route::get('companies/{company}/sales', [SaleController::class, 'index'])
            ->middleware('permission:sales.sales.view');
        Route::post('companies/{company}/sales', [SaleController::class, 'store'])
            ->middleware('permission:sales.create');
        Route::get('companies/{company}/cashier-shifts', [SaleController::class, 'shifts'])
            ->middleware('permission:sales.cashier_shifts.view');
        Route::get('companies/{company}/cashier-shifts/open', [SaleController::class, 'openShift'])
            ->middleware('permission:sales.cashier_shifts.view');
        Route::post('companies/{company}/cashier-shifts/open', [SaleController::class, 'startShift'])
            ->middleware('permission:sales.cashier_shifts.open');
        Route::post('companies/{company}/cashier-shifts/{shift}/close', [SaleController::class, 'closeShift'])
            ->middleware('permission:sales.cashier_shifts.close');
        Route::get('companies/{company}/sales-payment-methods', [SaleController::class, 'paymentMethods'])
            ->middleware('permission:sales.create');
        Route::get('companies/{company}/sales/{sale}', [SaleController::class, 'show'])
            ->middleware('permission:sales.sales.view');
        Route::post('companies/{company}/sales/{sale}/complete', [SaleController::class, 'complete'])
            ->middleware('permission:sales.create');

        Route::get('companies/{company}/purchases/{branch?}', [PurchaseController::class, 'index'])
            ->middleware('permission:purchasing.orders.view');
        Route::post('companies/{company}/purchases', [PurchaseController::class, 'store'])
            ->middleware('permission:purchasing.orders.create');
        Route::get('companies/{company}/purchase/{purchase}', [PurchaseController::class, 'show'])
            ->middleware('permission:purchasing.orders.view');

        Route::get('companies/{company}/goods-receipts/{branch?}', [GoodsReceiptController::class, 'index'])
            ->middleware('permission:purchasing.goods_receipts.view');
        Route::post('companies/{company}/goods-receipts', [GoodsReceiptController::class, 'store'])
            ->middleware('permission:purchasing.goods_receipts.create');
        Route::get('companies/{company}/goods-receipt/{receipt}', [GoodsReceiptController::class, 'show'])
            ->middleware('permission:purchasing.goods_receipts.view');
        Route::post('companies/{company}/goods-receipts/{receipt}/post', [GoodsReceiptController::class, 'post'])
            ->middleware('permission:purchasing.goods_receipts.post');

        Route::get('companies/{company}/inventory-stocks/{branch?}/{warehouse?}', [InventoryStockController::class, 'index'])
            ->middleware('permission:inventory.stock_overview.view');
        Route::get('companies/{company}/stock-movements', [StockMovementController::class, 'index'])
            ->middleware('permission:inventory.stock_movements.view');
        Route::get('companies/{company}/stock-transfers/{branch?}', [StockTransferController::class, 'index'])
            ->middleware('permission:inventory.stock_transfers.view');
        Route::post('companies/{company}/stock-transfers', [StockTransferController::class, 'store'])
            ->middleware('permission:inventory.stock_transfers.create');
        Route::get('companies/{company}/stock-transfer/{transfer}', [StockTransferController::class, 'show'])
            ->middleware('permission:inventory.stock_transfers.view');
        Route::post('companies/{company}/stock-transfers/{transfer}/post', [StockTransferController::class, 'post'])
            ->middleware('permission:inventory.stock_transfers.post');
        Route::get('companies/{company}/stock-adjustments', [StockAdjustmentController::class, 'index'])
            ->middleware('permission:inventory.stock_adjustments.view');
        Route::post('companies/{company}/stock-adjustments', [StockAdjustmentController::class, 'store'])
            ->middleware('permission:inventory.stock_adjustments.create');
        Route::get('companies/{company}/stock-adjustments/{adjustment}', [StockAdjustmentController::class, 'show'])
            ->middleware('permission:inventory.stock_adjustments.view');
        Route::post('companies/{company}/stock-adjustments/{adjustment}/post', [StockAdjustmentController::class, 'post'])
            ->middleware('permission:inventory.stock_adjustments.post');
        Route::get('companies/{company}/stock-opnames', [StockOpnameController::class, 'index'])
            ->middleware('permission:inventory.stock_opnames.view');
        Route::post('companies/{company}/stock-opnames', [StockOpnameController::class, 'store'])
            ->middleware('permission:inventory.stock_opnames.create');
        Route::get('companies/{company}/stock-opnames/{opname}', [StockOpnameController::class, 'show'])
            ->middleware('permission:inventory.stock_opnames.view');
        Route::post('companies/{company}/stock-opnames/{opname}/post', [StockOpnameController::class, 'post'])
            ->middleware('permission:inventory.stock_opnames.post');
        Route::get('companies/{company}/cash-movements', [CashMovementController::class, 'index'])
            ->middleware('permission:finance.cash_movements.view');
        Route::post('companies/{company}/cash-movements', [CashMovementController::class, 'store'])
            ->middleware('permission:finance.cash_movements.create');
    });
});
