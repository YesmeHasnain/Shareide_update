@extends('admin.layouts.app')

@section('title', 'Live Map')

@section('content')
<div class="h-[calc(100vh-80px)] flex flex-col">
    <!-- Top Bar -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Live Fleet Map
                </h1>
            </div>
            <!-- Connection Status -->
            <div id="connectionStatus" class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" id="statusDot"></span>
                <span class="text-xs font-medium text-gray-600" id="statusText">Connecting...</span>
            </div>
        </div>

        <!-- Stats Pills -->
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                </div>
                <div>
                    <p class="text-lg font-bold text-green-700" id="statDrivers">{{ $stats['online_drivers'] }}</p>
                    <p class="text-xs text-green-600">Online</p>
                </div>
            </div>

            <div class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <p class="text-lg font-bold text-blue-700" id="statRides">{{ $stats['active_rides'] }}</p>
                    <p class="text-xs text-blue-600">Active</p>
                </div>
            </div>

            <div class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div>
                    <p class="text-lg font-bold text-amber-700" id="statSearching">{{ $stats['searching_rides'] }}</p>
                    <p class="text-xs text-amber-600">Searching</p>
                </div>
            </div>

            @if($stats['active_sos'] > 0)
            <div class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-red-50 rounded-xl border border-red-300 animate-pulse">
                <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                    <p class="text-lg font-bold text-red-700" id="statSOS">{{ $stats['active_sos'] }}</p>
                    <p class="text-xs text-red-600">SOS!</p>
                </div>
            </div>
            @endif
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Map Container -->
        <div class="flex-1 relative">
            <!-- Map -->
            <div id="map" class="absolute inset-0"></div>

            <!-- Map Controls Overlay -->
            <div class="absolute top-4 left-4 z-10">
                <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 space-y-2">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Filters</p>

                    <label class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" id="showDrivers" checked class="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Drivers</span>
                    </label>

                    <label class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" id="showRides" checked class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Active Rides</span>
                    </label>

                    <label class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" id="showSOS" checked class="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500">
                        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">SOS Alerts</span>
                    </label>

                    <label class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" id="showZones" class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                        <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Service Zones</span>
                    </label>
                </div>
            </div>

            <!-- Zoom Controls -->
            <div class="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                <button onclick="map.setZoom(map.getZoom() + 1)" class="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
                <button onclick="map.setZoom(map.getZoom() - 1)" class="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                </button>
                <button onclick="centerOnLahore()" class="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" title="Center Map">
                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
            </div>

            <!-- Legend -->
            <div class="absolute bottom-6 left-4 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 px-4 py-3">
                <div class="flex items-center gap-4 text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span class="text-gray-600">Car</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-emerald-400 rounded-full"></div>
                        <span class="text-gray-600">Bike</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span class="text-gray-600">Pickup</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span class="text-gray-600">Dropoff</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        <span class="text-gray-600">SOS</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Side Panel -->
        <div class="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden flex-shrink-0" x-data="{ tab: 'rides' }">
            <!-- Panel Tabs -->
            <div class="flex border-b border-gray-200 flex-shrink-0">
                <button @click="tab = 'rides'" :class="{ 'border-yellow-500 text-yellow-600 bg-yellow-50': tab === 'rides' }" class="flex-1 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors">
                    Active Rides
                </button>
                <button @click="tab = 'sos'" :class="{ 'border-red-500 text-red-600 bg-red-50': tab === 'sos' }" class="flex-1 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors relative">
                    SOS Alerts
                    @if($stats['active_sos'] > 0)
                    <span class="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{{ $stats['active_sos'] }}</span>
                    @endif
                </button>
            </div>

            <!-- Panel Content -->
            <div class="flex-1 overflow-y-auto">
                <!-- Rides Panel -->
                <div x-show="tab === 'rides'" class="p-3 space-y-3">
                    @forelse($activeRides as $ride)
                    <div class="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer" onclick="focusOnRide({{ $ride['pickup_lat'] }}, {{ $ride['pickup_lng'] }})">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-bold text-gray-400">#{{ $ride['id'] }}</span>
                            <span class="px-2 py-0.5 text-xs font-medium rounded-full
                                @if($ride['status'] === 'in_progress') bg-green-100 text-green-700
                                @elseif($ride['status'] === 'driver_assigned') bg-blue-100 text-blue-700
                                @elseif($ride['status'] === 'driver_arrived') bg-purple-100 text-purple-700
                                @else bg-gray-100 text-gray-700
                                @endif">
                                {{ ucfirst(str_replace('_', ' ', $ride['status'])) }}
                            </span>
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-start gap-2">
                                <div class="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <p class="text-xs text-gray-600 line-clamp-1">{{ $ride['pickup_address'] }}</p>
                            </div>
                            <div class="flex items-start gap-2">
                                <div class="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <p class="text-xs text-gray-600 line-clamp-1">{{ $ride['drop_address'] }}</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span class="text-xs font-bold text-yellow-700">{{ substr($ride['driver_name'] ?? 'D', 0, 1) }}</span>
                                </div>
                                <span class="text-xs text-gray-600">{{ $ride['driver_name'] ?? 'Searching...' }}</span>
                            </div>
                            <span class="text-sm font-bold text-green-600">Rs. {{ number_format($ride['fare']) }}</span>
                        </div>
                    </div>
                    @empty
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        </div>
                        <p class="text-sm text-gray-500">No active rides</p>
                    </div>
                    @endforelse
                </div>

                <!-- SOS Panel -->
                <div x-show="tab === 'sos'" class="p-3 space-y-3">
                    @forelse($activeSOS as $sos)
                    <div class="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-200 p-3 cursor-pointer" onclick="focusOnSOS({{ $sos['lat'] }}, {{ $sos['lng'] }})">
                        <div class="flex items-center gap-2 mb-2">
                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <div>
                                <p class="font-semibold text-red-800">{{ $sos['user_name'] }}</p>
                                <p class="text-xs text-red-600">{{ $sos['created_at'] }}</p>
                            </div>
                        </div>
                        <p class="text-xs text-gray-600 mb-3">{{ $sos['address'] ?? 'Location unknown' }}</p>
                        <a href="{{ route('admin.sos.show', $sos['id']) }}" class="block w-full text-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
                            Respond Now
                        </a>
                    </div>
                    @empty
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p class="text-sm text-gray-500">No active alerts</p>
                        <p class="text-xs text-gray-400">All clear!</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div id="toastContainer" class="fixed bottom-4 right-96 z-50 space-y-2"></div>

