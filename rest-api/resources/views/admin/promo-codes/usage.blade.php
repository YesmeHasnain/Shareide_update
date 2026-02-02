@extends('admin.layouts.app')

@section('title', 'Promo Code Usage')
@section('subtitle', $promoCode->code)

@section('content')
<!-- Code Info -->
<div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
            <p class="text-xs text-gray-500">Code</p>
            <p class="text-lg font-bold text-blue-600">{{ $promoCode->code }}</p>
        </div>
        <div>
            <p class="text-xs text-gray-500">Discount</p>
            <p class="text-lg font-semibold">{{ $promoCode->discount_type == 'percentage' ? $promoCode->discount_value . '%' : 'PKR ' . number_format($promoCode->discount_value) }}</p>
        </div>
        <div>
            <p class="text-xs text-gray-500">Times Used</p>
            <p class="text-lg font-semibold">{{ $promoCode->times_used }}</p>
        </div>
        <div>
            <p class="text-xs text-gray-500">Total Discount Given</p>
            <p class="text-lg font-semibold text-green-600">PKR {{ number_format($usages->sum('discount_applied')) }}</p>
        </div>
        <div>
            <p class="text-xs text-gray-500">Status</p>
            @if($promoCode->is_active)
                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>
            @else
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactive</span>
            @endif
        </div>
    </div>
</div>

<!-- Usage Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b">
        <h3 class="font-semibold text-gray-800">Usage History</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount Applied</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($usages as $usage)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $usage->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $usage->user->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <a href="{{ route('admin.rides.show', $usage->ride_request_id) }}" class="text-blue-600 text-sm hover:underline">#{{ $usage->ride_request_id }}</a>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-green-600">PKR {{ number_format($usage->discount_applied) }}</td>
                        <td class="px-4 py-3 text-xs text-gray-500">{{ $usage->created_at->format('M d, Y H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">No usage history</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $usages->links() }}</div>
</div>
@endsection
