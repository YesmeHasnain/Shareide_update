@extends('admin.layouts.app')

@section('title', 'Transaction Log')
@section('subtitle', 'All wallet transactions')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Driver Transactions -->
    <div class="bg-white rounded-xl shadow-sm">
        <div class="p-4 border-b">
            <h3 class="font-semibold text-gray-800">Driver Transactions (Recent 50)</h3>
        </div>
        <div class="divide-y max-h-[600px] overflow-y-auto">
            @forelse($driverTransactions as $txn)
                <div class="p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-gray-800">{{ $txn->wallet->driver->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $txn->description }}</p>
                            <p class="text-xs text-gray-400">{{ $txn->created_at->format('M d, Y H:i') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold {{ $txn->amount >= 0 ? 'text-green-600' : 'text-red-600' }}">
                                {{ $txn->amount >= 0 ? '+' : '' }}PKR {{ number_format($txn->amount) }}
                            </p>
                            <p class="text-xs text-gray-500">Bal: PKR {{ number_format($txn->balance_after) }}</p>
                        </div>
                    </div>
                </div>
            @empty
                <div class="p-8 text-center text-gray-500">No transactions</div>
            @endforelse
        </div>
    </div>

    <!-- Rider Transactions -->
    <div class="bg-white rounded-xl shadow-sm">
        <div class="p-4 border-b">
            <h3 class="font-semibold text-gray-800">Rider Transactions (Recent 50)</h3>
        </div>
        <div class="divide-y max-h-[600px] overflow-y-auto">
            @forelse($riderTransactions as $txn)
                <div class="p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-medium text-gray-800">{{ $txn->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $txn->description }}</p>
                            <span class="text-xs px-2 py-0.5 rounded bg-gray-100">{{ ucfirst($txn->type) }}</span>
                            <p class="text-xs text-gray-400 mt-1">{{ $txn->created_at->format('M d, Y H:i') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold {{ $txn->type == 'topup' || $txn->type == 'refund' ? 'text-green-600' : 'text-red-600' }}">
                                {{ $txn->type == 'topup' || $txn->type == 'refund' ? '+' : '-' }}PKR {{ number_format(abs($txn->amount)) }}
                            </p>
                            <p class="text-xs text-gray-500">Bal: PKR {{ number_format($txn->balance_after) }}</p>
                        </div>
                    </div>
                </div>
            @empty
                <div class="p-8 text-center text-gray-500">No transactions</div>
            @endforelse
        </div>
    </div>
</div>
@endsection
