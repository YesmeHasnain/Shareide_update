@extends('admin.layouts.app')

@section('title', 'Edit Promo Code')
@section('subtitle', $promoCode->code)

@section('content')
<div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <form action="{{ route('admin.promo-codes.update', $promoCode->id) }}" method="POST">
            @csrf @method('PUT')

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input type="text" name="code" value="{{ old('code', $promoCode->code) }}" required
                        class="w-full px-4 py-2 border rounded-lg uppercase">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" name="description" value="{{ old('description', $promoCode->description) }}"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                    <select name="discount_type" required class="w-full px-4 py-2 border rounded-lg">
                        <option value="percentage" {{ $promoCode->discount_type == 'percentage' ? 'selected' : '' }}>Percentage (%)</option>
                        <option value="fixed" {{ $promoCode->discount_type == 'fixed' ? 'selected' : '' }}>Fixed Amount (PKR)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                    <input type="number" name="discount_value" value="{{ old('discount_value', $promoCode->discount_value) }}" required min="1"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Discount (PKR)</label>
                    <input type="number" name="max_discount" value="{{ old('max_discount', $promoCode->max_discount) }}" min="0"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min Ride Amount (PKR)</label>
                    <input type="number" name="min_ride_amount" value="{{ old('min_ride_amount', $promoCode->min_ride_amount) }}" min="0"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                    <input type="number" name="total_usage_limit" value="{{ old('total_usage_limit', $promoCode->total_usage_limit) }}" min="1"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                    <input type="number" name="per_user_limit" value="{{ old('per_user_limit', $promoCode->per_user_limit) }}" min="1"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                    <input type="date" name="valid_from" value="{{ old('valid_from', $promoCode->valid_from ? \Carbon\Carbon::parse($promoCode->valid_from)->format('Y-m-d') : '') }}"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                    <input type="date" name="valid_until" value="{{ old('valid_until', $promoCode->valid_until ? \Carbon\Carbon::parse($promoCode->valid_until)->format('Y-m-d') : '') }}"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                    <select name="user_type" class="w-full px-4 py-2 border rounded-lg">
                        <option value="all" {{ $promoCode->user_type == 'all' ? 'selected' : '' }}>All Users</option>
                        <option value="new" {{ $promoCode->user_type == 'new' ? 'selected' : '' }}>New Users Only</option>
                        <option value="existing" {{ $promoCode->user_type == 'existing' ? 'selected' : '' }}>Existing Users Only</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <label class="flex items-center">
                        <input type="checkbox" name="is_active" value="1" {{ $promoCode->is_active ? 'checked' : '' }} class="w-4 h-4 text-blue-600 rounded">
                        <span class="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                </div>
            </div>

            <div class="flex justify-end space-x-4">
                <a href="{{ route('admin.promo-codes.index') }}" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</a>
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="ti ti-device-floppy mr-2"></i>Update</button>
            </div>
        </form>
    </div>
</div>
@endsection
