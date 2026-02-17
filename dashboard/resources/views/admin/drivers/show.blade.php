@extends('admin.layouts.app')

@section('title', 'Driver Details')
@section('subtitle', $driver->user->name ?? 'Driver #' . $driver->id)

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Info -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center space-x-4">
                    @if($driver->documents && $driver->documents->selfie_with_nic)
                        <img src="{{ asset('storage/' . $driver->documents->selfie_with_nic) }}"
                            alt="Driver Photo" class="w-20 h-20 rounded-full object-cover border-4 border-primary">
                    @else
                        <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="ti ti-user text-gray-500 text-3xl"></i>
                        </div>
                    @endif
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ $driver->user->name ?? 'N/A' }}</h2>
                        <p class="text-gray-500">{{ $driver->user->phone ?? 'N/A' }}</p>
                        <p class="text-sm text-gray-400">{{ $driver->user->email ?? '-' }}</p>
                        @if($driver->cnic)
                            <p class="text-sm text-gray-500 mt-1">
                                <i class="ti ti-id mr-1"></i>CNIC: {{ $driver->cnic }}
                            </p>
                        @endif
                    </div>
                </div>
                <div class="text-right">
                    @if($driver->status == 'approved')
                        <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                            <i class="ti ti-circle-check mr-1"></i>Approved
                        </span>
                        @if($driver->is_online)
                            <p class="mt-2"><span class="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse mr-1"></span>Online</p>
                        @endif
                    @elseif($driver->status == 'pending')
                        <span class="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                            <i class="ti ti-clock mr-1"></i>Pending
                        </span>
                    @elseif($driver->status == 'rejected')
                        <span class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                            <i class="ti ti-circle-x mr-1"></i>Rejected
                        </span>
                    @else
                        <span class="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium">
                            <i class="ti ti-ban mr-1"></i>Blocked
                        </span>
                    @endif
                </div>
            </div>

            <!-- Ban Info -->
            @if($driver->status == 'blocked' && $driver->ban_reason)
                <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p class="text-sm font-medium text-red-800 dark:text-red-400">
                        <i class="ti ti-alert-triangle mr-2"></i>Blocked on {{ $driver->banned_at ? $driver->banned_at->format('M d, Y H:i') : 'N/A' }}
                    </p>
                    <p class="text-red-600 dark:text-red-400 mt-1">{{ $driver->ban_reason }}</p>
                </div>
            @endif

            <!-- Vehicle Info -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                    <p class="text-xs text-gray-500 uppercase">Vehicle Type</p>
                    <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        <i class="fas {{ $driver->vehicle_type == 'car' ? 'fa-car' : 'fa-motorcycle' }} mr-1"></i>
                        {{ ucfirst($driver->vehicle_type) }}
                    </p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                    <p class="text-xs text-gray-500 uppercase">Vehicle Model</p>
                    <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ $driver->vehicle_model ?? '-' }}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                    <p class="text-xs text-gray-500 uppercase">Plate Number</p>
                    <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ $driver->plate_number }}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                    <p class="text-xs text-gray-500 uppercase">City / Seats</p>
                    <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ $driver->city }} / {{ $driver->seats }}</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex flex-wrap gap-3">
                @if($driver->status == 'pending')
                    <form action="{{ route('admin.drivers.approve', $driver->id) }}" method="POST" class="inline" onsubmit="return confirm('Approve this driver?')">
                        @csrf
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="ti ti-check mr-2"></i>Approve Driver
                        </button>
                    </form>
                    <button onclick="openRejectModal()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="ti ti-x mr-2"></i>Reject Driver
                    </button>
                @elseif($driver->status == 'approved')
                    <button onclick="openBlockModal()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="ti ti-ban mr-2"></i>Block Driver
                    </button>
                @elseif($driver->status == 'blocked')
                    <form action="{{ route('admin.drivers.unblock', $driver->id) }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="ti ti-lock-open mr-2"></i>Unblock Driver
                        </button>
                    </form>
                @endif
                <a href="{{ route('admin.drivers.documents', $driver->id) }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <i class="ti ti-file-text mr-2"></i>View All Documents
                </a>
            </div>
        </div>

        <!-- CNIC & Identity Documents -->
        @if($driver->documents)
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-id mr-2 text-blue-500"></i>Identity Documents (CNIC)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                @foreach([
                    ['field' => 'nic_front', 'label' => 'CNIC Front'],
                    ['field' => 'nic_back', 'label' => 'CNIC Back'],
                    ['field' => 'selfie_with_nic', 'label' => 'Selfie with CNIC'],
                ] as $doc)
                    <div class="border dark:border-dark-100 rounded-lg overflow-hidden">
                        <div class="p-2 bg-gray-50 dark:bg-dark-100 border-b dark:border-dark-100">
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $doc['label'] }}</p>
                        </div>
                        @if($driver->documents->{$doc['field']})
                            <a href="{{ asset('storage/' . $driver->documents->{$doc['field']}) }}" target="_blank" class="block">
                                <img src="{{ asset('storage/' . $driver->documents->{$doc['field']}) }}"
                                    alt="{{ $doc['label'] }}" class="w-full h-40 object-cover hover:opacity-80 transition">
                            </a>
                        @else
                            <div class="w-full h-40 bg-gray-100 dark:bg-dark-100 flex items-center justify-center">
                                <span class="text-gray-400 text-sm">Not uploaded</span>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>

        <!-- License Documents -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-id-badge mr-2 text-green-500"></i>License Documents
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach([
                    ['field' => 'license_front', 'label' => 'License Front'],
                    ['field' => 'license_back', 'label' => 'License Back'],
                ] as $doc)
                    <div class="border dark:border-dark-100 rounded-lg overflow-hidden">
                        <div class="p-2 bg-gray-50 dark:bg-dark-100 border-b dark:border-dark-100">
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $doc['label'] }}</p>
                        </div>
                        @if($driver->documents->{$doc['field']})
                            <a href="{{ asset('storage/' . $driver->documents->{$doc['field']}) }}" target="_blank" class="block">
                                <img src="{{ asset('storage/' . $driver->documents->{$doc['field']}) }}"
                                    alt="{{ $doc['label'] }}" class="w-full h-40 object-cover hover:opacity-80 transition">
                            </a>
                        @else
                            <div class="w-full h-40 bg-gray-100 dark:bg-dark-100 flex items-center justify-center">
                                <span class="text-gray-400 text-sm">Not uploaded</span>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Vehicle Documents & Images -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-car mr-2 text-purple-500"></i>Vehicle Documents & Images
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @foreach([
                    ['field' => 'vehicle_registration', 'label' => 'Registration'],
                    ['field' => 'vehicle_front', 'label' => 'Vehicle Front'],
                    ['field' => 'vehicle_back', 'label' => 'Vehicle Back'],
                    ['field' => 'vehicle_interior', 'label' => 'Interior'],
                    ['field' => 'vehicle_with_plate', 'label' => 'With Plate'],
                ] as $doc)
                    <div class="border dark:border-dark-100 rounded-lg overflow-hidden">
                        <div class="p-2 bg-gray-50 dark:bg-dark-100 border-b dark:border-dark-100">
                            <p class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ $doc['label'] }}</p>
                        </div>
                        @if($driver->documents->{$doc['field']})
                            <a href="{{ asset('storage/' . $driver->documents->{$doc['field']}) }}" target="_blank" class="block">
                                <img src="{{ asset('storage/' . $driver->documents->{$doc['field']}) }}"
                                    alt="{{ $doc['label'] }}" class="w-full h-28 object-cover hover:opacity-80 transition">
                            </a>
                        @else
                            <div class="w-full h-28 bg-gray-100 dark:bg-dark-100 flex items-center justify-center">
                                <span class="text-gray-400 text-xs">Not uploaded</span>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Live Selfie Verifications -->
        @if($driver->liveSelfieVerifications && $driver->liveSelfieVerifications->count() > 0)
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-camera mr-2 text-orange-500"></i>Live Selfie Verifications
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @foreach($driver->liveSelfieVerifications()->latest()->take(8)->get() as $verification)
                    <div class="border dark:border-dark-100 rounded-lg overflow-hidden">
                        <a href="{{ asset('storage/' . $verification->selfie_image) }}" target="_blank" class="block">
                            <img src="{{ asset('storage/' . $verification->selfie_image) }}"
                                alt="Live Selfie" class="w-full h-28 object-cover hover:opacity-80 transition">
                        </a>
                        <div class="p-2 bg-gray-50 dark:bg-dark-100 text-xs">
                            <p class="text-gray-600 dark:text-gray-400">{{ $verification->created_at->format('M d, H:i') }}</p>
                            <span class="px-1.5 py-0.5 rounded text-xs {{ $verification->status == 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600' }}">
                                {{ ucfirst($verification->status) }}
                            </span>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Recent Rides -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Rides</h3>
            <div class="space-y-3">
                @forelse($recentRides as $ride)
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                        <div>
                            <p class="font-medium text-gray-800 dark:text-white">{{ $ride->rider->name ?? 'Unknown Rider' }}</p>
                            <p class="text-sm text-gray-500">{{ Str::limit($ride->pickup_address, 40) }} &rarr; {{ Str::limit($ride->drop_address, 40) }}</p>
                            <p class="text-xs text-gray-400">{{ $ride->created_at->format('M d, Y H:i') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-800 dark:text-white">PKR {{ number_format($ride->actual_price ?? $ride->estimated_price) }}</p>
                            <span class="px-2 py-0.5 text-xs rounded-full
                                @if($ride->status == 'completed') bg-green-100 text-green-600
                                @elseif(str_contains($ride->status, 'cancelled')) bg-red-100 text-red-600
                                @else bg-blue-100 text-blue-600 @endif">
                                {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                            </span>
                        </div>
                    </div>
                @empty
                    <p class="text-gray-500 text-center py-4">No rides yet</p>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
        <!-- Stats -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Statistics</h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Total Rides</span>
                    <span class="font-semibold text-gray-800 dark:text-white">{{ $rideStats['total'] }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Completed</span>
                    <span class="font-semibold text-green-600">{{ $rideStats['completed'] }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Cancelled</span>
                    <span class="font-semibold text-red-600">{{ $rideStats['cancelled'] }}</span>
                </div>
                <hr class="dark:border-dark-100">
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Rating</span>
                    <span class="font-semibold text-yellow-600">
                        <i class="ti ti-star"></i> {{ number_format($driver->rating_average, 1) }}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Total Earnings</span>
                    <span class="font-semibold text-green-600">PKR {{ number_format($rideStats['total_earnings']) }}</span>
                </div>
            </div>
        </div>

        <!-- Wallet -->
        @if($driver->wallet)
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Wallet</h3>
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                <p class="text-sm text-gray-500">Current Balance</p>
                <p class="text-2xl font-bold text-green-600">PKR {{ number_format($driver->wallet->balance) }}</p>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Total Earned</span>
                    <span class="text-gray-800 dark:text-white">PKR {{ number_format($driver->wallet->total_earned) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Total Withdrawn</span>
                    <span class="text-gray-800 dark:text-white">PKR {{ number_format($driver->wallet->total_withdrawn) }}</span>
                </div>
            </div>
        </div>
        @endif

        <!-- Online Status -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Online Status</h3>
            <div class="flex items-center">
                @if($driver->is_online)
                    <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
                    <span class="text-green-600 font-medium">Currently Online</span>
                @else
                    <span class="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
                    <span class="text-gray-500">Offline</span>
                @endif
            </div>
            @if($driver->current_lat && $driver->current_lng)
                <p class="text-xs text-gray-400 mt-2">
                    Last location: {{ $driver->current_lat }}, {{ $driver->current_lng }}
                </p>
            @endif
        </div>

        <!-- Registration Info -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Registration Info</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Joined</span>
                    <span class="text-gray-800 dark:text-white">{{ $driver->created_at->format('M d, Y') }}</span>
                </div>
                @if($driver->cnic)
                <div class="flex justify-between">
                    <span class="text-gray-500">CNIC</span>
                    <span class="text-gray-800 dark:text-white font-mono">{{ $driver->cnic }}</span>
                </div>
                @endif
                <div class="flex justify-between">
                    <span class="text-gray-500">Driver ID</span>
                    <span class="text-gray-800 dark:text-white">#{{ $driver->id }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">User ID</span>
                    <span class="text-gray-800 dark:text-white">#{{ $driver->user_id }}</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Reject Driver Application</h3>
            <form action="{{ route('admin.drivers.reject', $driver->id) }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Rejection Reason *</label>
                    <textarea name="rejection_reason" rows="4" required
                        class="w-full px-4 py-2 border dark:border-dark-100 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-dark-100 dark:text-white"
                        placeholder="Please provide a reason..."></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="closeRejectModal()" class="px-4 py-2 bg-gray-200 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Block Modal -->
<div id="blockModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-ban text-red-500 mr-2"></i>Block Driver
            </h3>
            <form action="{{ route('admin.drivers.block', $driver->id) }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Block Reason *</label>
                    <textarea name="reason" rows="3" required
                        class="w-full px-4 py-2 border dark:border-dark-100 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-dark-100 dark:text-white"
                        placeholder="Reason for blocking..."></textarea>
                </div>

                @if($driver->cnic)
                <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="ban_cnic" value="1" class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500">
                        <span class="ml-3">
                            <span class="text-sm font-medium text-red-800 dark:text-red-400">Ban CNIC Permanently</span>
                            <p class="text-xs text-red-600 dark:text-red-500">CNIC: {{ $driver->cnic }}</p>
                            <p class="text-xs text-red-600 dark:text-red-500">This person will not be able to register again with this CNIC</p>
                        </span>
                    </label>
                </div>
                @else
                <div class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p class="text-xs text-yellow-700 dark:text-yellow-400">
                        <i class="ti ti-info-circle mr-1"></i>No CNIC on file - cannot permanently ban
                    </p>
                </div>
                @endif

                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="closeBlockModal()" class="px-4 py-2 bg-gray-200 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <i class="ti ti-ban mr-1"></i>Block Driver
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function openRejectModal() {
        document.getElementById('rejectModal').classList.remove('hidden');
    }
    function closeRejectModal() {
        document.getElementById('rejectModal').classList.add('hidden');
    }
    function openBlockModal() {
        document.getElementById('blockModal').classList.remove('hidden');
    }
    function closeBlockModal() {
        document.getElementById('blockModal').classList.add('hidden');
    }
</script>
@endpush
@endsection
