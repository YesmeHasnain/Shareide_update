@extends('admin.layouts.app')

@section('title', 'Create Promo Code')
@section('subtitle', 'Add a new promotional code')

@section('content')
<div class="max-w-2xl">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <form action="{{ route('admin.promo-codes.store') }}" method="POST">
            @csrf

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input type="text" name="code" value="{{ old('code') }}" required
                        class="w-full px-4 py-2 border rounded-lg uppercase" placeholder="SUMMER2024">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" name="description" value="{{ old('description') }}"
                        class="w-full px-4 py-2 border rounded-lg" placeholder="Summer discount">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                    <select name="discount_type" required class="w-full px-4 py-2 border rounded-lg">
                        <option value="percentage" {{ old('discount_type') == 'percentage' ? 'selected' : '' }}>Percentage (%)</option>
                        <option value="fixed" {{ old('discount_type') == 'fixed' ? 'selected' : '' }}>Fixed Amount (PKR)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                    <input type="number" name="discount_value" value="{{ old('discount_value') }}" required min="1"
                        class="w-full px-4 py-2 border rounded-lg" placeholder="10">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Discount (PKR)</label>
                    <input type="number" name="max_discount" value="{{ old('max_discount') }}" min="0"
                        class="w-full px-4 py-2 border rounded-lg" placeholder="500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min Ride Amount (PKR)</label>
                    <input type="number" name="min_ride_amount" value="{{ old('min_ride_amount') }}" min="0"
                        class="w-full px-4 py-2 border rounded-lg" placeholder="200">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                    <input type="number" name="total_usage_limit" value="{{ old('total_usage_limit') }}" min="1"
                        class="w-full px-4 py-2 border rounded-lg" placeholder="100 (leave empty for unlimited)">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                    <input type="number" name="per_user_limit" value="{{ old('per_user_limit', 1) }}" min="1"
                        class="w-full px-4 py-2 border rounded-lg" placeholder="1">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                    <input type="date" name="valid_from" value="{{ old('valid_from') }}"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                    <input type="date" name="valid_until" value="{{ old('valid_until') }}"
                        class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select name="user_type" class="w-full px-4 py-2 border rounded-lg">
                    <option value="all" {{ old('user_type') == 'all' ? 'selected' : '' }}>All Users</option>
                    <option value="new" {{ old('user_type') == 'new' ? 'selected' : '' }}>New Users Only</option>
                    <option value="existing" {{ old('user_type') == 'existing' ? 'selected' : '' }}>Existing Users Only</option>
                </select>
            </div>

            <div class="flex justify-end space-x-4">
                <a href="{{ route('admin.promo-codes.index') }}" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</a>
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-plus mr-2"></i>Create</button>
            </div>
        </form>
    </div>
</div>
@endsection
