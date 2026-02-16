@extends('admin.layouts.app')

@section('title', 'SOS Alerts')
@section('subtitle', 'Emergency alert management')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500">Total Alerts</p>
    </div>
    <a href="{{ route('admin.sos.active') }}" class="bg-red-50 rounded-lg shadow-sm p-4 text-center hover:bg-red-100 transition {{ $stats['active'] > 0 ? 'animate-pulse' : '' }}">
        <p class="text-2xl font-bold text-red-600">{{ $stats['active'] }}</p>
        <p class="text-xs text-red-600">Active</p>
    </a>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['resolved'] }}</p>
        <p class="text-xs text-green-600">Resolved</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ $stats['today'] }}</p>
        <p class="text-xs text-blue-600">Today</p>
    </div>
</div>

@if($stats['active'] > 0)
<div class="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-center justify-between">
    <div class="flex items-center">
        <i class="fas fa-exclamation-triangle text-red-600 text-2xl mr-3 animate-pulse"></i>
        <div>
            <p class="font-semibold text-red-800">{{ $stats['active'] }} Active Emergency Alert(s)</p>
            <p class="text-sm text-red-600">Immediate attention required!</p>
        </div>
    </div>
    <a href="{{ route('admin.sos.active') }}" class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium">View Active Alerts</a>
</div>
@endif

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.sos.index') }}" method="GET" class="flex flex-wrap gap-4 items-end">
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Status</label>
            <select name="status" class="w-full px-4 py-2 border rounded-lg">
                <option value="">All</option>
                <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                <option value="resolved" {{ request('status') == 'resolved' ? 'selected' : '' }}>Resolved</option>
                <option value="false_alarm" {{ request('status') == 'false_alarm' ? 'selected' : '' }}>False Alarm</option>
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
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-search mr-2"></i>Filter</button>
        <a href="{{ route('admin.sos.export', request()->query()) }}" class="px-4 py-2 bg-green-600 text-white rounded-lg"><i class="fas fa-download mr-2"></i>Export</a>
    </form>
</div>

<!-- Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($alerts as $alert)
                    <tr class="hover:bg-gray-50 {{ $alert->status == 'active' ? 'bg-red-50' : '' }}">
                        <td class="px-4 py-3 text-sm">#{{ $alert->id }}</td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $alert->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $alert->user->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm">{{ ucfirst($alert->type ?? 'SOS') }}</td>
                        <td class="px-4 py-3 text-xs text-gray-600">{{ Str::limit($alert->location_address ?? 'Coords: ' . $alert->latitude . ', ' . $alert->longitude, 30) }}</td>
                        <td class="px-4 py-3">
                            @if($alert->ride_request_id)
                                <a href="{{ route('admin.rides.show', $alert->ride_request_id) }}" class="text-blue-600 text-sm hover:underline">#{{ $alert->ride_request_id }}</a>
                            @else
                                <span class="text-gray-400">-</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full
                                @if($alert->status == 'active') bg-red-100 text-red-600
                                @elseif($alert->status == 'resolved') bg-green-100 text-green-600
                                @else bg-gray-100 text-gray-600 @endif">
                                {{ ucfirst(str_replace('_', ' ', $alert->status)) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-xs text-gray-500">{{ $alert->created_at->diffForHumans() }}</td>
                        <td class="px-4 py-3">
                            <a href="{{ route('admin.sos.show', $alert->id) }}" class="p-2 text-blue-600 hover:bg-blue-50 rounded"><i class="fas fa-eye"></i></a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">No alerts found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $alerts->links() }}</div>
</div>
@endsection
