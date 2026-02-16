<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use Illuminate\Http\Request;

class PromoCodeManagementController extends Controller
{
    /**
     * List all promo codes
     */
    public function index(Request $request)
    {
        $query = PromoCode::withCount('usages');

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } else {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('search')) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }

        $promoCodes = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => PromoCode::count(),
            'active' => PromoCode::where('is_active', true)->count(),
            'total_usage' => PromoCodeUsage::count(),
            'total_discount_given' => PromoCodeUsage::sum('discount_applied'),
        ];

        return view('admin.promo-codes.index', compact('promoCodes', 'stats'));
    }

    /**
     * Create promo code form
     */
    public function create()
    {
        return view('admin.promo-codes.create');
    }

    /**
     * Store new promo code
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:promo_codes,code|max:20',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:1',
            'max_discount' => 'nullable|numeric|min:0',
            'min_ride_amount' => 'nullable|numeric|min:0',
            'total_usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'user_type' => 'nullable|in:all,new,existing',
        ]);

        PromoCode::create([
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'max_discount' => $request->max_discount,
            'min_ride_amount' => $request->min_ride_amount ?? 0,
            'total_usage_limit' => $request->total_usage_limit,
            'per_user_limit' => $request->per_user_limit ?? 1,
            'valid_from' => $request->valid_from,
            'valid_until' => $request->valid_until,
            'user_type' => $request->user_type ?? 'all',
            'is_active' => true,
        ]);

        return redirect()->route('admin.promo-codes.index')->with('success', 'Promo code created successfully.');
    }

    /**
     * Edit promo code form
     */
    public function edit($id)
    {
        $promoCode = PromoCode::findOrFail($id);
        return view('admin.promo-codes.edit', compact('promoCode'));
    }

    /**
     * Update promo code
     */
    public function update(Request $request, $id)
    {
        $promoCode = PromoCode::findOrFail($id);

        $request->validate([
            'code' => 'required|string|max:20|unique:promo_codes,code,' . $id,
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:1',
            'max_discount' => 'nullable|numeric|min:0',
            'min_ride_amount' => 'nullable|numeric|min:0',
            'total_usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'user_type' => 'nullable|in:all,new,existing',
            'is_active' => 'boolean',
        ]);

        $promoCode->update([
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'max_discount' => $request->max_discount,
            'min_ride_amount' => $request->min_ride_amount ?? 0,
            'total_usage_limit' => $request->total_usage_limit,
            'per_user_limit' => $request->per_user_limit ?? 1,
            'valid_from' => $request->valid_from,
            'valid_until' => $request->valid_until,
            'user_type' => $request->user_type ?? 'all',
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.promo-codes.index')->with('success', 'Promo code updated successfully.');
    }

    /**
     * Toggle promo code status
     */
    public function toggleStatus($id)
    {
        $promoCode = PromoCode::findOrFail($id);
        $promoCode->update(['is_active' => !$promoCode->is_active]);

        $status = $promoCode->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Promo code {$status} successfully.");
    }

    /**
     * Delete promo code
     */
    public function destroy($id)
    {
        $promoCode = PromoCode::findOrFail($id);

        // Check if promo code has been used
        if ($promoCode->times_used > 0) {
            return back()->with('error', 'Cannot delete promo code that has been used. Deactivate it instead.');
        }

        $promoCode->delete();
        return redirect()->route('admin.promo-codes.index')->with('success', 'Promo code deleted successfully.');
    }

    /**
     * View usage history of a promo code
     */
    public function usageHistory($id)
    {
        $promoCode = PromoCode::findOrFail($id);
        $usages = PromoCodeUsage::with(['user', 'rideRequest'])
            ->where('promo_code_id', $id)
            ->latest()
            ->paginate(20);

        return view('admin.promo-codes.usage', compact('promoCode', 'usages'));
    }
}
