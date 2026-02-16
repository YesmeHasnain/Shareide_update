<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDriverApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $driver = $user->driver;

        if (!$driver || $driver->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Driver not approved',
            ], 403);
        }

        return $next($request);
    }
}