@push('scripts')
<!-- Pusher for realtime updates -->
<script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
<script>
    let map;
    let markers = { drivers: {}, rides: {}, sos: {} };
    let routeLines = {};
    let zones = [];
    let infoWindow;

    // Data from backend
    let driversData = {!! json_encode($onlineDrivers) !!};
    let ridesData = {!! json_encode($activeRides) !!};
    let sosData = {!! json_encode($activeSOS) !!};
    const zonesData = {!! json_encode($serviceZones) !!};

    // Custom map style - Dark elegant theme
    const mapStyle = [
        { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
        { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
        { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
        { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
        { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
        { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
        { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
        { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
        { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
        { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
        { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
        { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
        { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
    ];

    // Initialize map
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 31.5204, lng: 74.3587 }, // Lahore
            zoom: 13,
            styles: mapStyle,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        infoWindow = new google.maps.InfoWindow();

        // Add markers
        addDriverMarkers();
        addRideMarkers();
        addSOSMarkers();

        // Setup filters
        document.getElementById('showDrivers').addEventListener('change', updateVisibility);
        document.getElementById('showRides').addEventListener('change', updateVisibility);
        document.getElementById('showSOS').addEventListener('change', updateVisibility);
        document.getElementById('showZones').addEventListener('change', updateVisibility);

        // Setup Pusher for realtime
        setupPusher();

        // Update connection status
        updateConnectionStatus('connected');
    }

    // Create custom marker icons
    function createDriverIcon(vehicleType, isActive = true) {
        const color = vehicleType === 'bike' ? '#10B981' : '#22C55E';
        const size = vehicleType === 'bike' ? 32 : 40;

        return {
            url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
                    <path fill="white" transform="translate(10, 10)" d="M10 2L4 6v2h2v6h8V8h2V6l-6-4zm-3 8v-2h2v2H7zm4 0v-2h2v2h-2z"/>
                </svg>
            `)}`,
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size/2, size/2),
        };
    }

    function createPickupIcon() {
        return {
            url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="#3B82F6" stroke="white" stroke-width="3"/>
                    <circle cx="18" cy="18" r="6" fill="white"/>
                </svg>
            `)}`,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18),
        };
    }

    function createDropoffIcon() {
        return {
            url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="#F97316" stroke="white" stroke-width="3"/>
                    <rect x="14" y="10" width="8" height="16" rx="2" fill="white"/>
                </svg>
            `)}`,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18),
        };
    }

    function createSOSIcon() {
        return {
            url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="20" fill="#EF4444" stroke="white" stroke-width="4">
                        <animate attributeName="r" values="18;22;18" dur="1s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="1;0.7;1" dur="1s" repeatCount="indefinite"/>
                    </circle>
                    <text x="24" y="30" text-anchor="middle" fill="white" font-weight="bold" font-size="14">SOS</text>
                </svg>
            `)}`,
            scaledSize: new google.maps.Size(48, 48),
            anchor: new google.maps.Point(24, 24),
        };
    }

    // Add driver markers
    function addDriverMarkers() {
        driversData.forEach(driver => {
            if (!driver.lat || !driver.lng) return;

            const marker = new google.maps.Marker({
                position: { lat: parseFloat(driver.lat), lng: parseFloat(driver.lng) },
                map: map,
                icon: createDriverIcon(driver.vehicle_type),
                title: driver.name,
                animation: google.maps.Animation.DROP,
            });

            marker.addListener('click', () => showDriverInfo(marker, driver));
            markers.drivers[driver.id] = marker;
        });
    }

    // Add ride markers
    function addRideMarkers() {
        ridesData.forEach(ride => {
            // Pickup marker
            const pickupMarker = new google.maps.Marker({
                position: { lat: parseFloat(ride.pickup_lat), lng: parseFloat(ride.pickup_lng) },
                map: map,
                icon: createPickupIcon(),
                title: `Pickup: ${ride.pickup_address}`,
            });

            // Dropoff marker
            const dropoffMarker = new google.maps.Marker({
                position: { lat: parseFloat(ride.drop_lat), lng: parseFloat(ride.drop_lng) },
                map: map,
                icon: createDropoffIcon(),
                title: `Dropoff: ${ride.drop_address}`,
            });

            // Route line
            const routePath = new google.maps.Polyline({
                path: [
                    { lat: parseFloat(ride.pickup_lat), lng: parseFloat(ride.pickup_lng) },
                    { lat: parseFloat(ride.drop_lat), lng: parseFloat(ride.drop_lng) }
                ],
                geodesic: true,
                strokeColor: '#FBBF24',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                map: map,
            });

            pickupMarker.addListener('click', () => showRideInfo(pickupMarker, ride));
            dropoffMarker.addListener('click', () => showRideInfo(dropoffMarker, ride));

            markers.rides[ride.id] = { pickup: pickupMarker, dropoff: dropoffMarker, route: routePath };
        });
    }

    // Add SOS markers
    function addSOSMarkers() {
        sosData.forEach(sos => {
            if (!sos.lat || !sos.lng) return;

            const marker = new google.maps.Marker({
                position: { lat: parseFloat(sos.lat), lng: parseFloat(sos.lng) },
                map: map,
                icon: createSOSIcon(),
                title: `SOS: ${sos.user_name}`,
                zIndex: 1000,
            });

            marker.addListener('click', () => showSOSInfo(marker, sos));
            markers.sos[sos.id] = marker;
        });
    }

    // Info windows
    function showDriverInfo(marker, driver) {
        const content = `
            <div class="p-3 min-w-[220px]">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span class="text-lg font-bold text-green-700">${driver.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">${driver.name}</h4>
                        <p class="text-sm text-gray-500">${driver.phone || 'N/A'}</p>
                    </div>
                </div>
                <div class="space-y-1 text-sm">
                    <p><span class="text-gray-500">Vehicle:</span> <span class="font-medium">${driver.vehicle_model || driver.vehicle_type}</span></p>
                    <p><span class="text-gray-500">Plate:</span> <span class="font-medium">${driver.plate_number || 'N/A'}</span></p>
                    <p><span class="text-gray-500">Rating:</span> <span class="font-medium text-yellow-600">${driver.rating || '4.5'} ⭐</span></p>
                </div>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    }

    function showRideInfo(marker, ride) {
        const statusColors = {
            'in_progress': 'bg-green-100 text-green-700',
            'driver_assigned': 'bg-blue-100 text-blue-700',
            'driver_arrived': 'bg-purple-100 text-purple-700',
            'searching': 'bg-yellow-100 text-yellow-700',
        };
        const statusClass = statusColors[ride.status] || 'bg-gray-100 text-gray-700';

        const content = `
            <div class="p-3 min-w-[250px]">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-gray-400">Ride #${ride.id}</span>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">${ride.status.replace('_', ' ')}</span>
                </div>
                <div class="space-y-2 mb-3">
                    <div class="flex items-start gap-2">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        <p class="text-sm text-gray-600">${ride.pickup_address}</p>
                    </div>
                    <div class="flex items-start gap-2">
                        <div class="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                        <p class="text-sm text-gray-600">${ride.drop_address}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p class="text-sm"><span class="text-gray-500">Driver:</span> <span class="font-medium">${ride.driver_name || 'Searching...'}</span></p>
                    <p class="text-lg font-bold text-green-600">Rs. ${ride.fare}</p>
                </div>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    }

    function showSOSInfo(marker, sos) {
        const content = `
            <div class="p-3 min-w-[220px] bg-red-50">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div>
                        <h4 class="font-bold text-red-800">SOS ALERT</h4>
                        <p class="text-sm text-red-600">${sos.user_name}</p>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-3">${sos.address || 'Location unknown'}</p>
                <a href="/admin/sos/${sos.id}" class="block w-full text-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">
                    Respond Now
                </a>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    }

    // Visibility control
    function updateVisibility() {
        const showDrivers = document.getElementById('showDrivers').checked;
        const showRides = document.getElementById('showRides').checked;
        const showSOS = document.getElementById('showSOS').checked;

        Object.values(markers.drivers).forEach(m => m.setVisible(showDrivers));
        Object.values(markers.rides).forEach(r => {
            r.pickup.setVisible(showRides);
            r.dropoff.setVisible(showRides);
            r.route.setVisible(showRides);
        });
        Object.values(markers.sos).forEach(m => m.setVisible(showSOS));
    }

    // Focus functions
    function focusOnRide(lat, lng) {
        map.panTo({ lat: parseFloat(lat), lng: parseFloat(lng) });
        map.setZoom(15);
    }

    function focusOnSOS(lat, lng) {
        map.panTo({ lat: parseFloat(lat), lng: parseFloat(lng) });
        map.setZoom(16);
    }

    function centerOnLahore() {
        map.panTo({ lat: 31.5204, lng: 74.3587 });
        map.setZoom(13);
    }

    // Pusher setup
    function setupPusher() {
        const pusherKey = '{{ config('broadcasting.connections.pusher.key') }}';
        const pusherCluster = '{{ config('broadcasting.connections.pusher.options.cluster') }}';

        if (!pusherKey || pusherKey === '') {
            updateConnectionStatus('disconnected');
            return;
        }

        try {
            const pusher = new Pusher(pusherKey, {
                cluster: pusherCluster,
                encrypted: true
            });

            // Subscribe to drivers channel
            const driversChannel = pusher.subscribe('drivers');

            driversChannel.bind('driver.status.changed', function(data) {
                console.log('Driver status changed:', data);
                handleDriverStatusChange(data);
                showToast(
                    data.is_online ? 'Driver Online' : 'Driver Offline',
                    data.name + (data.is_online ? ' is now online' : ' went offline'),
                    data.is_online ? 'success' : 'info'
                );
            });

            driversChannel.bind('driver.location.updated', function(data) {
                handleDriverLocationUpdate(data);
            });

            // Subscribe to rides channel
            const ridesChannel = pusher.subscribe('rides');

            ridesChannel.bind('ride.status.changed', function(data) {
                console.log('Ride status changed:', data);
                showToast('Ride Update', `Ride #${data.ride_id} is now ${data.status.replace('_', ' ')}`, 'info');
                refreshStats();
            });

            updateConnectionStatus('connected');

        } catch (error) {
            console.error('Pusher error:', error);
            updateConnectionStatus('error');
        }
    }

    function handleDriverStatusChange(data) {
        if (data.is_online && data.current_lat && data.current_lng) {
            // Add or update marker
            if (markers.drivers[data.driver_id]) {
                markers.drivers[data.driver_id].setPosition({
                    lat: parseFloat(data.current_lat),
                    lng: parseFloat(data.current_lng)
                });
            } else {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(data.current_lat), lng: parseFloat(data.current_lng) },
                    map: map,
                    icon: createDriverIcon(data.vehicle_type),
                    title: data.name,
                    animation: google.maps.Animation.DROP,
                });
                markers.drivers[data.driver_id] = marker;
            }
        } else if (!data.is_online && markers.drivers[data.driver_id]) {
            // Remove marker
            markers.drivers[data.driver_id].setMap(null);
            delete markers.drivers[data.driver_id];
        }

        refreshStats();
    }

    function handleDriverLocationUpdate(data) {
        if (markers.drivers[data.driver_id]) {
            markers.drivers[data.driver_id].setPosition({
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
            });
        }
    }

    function refreshStats() {
        fetch('/admin/map/live-data')
            .then(r => r.json())
            .then(data => {
                document.getElementById('statDrivers').textContent = data.stats.online_drivers;
                document.getElementById('statRides').textContent = data.stats.active_rides;
                document.getElementById('statSearching').textContent = data.stats.searching_rides;
            });
    }

    function updateConnectionStatus(status) {
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');

        const statuses = {
            'connected': { color: 'bg-green-500', text: 'Live' },
            'connecting': { color: 'bg-yellow-500', text: 'Connecting...' },
            'disconnected': { color: 'bg-gray-400', text: 'Offline' },
            'error': { color: 'bg-red-500', text: 'Error' },
        };

        const s = statuses[status] || statuses['disconnected'];
        dot.className = `w-2 h-2 ${s.color} rounded-full ${status === 'connected' ? 'animate-pulse' : ''}`;
        text.textContent = s.text;
    }

    function showToast(title, message, type) {
        const container = document.getElementById('toastContainer');
        const colors = {
            success: 'from-green-500 to-emerald-500',
            error: 'from-red-500 to-rose-500',
            info: 'from-blue-500 to-indigo-500',
        };

        const toast = document.createElement('div');
        toast.className = `bg-gradient-to-r ${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-2xl transform transition-all duration-300 translate-x-full`;
        toast.innerHTML = `
            <p class="font-semibold">${title}</p>
            <p class="text-sm opacity-90">${message}</p>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 50);
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
</script>
<script src="https://maps.googleapis.com/maps/api/js?key={{ config('services.google.maps_key') }}&callback=initMap" async defer></script>
@endpush
@endsection
