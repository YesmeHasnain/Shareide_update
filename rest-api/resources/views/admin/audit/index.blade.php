@extends('admin.layouts.app')

@section('title', 'Audit Logs')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p class="text-gray-600">Track all admin actions and system changes</p>
        </div>
        <div>
            <a href="{{ route('admin.audit.export', request()->all()) }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Export CSV
            </a>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form method="GET" class="flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search description..." class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select name="action" class="rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                    <option value="">All Actions</option>
                    @foreach($actions as $action)
                        <option value="{{ $action }}" {{ request('action') === $action ? 'selected' : '' }}>{{ ucfirst(str_replace('_', ' ', $action)) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Admin</label>
                <select name="user_id" class="rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                    <option value="">All Admins</option>
                    @foreach($admins as $admin)
                        <option value="{{ $admin->id }}" {{ request('user_id') == $admin->id ? 'selected' : '' }}>{{ $admin->name }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" name="date_from" value="{{ request('date_from') }}" class="rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" name="date_to" value="{{ request('date_to') }}" class="rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
            </div>
            <div>
                <button type="submit" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Filter
                </button>
            </div>
            @if(request()->hasAny(['search', 'action', 'user_id', 'date_from', 'date_to']))
                <div>
                    <a href="{{ route('admin.audit.index') }}" class="text-gray-500 hover:text-gray-700">Clear</a>
                </div>
            @endif
        </form>
    </div>

    <!-- Logs List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($logs as $log)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ $log->created_at->format('M d, Y') }}</p>
                                    <p class="text-xs text-gray-500">{{ $log->created_at->format('H:i:s') }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                @php
                                    $actionColors = [
                                        'login' => 'bg-blue-100 text-blue-800',
                                        'logout' => 'bg-gray-100 text-gray-800',
                                        'create' => 'bg-green-100 text-green-800',
                                        'update' => 'bg-yellow-100 text-yellow-800',
                                        'delete' => 'bg-red-100 text-red-800',
                                        'block' => 'bg-red-100 text-red-800',
                                        'approve' => 'bg-green-100 text-green-800',
                                        'reject' => 'bg-red-100 text-red-800',
                                    ];
                                    $color = 'bg-gray-100 text-gray-800';
                                    foreach($actionColors as $key => $val) {
                                        if(str_contains(strtolower($log->action), $key)) {
                                            $color = $val;
                                            break;
                                        }
                                    }
                                @endphp
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $color }}">
                                    {{ ucfirst(str_replace('_', ' ', $log->action)) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-gray-900 max-w-md truncate">{{ $log->description }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-gray-900">{{ $log->user->name ?? 'System' }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 font-mono">
                                {{ $log->ip_address ?? 'N/A' }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                @if($log->old_values || $log->new_values)
                                    <button onclick="showLogDetails({{ $log->id }})" class="text-yellow-600 hover:text-yellow-800 font-medium text-sm">
                                        View
                                    </button>
                                @else
                                    <span class="text-gray-400 text-sm">-</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500">No audit logs found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($logs->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">
                {{ $logs->links() }}
            </div>
        @endif
    </div>
</div>

<!-- Log Details Modal -->
<div id="logDetailsModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Change Details</h3>
            <button onclick="closeLogDetails()" class="text-gray-500 hover:text-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-2">Old Values</h4>
                    <pre id="oldValues" class="bg-red-50 p-3 rounded-lg text-sm overflow-x-auto"></pre>
                </div>
                <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-2">New Values</h4>
                    <pre id="newValues" class="bg-green-50 p-3 rounded-lg text-sm overflow-x-auto"></pre>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    const logsData = @json($logs->keyBy('id'));

    function showLogDetails(logId) {
        const log = logsData[logId];
        if (log) {
            document.getElementById('oldValues').textContent = JSON.stringify(log.old_values || {}, null, 2);
            document.getElementById('newValues').textContent = JSON.stringify(log.new_values || {}, null, 2);
            document.getElementById('logDetailsModal').classList.remove('hidden');
            document.getElementById('logDetailsModal').classList.add('flex');
        }
    }

    function closeLogDetails() {
        document.getElementById('logDetailsModal').classList.add('hidden');
        document.getElementById('logDetailsModal').classList.remove('flex');
    }

    document.getElementById('logDetailsModal').addEventListener('click', function(e) {
        if (e.target === this) closeLogDetails();
    });
</script>
@endpush
@endsection
