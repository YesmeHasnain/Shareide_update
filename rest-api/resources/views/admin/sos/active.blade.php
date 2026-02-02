@extends('admin.layouts.app')

@section('title', 'Active SOS Alerts')
@section('subtitle', 'Emergencies requiring immediate attention')

@section('content')
<div class="mb-4 flex justify-between items-center">
    <p class="text-gray-600"><span class="font-semibold text-red-600">{{ $alerts->count() }}</span> active emergency alerts</p>
    <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
        <i class="fas fa-sync-alt mr-2"></i>Refresh
    </button>
</div>

@if($alerts->count() > 0)
<div class="space-y-4">
    @foreach($alerts as $alert)
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <!-- User Info -->
                <div class="flex items-start space-x-4">
                    <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">{{ $alert->user->name ?? 'Unknown User' }}</h3>
                        <p class="text-gray-500">{{ $alert->user->phone ?? 'No phone' }}</p>
                        <p class="text-sm text-red-600 font-medium">{{ $alert->created_at->diffForHumans() }}</p>
                    </div>
                </div>

                <!-- Location & Ride -->
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Location</p>
                        <p class="text-gray-800">{{ $alert->location_address ?? 'Location not available' }}</p>
                        @if($alert->latitude && $alert->longitude)
                            <a href="https://www.google.com/maps?q={{ $alert->latitude }},{{ $alert->longitude }}" target="_blank" class="text-blue-600 text-sm hover:underline">
                                <i class="fas fa-map-marker-alt mr-1"></i>View on Map
                            </a>
                        @endif
                    </div>
                    @if($alert->rideRequest)
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Ride Info</p>
                        <p class="text-gray-800">Ride #{{ $alert->ride_request_id }}</p>
                        <p class="text-sm text-gray-500">Driver: {{ $alert->rideRequest->driver->user->name ?? 'N/A' }}</p>
                        <a href="{{ route('admin.rides.show', $alert->ride_request_id) }}" class="text-blue-600 text-sm hover:underline">View Ride</a>
                    </div>
                    @endif
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-2">
                    <form action="{{ route('admin.sos.notify-contacts', $alert->id) }}" method="POST" class="inline">
                        @csrf
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm {{ $alert->contacts_notified ? 'opacity-50' : '' }}">
                            <i class="fas fa-phone mr-1"></i>{{ $alert->contacts_notified ? 'Notified' : 'Notify Contacts' }}
                        </button>
                    </form>
                    <form action="{{ route('admin.sos.notify-police', $alert->id) }}" method="POST" class="inline">
                        @csrf
                        <button class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm {{ $alert->police_notified ? 'opacity-50' : '' }}">
                            <i class="fas fa-shield-alt mr-1"></i>{{ $alert->police_notified ? 'Police Notified' : 'Notify Police' }}
                        </button>
                    </form>
                    <a href="{{ route('admin.sos.show', $alert->id) }}" class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm">
                        <i class="fas fa-eye mr-1"></i>Details
                    </a>
                </div>
            </div>

            @if($alert->message)
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600"><strong>Message:</strong> {{ $alert->message }}</p>
                </div>
            @endif
        </div>
    @endforeach
</div>
@else
<div class="bg-white rounded-xl shadow-sm p-8 text-center">
    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-check-circle text-green-500 text-3xl"></i>
    </div>
    <h3 class="text-lg font-semibold text-gray-800">All Clear</h3>
    <p class="text-gray-500 mt-2">No active emergency alerts at the moment.</p>
</div>
@endif
@endsection
