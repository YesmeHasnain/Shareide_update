@extends('admin.layouts.app')

@section('title', 'SOS Alert Details')
@section('subtitle', 'Alert #' . $alert->id)

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <!-- Alert Info -->
        <div class="bg-white rounded-xl shadow-sm p-6 {{ $alert->status == 'active' ? 'border-l-4 border-red-500' : '' }}">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-800">Emergency Alert</h3>
                <span class="px-3 py-1 text-sm rounded-full font-medium
                    @if($alert->status == 'active') bg-red-100 text-red-600
                    @elseif($alert->status == 'resolved') bg-green-100 text-green-600
                    @else bg-gray-100 text-gray-600 @endif">
                    {{ ucfirst(str_replace('_', ' ', $alert->status)) }}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p class="text-xs text-gray-500 uppercase">Type</p>
                    <p class="text-gray-800 font-medium">{{ ucfirst($alert->type ?? 'SOS') }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 uppercase">Created At</p>
                    <p class="text-gray-800">{{ $alert->created_at->format('M d, Y H:i:s') }}</p>
                </div>
            </div>

            <div class="mb-6">
                <p class="text-xs text-gray-500 uppercase mb-2">Location</p>
                <p class="text-gray-800">{{ $alert->location_address ?? 'Address not available' }}</p>
                @if($alert->latitude && $alert->longitude)
                    <p class="text-sm text-gray-500">Coordinates: {{ $alert->latitude }}, {{ $alert->longitude }}</p>
                    <a href="https://www.google.com/maps?q={{ $alert->latitude }},{{ $alert->longitude }}" target="_blank" class="inline-block mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">
                        <i class="fas fa-map-marker-alt mr-2"></i>Open in Google Maps
                    </a>
                @endif
            </div>

            @if($alert->message)
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500 uppercase mb-1">User Message</p>
                    <p class="text-gray-800">{{ $alert->message }}</p>
                </div>
            @endif

            @if($alert->resolution_note)
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-xs text-green-600 uppercase mb-1">Resolution Note</p>
                    <p class="text-gray-800">{{ $alert->resolution_note }}</p>
                    <p class="text-xs text-gray-500 mt-2">Resolved: {{ $alert->resolved_at ? $alert->resolved_at->format('M d, Y H:i') : '-' }}</p>
                </div>
            @endif

            @if($alert->status == 'active')
            <div class="mt-6 pt-6 border-t">
                <h4 class="font-medium text-gray-800 mb-4">Actions</h4>
                <div class="flex flex-wrap gap-3 mb-4">
                    <form action="{{ route('admin.sos.notify-contacts', $alert->id) }}" method="POST">
                        @csrf
                        <button class="px-4 py-2 {{ $alert->contacts_notified ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white' }} rounded-lg text-sm">
                            <i class="fas fa-phone mr-2"></i>{{ $alert->contacts_notified ? 'Contacts Notified' : 'Notify Emergency Contacts' }}
                        </button>
                    </form>
                    <form action="{{ route('admin.sos.notify-police', $alert->id) }}" method="POST">
                        @csrf
                        <button class="px-4 py-2 {{ $alert->police_notified ? 'bg-gray-200 text-gray-600' : 'bg-red-600 text-white' }} rounded-lg text-sm">
                            <i class="fas fa-shield-alt mr-2"></i>{{ $alert->police_notified ? 'Police Notified' : 'Notify Police' }}
                        </button>
                    </form>
                </div>

                <form action="{{ route('admin.sos.resolve', $alert->id) }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="block text-sm text-gray-600 mb-1">Resolution Note *</label>
                        <textarea name="resolution_note" rows="3" required class="w-full px-4 py-2 border rounded-lg" placeholder="Describe how this was resolved..."></textarea>
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg">
                            <i class="fas fa-check mr-2"></i>Mark as Resolved
                        </button>
                        <form action="{{ route('admin.sos.false-alarm', $alert->id) }}" method="POST" class="inline">
                            @csrf
                            <button type="submit" class="px-4 py-2 bg-gray-600 text-white rounded-lg">
                                <i class="fas fa-times mr-2"></i>False Alarm
                            </button>
                        </form>
                    </div>
                </form>
            </div>
            @endif
        </div>
    </div>

    <div class="space-y-6">
        <!-- User Info -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">User</h3>
            <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-blue-500"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">{{ $alert->user->name ?? 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ $alert->user->phone ?? '-' }}</p>
                </div>
            </div>
            <a href="{{ route('admin.users.show', $alert->user_id) }}" class="block text-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">View User</a>
        </div>

        <!-- Emergency Contacts -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Emergency Contacts</h3>
            @forelse($emergencyContacts as $contact)
                <div class="p-3 bg-gray-50 rounded-lg mb-2">
                    <p class="font-medium text-gray-800">{{ $contact->name }}</p>
                    <p class="text-sm text-gray-500">{{ $contact->phone }}</p>
                    <p class="text-xs text-gray-400">{{ $contact->relationship }}</p>
                </div>
            @empty
                <p class="text-gray-500 text-sm">No emergency contacts registered</p>
            @endforelse
        </div>

        <!-- Ride Info -->
        @if($alert->rideRequest)
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Ride Info</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Ride ID</span><span>#{{ $alert->ride_request_id }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Status</span><span>{{ ucfirst(str_replace('_', ' ', $alert->rideRequest->status)) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Driver</span><span>{{ $alert->rideRequest->driver->user->name ?? 'N/A' }}</span></div>
            </div>
            <a href="{{ route('admin.rides.show', $alert->ride_request_id) }}" class="mt-4 block text-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">View Ride</a>
        </div>
        @endif
    </div>
</div>
@endsection
