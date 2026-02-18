@extends('admin.layouts.app')

@section('title', 'User Details')
@section('subtitle', $user->name ?? 'User #' . $user->id)

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <!-- Profile -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center space-x-4">
                    @if($user->profile_photo)
                        <div class="w-16 h-16 rounded-xl overflow-hidden">
                            <img src="{{ config('app.api_storage_url') }}/{{ $user->profile_photo }}" alt="{{ $user->name }}" class="w-full h-full object-cover">
                        </div>
                    @else
                        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <span class="text-white font-bold text-2xl">{{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}</span>
                        </div>
                    @endif
                    <div>
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white">{{ $user->name ?? 'N/A' }}</h2>
                        <p class="text-gray-500 dark:text-gray-400">{{ $user->phone }}</p>
                        <p class="text-sm text-gray-400 dark:text-gray-500">{{ $user->email ?? '-' }}</p>
                        @if($user->last_ip)
                            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1"><i class="ti ti-world mr-1"></i>IP: <code class="bg-gray-100 dark:bg-dark-100 px-1.5 py-0.5 rounded">{{ $user->last_ip }}</code></p>
                        @endif
                    </div>
                </div>
                @if($user->status == 'active')
                    <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                        <i class="ti ti-circle-check mr-1"></i>Active
                    </span>
                @else
                    <span class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                        <i class="ti ti-ban mr-1"></i>Blocked
                    </span>
                @endif
            </div>

            <div class="flex gap-3">
                @if($user->status == 'active')
                    <form action="{{ route('admin.users.block', $user->id) }}" method="POST" onsubmit="return confirm('Block this user?')">
                        @csrf
                        <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                            <i class="ti ti-ban mr-2"></i>Block User
                        </button>
                    </form>
                @else
                    <form action="{{ route('admin.users.unblock', $user->id) }}" method="POST">
                        @csrf
                        <button class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <i class="ti ti-lock-open mr-2"></i>Unblock
                        </button>
                    </form>
                @endif
            </div>
        </div>

        <!-- Recent Rides -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-car mr-2 text-yellow-500"></i>Recent Rides
            </h3>
            <div class="space-y-3">
                @forelse($recentRides as $ride)
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-300 rounded-lg">
                        <div class="flex-1">
                            <p class="font-medium text-gray-800 dark:text-white">
                                {{ $ride->driver->user->name ?? 'Driver Not Assigned' }}
                            </p>
                            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <i class="ti ti-map-pin text-green-500"></i>
                                <span>{{ Str::limit($ride->pickup_address, 25) }}</span>
                                <i class="ti ti-arrow-right text-xs"></i>
                                <i class="ti ti-map-pin text-red-500"></i>
                                <span>{{ Str::limit($ride->drop_address, 25) }}</span>
                            </div>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                <i class="ti ti-clock mr-1"></i>{{ $ride->created_at->format('M d, Y H:i') }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-800 dark:text-white">PKR {{ number_format($ride->actual_price ?? $ride->estimated_price ?? 0) }}</p>
                            @php
                                $statusColors = [
                                    'completed' => 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                                    'cancelled' => 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                                    'in_progress' => 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                                    'pending' => 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                                ];
                            @endphp
                            <span class="px-2 py-0.5 text-xs rounded-full {{ $statusColors[$ride->status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }}">
                                {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                            </span>
                        </div>
                    </div>
                @empty
                    <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <i class="ti ti-car text-4xl mb-2 opacity-50"></i>
                        <p>No rides yet</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <div class="space-y-6">
        <!-- Stats -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-chart-bar mr-2 text-yellow-500"></i>Statistics
            </h3>
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-gray-400">Total Rides</span>
                    <span class="font-semibold text-gray-800 dark:text-white">{{ $rideStats['total'] ?? 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-gray-400">Completed</span>
                    <span class="font-semibold text-green-600">{{ $rideStats['completed'] ?? 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-gray-400">Cancelled</span>
                    <span class="font-semibold text-red-600">{{ $rideStats['cancelled'] ?? 0 }}</span>
                </div>
                <hr class="border-gray-200 dark:border-dark-100">
                <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-gray-400">Total Spent</span>
                    <span class="font-semibold text-gray-800 dark:text-white">PKR {{ number_format($rideStats['total_spent'] ?? 0) }}</span>
                </div>
            </div>
        </div>

        <!-- Wallet -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-wallet mr-2 text-yellow-500"></i>Wallet
            </h3>
            <div class="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                <p class="text-3xl font-bold text-green-600">PKR {{ number_format($user->riderWallet->balance ?? 0) }}</p>
            </div>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500 dark:text-gray-400">Total Topped Up</span>
                    <span class="text-gray-800 dark:text-white">PKR {{ number_format($user->riderWallet->total_topped_up ?? 0) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500 dark:text-gray-400">Total Spent</span>
                    <span class="text-gray-800 dark:text-white">PKR {{ number_format($user->riderWallet->total_spent ?? 0) }}</span>
                </div>
            </div>
        </div>

        <!-- Emergency Contacts -->
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                <i class="ti ti-phone mr-2 text-red-500"></i>Emergency Contacts
            </h3>
            @forelse($user->emergencyContacts as $contact)
                <div class="p-3 bg-gray-50 dark:bg-dark-300 rounded-lg mb-2">
                    <p class="font-medium text-gray-800 dark:text-white">{{ $contact->name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ $contact->phone }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500">{{ $contact->relationship }}</p>
                </div>
            @empty
                <div class="text-center py-4 text-gray-500 dark:text-gray-400">
                    <i class="ti ti-users-group text-2xl mb-2 opacity-50"></i>
                    <p class="text-sm">No emergency contacts</p>
                </div>
            @endforelse
        </div>
    </div>
</div>
@endsection
