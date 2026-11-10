<?php

namespace App\Http\Middleware;

use App\Models\Audit\AuditLog;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RecordAuditLog
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $route = $request->route();

        if (! $route || ! $this->shouldRecord($request, $route->getActionMethod(), $route->getName())) {
            return $response;
        }

        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 400) {
            return $response;
        }

        $controller = $route->getControllerClass();
        $entityType = $route->getName() === 'verification.verify'
            ? 'user'
            : ($controller
            ? Str::snake(Str::before(class_basename($controller), 'Controller'))
            : Str::snake($route->getName() ?? 'api_action'));
        $method = $route->getActionMethod();
        $action = $entityType.'.'.$this->actionName($method, $route->getName());
        $responseData = $response instanceof \Illuminate\Http\JsonResponse
            ? $response->getData(true)
            : [];
        $routeParameters = $route->parameters();

        AuditLog::query()->create([
            'company_id' => $this->companyId($request, $routeParameters, $responseData),
            'user_id' => $request->user()?->getAuthIdentifier(),
            'action' => Str::limit($action, 100, ''),
            'entity_type' => Str::limit($entityType, 100, ''),
            'entity_id' => $this->entityId($routeParameters, $responseData),
            'old_values' => null,
            'new_values' => $route->getName() === 'verification.verify'
                ? ['email_verified' => true]
                : $this->sanitize($request->input()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return $response;
    }

    private function shouldRecord(Request $request, string $method, ?string $routeName): bool
    {
        if ($routeName === 'verification.verify') {
            return true;
        }

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return false;
        }

        $controller = class_basename($request->route()?->getControllerClass() ?? '');

        return ! ($controller === 'AuthController' && in_array($method, ['login', 'spaLogin'], true))
            && ! ($controller === 'AdminController' && $method === 'destroy');
    }

    private function actionName(string $method, ?string $routeName): string
    {
        if ($routeName === 'verification.verify') {
            return 'email_verified';
        }

        return match ($method) {
            'store', 'signup' => 'created',
            'update' => 'updated',
            'destroy' => 'deleted',
            'logout', 'spaLogout' => 'logged_out',
            'changePassword', 'resetPassword' => 'password_changed',
            'updatePermissions' => 'permissions_updated',
            default => Str::snake($method),
        };
    }

    private function companyId(Request $request, array $routeParameters, array $responseData): ?int
    {
        $company = $routeParameters['company']
            ?? $request->input('company_id')
            ?? data_get($responseData, 'data.company.id');

        return $this->id($company);
    }

    private function entityId(array $routeParameters, array $responseData): ?int
    {
        foreach (['record', 'user', 'sale', 'purchase', 'receipt', 'transfer', 'adjustment', 'opname', 'id'] as $key) {
            if (isset($routeParameters[$key])) {
                return $this->id($routeParameters[$key]);
            }
        }

        return $this->id(data_get($responseData, 'data.id')
            ?? data_get($responseData, 'data.user.id')
            ?? data_get($responseData, 'data.company.id'));
    }

    private function id(mixed $value): ?int
    {
        if ($value instanceof Model) {
            $value = $value->getKey();
        }

        $id = filter_var($value, FILTER_VALIDATE_INT);

        return $id === false ? null : $id;
    }

    private function sanitize(array $values): ?array
    {
        $sensitiveKeys = '/password|token|secret|signature|authorization|cookie|api[_-]?key/i';
        $sanitized = [];

        foreach ($values as $key => $value) {
            if (is_string($key) && preg_match($sensitiveKeys, $key)) {
                continue;
            }

            $sanitized[$key] = is_array($value)
                ? $this->sanitize($value)
                : $value;
        }

        return $sanitized === [] ? null : $sanitized;
    }
}
