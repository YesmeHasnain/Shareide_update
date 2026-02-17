@extends('admin.layouts.app')

@section('title', 'Drivers Management')
@section('subtitle', 'Manage all drivers and their approvals')

@section('content')
<!-- Stats Cards -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500">Total</p>
    </div>
    <a href="{{ route('admin.drivers.pending') }}" class="bg-yellow-50 rounded-lg shadow-sm p-4 text-center hover:bg-yellow-100 transition">
        <p class="text-2xl font-bold text-yellow-600">{{ $stats['pending'] }}</p>
        <p class="text-xs text-yellow-600">Pending</p>
    </a>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['approved'] }}</p>
        <p class="text-xs text-green-600">Approved</p>
    </div>
    <div class="bg-red-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ $stats['rejected'] }}</p>
        <p class="text-xs text-red-600">Rejected</p>
    </div>
    <div class="bg-gray-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-600">{{ $stats['blocked'] }}</p>
        <p class="text-xs text-gray-600">Blocked</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ $stats['online'] }}</p>
        <p class="text-xs text-blue-600">Online Now</p>
    </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.drivers.index') }}" method="GET" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm text-gray-600 mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Name, phone, plate..."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Status</label>
            <select name="status" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Approved</option>
                <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
                <option value="blocked" {{ request('status') == 'blocked' ? 'selected' : '' }}>Blocked</option>
            </select>
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Vehicle Type</label>
            <select name="vehicle_type" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">All Types</option>
                <option value="car" {{ request('vehicle_type') == 'car' ? 'selected' : '' }}>Car</option>
                <option value="bike" {{ request('vehicle_type') == 'bike' ? 'selected' : '' }}>Bike</option>
            </select>
        </div>
        <div class="flex gap-2">
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <i class="ti ti-search mr-2"></i>Filter
            </button>
            <a href="{{ route('admin.drivers.index') }}" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <i class="ti ti-x"></i>
            </a>
        </div>
    </form>
</div>

<!-- Drivers Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b flex items-center justify-between">
        <h3 class="font-semibold text-gray-800">All Drivers</h3>
        <a href="{{ route('admin.drivers.export', request()->query()) }}" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <i class="ti ti-download mr-2"></i>Export CSV
        </a>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rides</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($drivers as $driver)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <i class="ti ti-user text-gray-500"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="font-medium text-gray-800">{{ $driver->user->name ?? 'N/A' }}</p>
                                    <p class="text-xs text-gray-500">ID: {{ $driver->id }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm text-gray-800">{{ $driver->user->phone ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $driver->user->email ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded {{ $driver->vehicle_type == 'car' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600' }}">
                                {{ ucfirst($driver->vehicle_type) }}
                            </span>
                            <p class="text-xs text-gray-500 mt-1">{{ $driver->plate_number }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $driver->city }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center">
                                <i class="ti ti-star text-yellow-400 mr-1"></i>
                                <span class="text-sm text-gray-800">{{ number_format($driver->rating_average, 1) }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $driver->completed_rides_count }}</td>
                        <td class="px-4 py-3">
                            @if($driver->status == 'approved')
                                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                                    <i class="ti ti-circle-check mr-1"></i>Approved
                                </span>
                                @if($driver->is_online)
                                    <span class="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">Online</span>
                                @endif
                            @elseif($driver->status == 'pending')
                                <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">
                                    <i class="ti ti-clock mr-1"></i>Pending
                                </span>
                            @elseif($driver->status == 'rejected')
                                <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                                    <i class="ti ti-circle-x mr-1"></i>Rejected
                                </span>
                            @else
                                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                    <i class="ti ti-ban mr-1"></i>Blocked
                                </span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center space-x-2">
                                <a href="{{ route('admin.drivers.show', $driver->id) }}" class="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View">
                                    <i class="ti ti-eye"></i>
                                </a>
                                @if($driver->status == 'pending')
                                    <form action="{{ route('admin.drivers.approve', $driver->id) }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="p-2 text-green-600 hover:bg-green-50 rounded" title="Approve">
                                            <i class="ti ti-check"></i>
                                        </button>
                                    </form>
                                @endif
                                @if($driver->status == 'approved')
                                    <form action="{{ route('admin.drivers.block', $driver->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to block this driver?')">
                                        @csrf
                                        <button type="submit" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Block">
                                            <i class="ti ti-ban"></i>
                                        </button>
                                    </form>
                                @endif
                                @if($driver->status == 'blocked')
                                    <form action="{{ route('admin.drivers.unblock', $driver->id) }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="p-2 text-green-600 hover:bg-green-50 rounded" title="Unblock">
                                            <i class="ti ti-lock-open"></i>
                                        </button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="px-4 py-8 text-center text-gray-500">No drivers found</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <!-- Pagination -->
    <div class="px-4 py-3 border-t">
        {{ $drivers->links() }}
    </div>
</div>
@endsection
