@extends('admin.layouts.app')

@section('title', 'Active Rides')
@section('subtitle', 'Live monitoring of ongoing rides')

@section('content')
<div class="mb-4 flex justify-between items-center">
    <p class="text-gray-600"><span class="font-semibold text-blue-600">{{ $rides->total() }}</span> active rides</p>
    <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
        <i class="fas fa-sync-alt mr-2"></i>Refresh
    </button>
</div>

@if($rides->count() > 0)
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    @foreach($rides as $ride)
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 {{ $ride->status == 'in_progress' ? 'border-green-500' : 'border-yellow-500' }}">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-800">#{{ $ride->id }}</span>
                <span class="px-2 py-1 text-xs rounded-full
                    {{ $ride->status == 'in_progress' ? 'bg-green-100 text-green-600' :
                    ($ride->status == 'driver_arrived' ? 'bg-blue-100 text-blue-600' :
                    ($ride->status == 'driver_assigned' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600')) }}">
                    {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                </span>
            </div>

            <div class="mb-3">
                <div class="flex items-center text-sm mb-1">
                    <i class="fas fa-user text-blue-500 w-5"></i>
                    <span class="text-gray-800">{{ $ride->rider->name ?? 'N/A' }}</span>
                </div>
                <div class="flex items-center text-sm">
                    <i class="fas fa-car text-green-500 w-5"></i>
                    <span class="text-gray-800">{{ $ride->driver->name ?? 'Searching...' }}</span>
                </div>
            </div>

            <div class="text-xs text-gray-500 space-y-1 mb-3">
                <p><i class="fas fa-circle text-green-400 mr-1"></i>{{ Str::limit($ride->pickup_address, 35) }}</p>
                <p><i class="fas fa-map-marker-alt text-red-400 mr-1"></i>{{ Str::limit($ride->drop_address, 35) }}</p>
            </div>

            <div class="flex items-center justify-between pt-3 border-t">
                <span class="text-sm font-semibold text-gray-800">PKR {{ number_format($ride->estimated_price) }}</span>
                <a href="{{ route('admin.rides.show', $ride->id) }}" class="text-blue-600 text-sm hover:underline">View Details</a>
            </div>
        </div>
    @endforeach
</div>

<div class="mt-6">{{ $rides->links() }}</div>
@else
<div class="bg-white rounded-xl shadow-sm p-8 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-car text-gray-400 text-2xl"></i>
    </div>
    <h3 class="text-lg font-semibold text-gray-800">No Active Rides</h3>
    <p class="text-gray-500 mt-2">All rides are completed or no rides are currently in progress.</p>
</div>
@endif
@endsection
