@extends('admin.layouts.app')

@section('title', 'Withdrawal Requests')
@section('subtitle', 'Manage driver withdrawal requests')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-yellow-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ $stats['pending'] }}</p>
        <p class="text-xs text-yellow-600">Pending</p>
    </div>
    <div class="bg-orange-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-orange-600">PKR {{ number_format($stats['pending_amount']) }}</p>
        <p class="text-xs text-orange-600">Pending Amount</p>
    </div>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['approved_today'] }}</p>
        <p class="text-xs text-green-600">Approved Today</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">PKR {{ number_format($stats['total_withdrawn']) }}</p>
        <p class="text-xs text-blue-600">Total Withdrawn</p>
    </div>
</div>

<!-- Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet Balance</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($withdrawals as $withdrawal)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">#{{ $withdrawal->id }}</td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $withdrawal->driver->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $withdrawal->driver->user->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-800">PKR {{ number_format($withdrawal->amount) }}</td>
                        <td class="px-4 py-3 text-sm">{{ ucfirst($withdrawal->method) }}</td>
                        <td class="px-4 py-3 text-xs text-gray-600">
                            @if(is_array($withdrawal->account_details))
                                @foreach($withdrawal->account_details as $key => $value)
                                    {{ ucfirst($key) }}: {{ $value }}<br>
                                @endforeach
                            @else
                                {{ $withdrawal->account_details }}
                            @endif
                        </td>
                        <td class="px-4 py-3 text-sm text-green-600">PKR {{ number_format($withdrawal->wallet->balance ?? 0) }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full
                                @if($withdrawal->status == 'approved') bg-green-100 text-green-600
                                @elseif($withdrawal->status == 'pending') bg-yellow-100 text-yellow-600
                                @else bg-red-100 text-red-600 @endif">
                                {{ ucfirst($withdrawal->status) }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            @if($withdrawal->status == 'pending')
                                <div class="flex space-x-2">
                                    <form action="{{ route('admin.payments.approve-withdrawal', $withdrawal->id) }}" method="POST" onsubmit="return confirm('Approve this withdrawal?')">
                                        @csrf
                                        <button class="px-3 py-1 bg-green-600 text-white rounded text-xs"><i class="ti ti-check mr-1"></i>Approve</button>
                                    </form>
                                    <button onclick="openRejectModal({{ $withdrawal->id }})" class="px-3 py-1 bg-red-600 text-white rounded text-xs"><i class="ti ti-x mr-1"></i>Reject</button>
                                </div>
                            @else
                                <span class="text-xs text-gray-500">{{ $withdrawal->processed_at ? $withdrawal->processed_at->format('M d, H:i') : '-' }}</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">No withdrawal requests</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $withdrawals->links() }}</div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Reject Withdrawal</h3>
        <form id="rejectForm" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-2">Reason *</label>
                <textarea name="admin_note" rows="3" required class="w-full px-4 py-2 border rounded-lg" placeholder="Reason for rejection..."></textarea>
            </div>
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="document.getElementById('rejectModal').classList.add('hidden')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg">Reject</button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openRejectModal(id) {
    document.getElementById('rejectForm').action = '/admin/payments/withdrawals/' + id + '/reject';
    document.getElementById('rejectModal').classList.remove('hidden');
}
</script>
@endpush
@endsection
