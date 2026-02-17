@extends('admin.layouts.app')

@section('title', 'Rides Management')
@section('subtitle', 'View and manage all rides')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500">Total</p>
    </div>
    <div class="bg-yellow-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ $stats['searching'] }}</p>
        <p class="text-xs text-yellow-600">Searching</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ $stats['in_progress'] }}</p>
        <p class="text-xs text-blue-600">In Progress</p>
    </div>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['completed'] }}</p>
        <p class="text-xs text-green-600">Completed</p>
    </div>
    <div class="bg-red-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ $stats['cancelled'] }}</p>
        <p class="text-xs text-red-600">Cancelled</p>
    </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.rides.index') }}" method="GET" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm text-gray-600 mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Ride ID, address, user..."
                class="w-full px-4 py-2 border rounded-lg">
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Status</label>
            <select name="status" class="w-full px-4 py-2 border rounded-lg">
                <option value="">All</option>
                <option value="searching" {{ request('status') == 'searching' ? 'selected' : '' }}>Searching</option>
                <option value="driver_assigned" {{ request('status') == 'driver_assigned' ? 'selected' : '' }}>Assigned</option>
                <option value="in_progress" {{ request('status') == 'in_progress' ? 'selected' : '' }}>In Progress</option>
                <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                <option value="cancelled_by_rider" {{ request('status') == 'cancelled_by_rider' ? 'selected' : '' }}>Cancelled by Rider</option>
                <option value="cancelled_by_driver" {{ request('status') == 'cancelled_by_driver' ? 'selected' : '' }}>Cancelled by Driver</option>
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
        <a href="{{ route('admin.rides.index') }}" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"><i class="ti ti-x"></i></a>
    </form>
</div>

<!-- Rides Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b flex justify-between">
        <h3 class="font-semibold text-gray-800">All Rides</h3>
        <div class="flex gap-2">
            <a href="{{ route('admin.rides.active') }}" class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm"><i class="ti ti-car mr-2"></i>Active Rides</a>
            <a href="{{ route('admin.rides.export', request()->query()) }}" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"><i class="ti ti-download mr-2"></i>Export</a>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($rides as $ride)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm font-medium text-gray-800">#{{ $ride->id }}</td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $ride->rider->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $ride->rider->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $ride->driver->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $ride->driver->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-xs text-gray-600">{{ Str::limit($ride->pickup_address, 25) }}</p>
                            <p class="text-xs text-gray-500">&darr;</p>
                            <p class="text-xs text-gray-600">{{ Str::limit($ride->drop_address, 25) }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-800">PKR {{ number_format($ride->actual_price ?? $ride->estimated_price) }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full
                                @if($ride->status == 'completed') bg-green-100 text-green-600
                                @elseif($ride->status == 'in_progress') bg-blue-100 text-blue-600
                                @elseif(str_contains($ride->status, 'cancelled')) bg-red-100 text-red-600
                                @elseif($ride->status == 'searching') bg-yellow-100 text-yellow-600
                                @else bg-gray-100 text-gray-600 @endif">
                                {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-xs text-gray-500">{{ $ride->created_at->format('M d, Y H:i') }}</td>
                        <td class="px-4 py-3">
                            <a href="{{ route('admin.rides.show', $ride->id) }}" class="p-2 text-blue-600 hover:bg-blue-50 rounded"><i class="ti ti-eye"></i></a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">No rides found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $rides->links() }}</div>
</div>
@endsection
