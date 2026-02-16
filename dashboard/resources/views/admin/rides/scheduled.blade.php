@extends('admin.layouts.app')

@section('title', 'Scheduled Rides')
@section('subtitle', 'Manage scheduled/future rides')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-xl font-bold text-gray-800">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500">Total</p>
    </div>
    <div class="bg-yellow-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-xl font-bold text-yellow-600">{{ $stats['pending'] }}</p>
        <p class="text-xs text-yellow-600">Pending</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-xl font-bold text-blue-600">{{ $stats['booked'] }}</p>
        <p class="text-xs text-blue-600">Booked</p>
    </div>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-xl font-bold text-green-600">{{ $stats['completed'] }}</p>
        <p class="text-xs text-green-600">Completed</p>
    </div>
    <div class="bg-gray-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-xl font-bold text-gray-600">{{ $stats['cancelled'] }}</p>
        <p class="text-xs text-gray-600">Cancelled</p>
    </div>
    <div class="bg-red-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-xl font-bold text-red-600">{{ $stats['failed'] }}</p>
        <p class="text-xs text-red-600">Failed</p>
    </div>
</div>

<!-- Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled For</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($scheduledRides as $ride)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">#{{ $ride->id }}</td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $ride->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $ride->user->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3 text-xs text-gray-600">
                            <p>{{ Str::limit($ride->pickup_address, 25) }}</p>
                            <p class="text-gray-400">&darr;</p>
                            <p>{{ Str::limit($ride->drop_address, 25) }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-800">
                            {{ \Carbon\Carbon::parse($ride->scheduled_at)->format('M d, Y H:i') }}
                        </td>
                        <td class="px-4 py-3 text-sm font-medium">PKR {{ number_format($ride->estimated_fare ?? 0) }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs rounded-full
                                @if($ride->status == 'completed') bg-green-100 text-green-600
                                @elseif($ride->status == 'booked') bg-blue-100 text-blue-600
                                @elseif($ride->status == 'pending') bg-yellow-100 text-yellow-600
                                @elseif($ride->status == 'failed') bg-red-100 text-red-600
                                @else bg-gray-100 text-gray-600 @endif">
                                {{ ucfirst($ride->status) }}
                            </span>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No scheduled rides</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $scheduledRides->links() }}</div>
</div>
@endsection
