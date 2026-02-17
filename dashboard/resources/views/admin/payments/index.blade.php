@extends('admin.layouts.app')

@section('title', 'Payments')
@section('subtitle', 'Manage all payments and transactions')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">PKR {{ number_format($stats['total_amount']) }}</p>
        <p class="text-xs text-gray-500">Total Revenue</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">PKR {{ number_format($stats['total_commission']) }}</p>
        <p class="text-xs text-blue-600">Total Commission</p>
    </div>
    <div class="bg-yellow-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ $stats['pending_payments'] }}</p>
        <p class="text-xs text-yellow-600">Pending</p>
    </div>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">PKR {{ number_format($stats['today_revenue']) }}</p>
        <p class="text-xs text-green-600">Today</p>
    </div>
</div>

<!-- Quick Links -->
<div class="flex flex-wrap gap-4 mb-6">
    <a href="{{ route('admin.payments.withdrawals') }}" class="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200">
        <i class="ti ti-cash mr-2"></i>Withdrawals
    </a>
    <a href="{{ route('admin.payments.driver-wallets') }}" class="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200">
        <i class="ti ti-wallet mr-2"></i>Driver Wallets
    </a>
    <a href="{{ route('admin.payments.rider-wallets') }}" class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200">
        <i class="ti ti-wallet mr-2"></i>Rider Wallets
    </a>
    <a href="{{ route('admin.payments.transactions') }}" class="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200">
        <i class="ti ti-arrows-exchange mr-2"></i>Transactions
    </a>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.payments.index') }}" method="GET" class="flex flex-wrap gap-4 items-end">
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Status</label>
            <select name="status" class="w-full px-4 py-2 border rounded-lg">
                <option value="">All</option>
                <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Failed</option>
                <option value="refunded" {{ request('status') == 'refunded' ? 'selected' : '' }}>Refunded</option>
            </select>
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Method</label>
            <select name="payment_method" class="w-full px-4 py-2 border rounded-lg">
                <option value="">All</option>
                <option value="cash" {{ request('payment_method') == 'cash' ? 'selected' : '' }}>Cash</option>
                <option value="card" {{ request('payment_method') == 'card' ? 'selected' : '' }}>Card</option>
                <option value="wallet" {{ request('payment_method') == 'wallet' ? 'selected' : '' }}>Wallet</option>
                <option value="jazzcash" {{ request('payment_method') == 'jazzcash' ? 'selected' : '' }}>JazzCash</option>
                <option value="easypaisa" {{ request('payment_method') == 'easypaisa' ? 'selected' : '' }}>EasyPaisa</option>
            </select>
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">From</label>
            <input type="date" name="date_from" value="{{ request('date_from') }}" class="w-full px-4 py-2 border rounded-lg">
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">To</label>
            <input type="date" name="date_to" value="{{ request('date_to') }}" class="w-full px-4 py-2 border rounded-lg">
        </div>
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="ti ti-search mr-2"></i>Filter</button>
    </form>
</div>

<!-- Payments Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($payments as $payment)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">#{{ $payment->id }}</td>
                        <td class="px-4 py-3 text-sm"><a href="{{ route('admin.rides.show', $payment->ride_request_id) }}" class="text-blue-600 hover:underline">#{{ $payment->ride_request_id }}</a></td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $payment->user->name ?? 'N/A' }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-800">PKR {{ number_format($payment->amount) }}</td>
                        <td class="px-4 py-3 text-sm text-green-600">PKR {{ number_format($payment->commission_amount) }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">{{ ucfirst($payment->payment_method) }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full
                                @if($payment->status == 'completed') bg-green-100 text-green-600
                                @elseif($payment->status == 'pending') bg-yellow-100 text-yellow-600
                                @elseif($payment->status == 'refunded') bg-blue-100 text-blue-600
                                @else bg-red-100 text-red-600 @endif">
                                {{ ucfirst($payment->status) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-xs text-gray-500">{{ $payment->created_at->format('M d, Y H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">No payments found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $payments->links() }}</div>
</div>
@endsection
