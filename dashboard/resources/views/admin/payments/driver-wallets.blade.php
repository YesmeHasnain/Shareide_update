@extends('admin.layouts.app')

@section('title', 'Driver Wallets')
@section('subtitle', 'View all driver earnings and balances')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-3 gap-4 mb-6">
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">PKR {{ number_format($stats['total_balance']) }}</p>
        <p class="text-xs text-green-600">Total Balance</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">PKR {{ number_format($stats['total_earned']) }}</p>
        <p class="text-xs text-blue-600">Total Earned</p>
    </div>
    <div class="bg-orange-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-orange-600">PKR {{ number_format($stats['total_withdrawn']) }}</p>
        <p class="text-xs text-orange-600">Total Withdrawn</p>
    </div>
</div>

<!-- Search -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.payments.driver-wallets') }}" method="GET" class="flex gap-4">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Search driver name or phone..."
            class="flex-1 px-4 py-2 border rounded-lg">
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="ti ti-search mr-2"></i>Search</button>
    </form>
</div>

<!-- Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Withdrawn</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($wallets as $wallet)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $wallet->driver->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $wallet->driver->user->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm font-bold text-green-600">PKR {{ number_format($wallet->balance) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-800">PKR {{ number_format($wallet->total_earned) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-800">PKR {{ number_format($wallet->total_withdrawn) }}</td>
                        <td class="px-4 py-3 text-sm text-orange-600">PKR {{ number_format($wallet->pending_amount) }}</td>
                        <td class="px-4 py-3">
                            <a href="{{ route('admin.drivers.show', $wallet->driver_id) }}" class="text-blue-600 text-sm hover:underline">View Driver</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No wallets found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $wallets->links() }}</div>
</div>
@endsection
