@extends('admin.layouts.app')

@section('title', 'Dashboard')
@section('subtitle', 'Welcome back! Here\'s what\'s happening with SHAREIDE.')

@section('content')
<!-- Hero Stats Section -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
    <!-- Total Users -->
    <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10"></div>
        <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white/10"></div>
        <div class="relative">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i class="fas fa-users text-white text-xl"></i>
                </div>
                <span class="flex items-center text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                    <i class="fas fa-arrow-up mr-1"></i>+{{ $newUsersToday }}
                </span>
            </div>
            <p class="text-white/80 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-white mt-1">{{ number_format($totalUsers) }}</p>
        </div>
    </div>

    <!-- Total Drivers -->
    <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10"></div>
        <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white/10"></div>
        <div class="relative">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i class="fas fa-car text-white text-xl"></i>
                </div>
                <span class="flex items-center text-xs text-white bg-white/20 px-2 py-1 rounded-full">
                    <span class="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span>
                    {{ $onlineDrivers }} online
                </span>
            </div>
            <p class="text-white/80 text-sm font-medium">Total Drivers</p>
            <p class="text-3xl font-bold text-white mt-1">{{ number_format($totalDrivers) }}</p>
        </div>
    </div>

    <!-- Total Rides -->
    <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10"></div>
        <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white/10"></div>
        <div class="relative">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i class="fas fa-route text-white text-xl"></i>
                </div>
                <span class="flex items-center text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                    {{ $ridesToday }} today
                </span>
            </div>
            <p class="text-white/80 text-sm font-medium">Total Rides</p>
            <p class="text-3xl font-bold text-white mt-1">{{ number_format($totalRides) }}</p>
        </div>
    </div>

    <!-- Total Revenue -->
    <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10"></div>
        <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white/10"></div>
        <div class="relative">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i class="fas fa-coins text-white text-xl"></i>
                </div>
                <span class="flex items-center text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                    <i class="fas fa-chart-line mr-1"></i>Today
                </span>
            </div>
            <p class="text-white/80 text-sm font-medium">Total Revenue</p>
            <p class="text-3xl font-bold text-white mt-1">PKR {{ number_format($totalRevenue) }}</p>
            <p class="text-xs text-white/70 mt-1">+PKR {{ number_format($revenueToday) }} today</p>
        </div>
    </div>
</div>

<!-- Quick Stats Row -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
    <!-- Pending Drivers -->
    <a href="{{ route('admin.drivers.pending') }}" class="group bg-white dark:bg-dark-200 rounded-2xl p-5 border border-gray-100 dark:border-dark-100 hover:border-yellow-300 dark:hover:border-yellow-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 {{ $pendingDrivers > 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-100 dark:bg-dark-100' }} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <i class="fas fa-user-clock {{ $pendingDrivers > 0 ? 'text-white' : 'text-gray-400' }}"></i>
            </div>
            @if($pendingDrivers > 0)
                <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
            @endif
        </div>
        <p class="text-2xl font-bold {{ $pendingDrivers > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-800 dark:text-white' }}">{{ $pendingDrivers }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Pending Drivers</p>
    </a>

    <!-- Active Rides -->
    <a href="{{ route('admin.rides.active') }}" class="group bg-white dark:bg-dark-200 rounded-2xl p-5 border border-gray-100 dark:border-dark-100 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <i class="fas fa-car-side text-white"></i>
            </div>
            @if($activeRides > 0)
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            @endif
        </div>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ $activeRides }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Active Rides</p>
    </a>

    <!-- SOS Alerts -->
    <a href="{{ route('admin.sos.active') }}" class="group bg-white dark:bg-dark-200 rounded-2xl p-5 border {{ $activeSOSAlerts > 0 ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-gray-100 dark:border-dark-100' }} hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 {{ $activeSOSAlerts > 0 ? 'bg-gradient-to-br from-red-400 to-red-600 animate-pulse' : 'bg-gray-100 dark:bg-dark-100' }} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <i class="fas fa-exclamation-triangle {{ $activeSOSAlerts > 0 ? 'text-white' : 'text-gray-400' }}"></i>
            </div>
            @if($activeSOSAlerts > 0)
                <span class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">!</span>
            @endif
        </div>
        <p class="text-2xl font-bold {{ $activeSOSAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white' }}">{{ $activeSOSAlerts }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">SOS Alerts</p>
    </a>

    <!-- Pending Withdrawals -->
    <a href="{{ route('admin.payments.withdrawals') }}" class="group bg-white dark:bg-dark-200 rounded-2xl p-5 border border-gray-100 dark:border-dark-100 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 {{ $pendingWithdrawals > 0 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gray-100 dark:bg-dark-100' }} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <i class="fas fa-wallet {{ $pendingWithdrawals > 0 ? 'text-white' : 'text-gray-400' }}"></i>
            </div>
        </div>
        <p class="text-2xl font-bold {{ $pendingWithdrawals > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-white' }}">{{ $pendingWithdrawals }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Withdrawals</p>
    </a>

    <!-- Commission -->
    <div class="group bg-white dark:bg-dark-200 rounded-2xl p-5 border border-gray-100 dark:border-dark-100 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <i class="fas fa-percentage text-white"></i>
            </div>
        </div>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ number_format($totalCommission) }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Commission (PKR)</p>
    </div>
</div>

<!-- Charts Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Rides Chart -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-dark-100 bg-gradient-to-r from-gray-50 to-white dark:from-dark-300 dark:to-dark-200">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Rides Overview</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Last 7 days performance</p>
                </div>
                <div class="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                    <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></span>
                    <span class="text-sm font-medium text-yellow-700 dark:text-yellow-400">Rides</span>
                </div>
            </div>
        </div>
        <div class="p-6">
            <canvas id="ridesChart" height="220"></canvas>
        </div>
    </div>

    <!-- Revenue Chart -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-dark-100 bg-gradient-to-r from-gray-50 to-white dark:from-dark-300 dark:to-dark-200">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Last 7 days earnings</p>
                </div>
                <div class="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                    <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></span>
                    <span class="text-sm font-medium text-green-700 dark:text-green-400">Revenue</span>
                </div>
            </div>
        </div>
        <div class="p-6">
            <canvas id="revenueChart" height="220"></canvas>
        </div>
    </div>
</div>

<!-- Tables Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Pending Drivers -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-dark-100 bg-gradient-to-r from-yellow-50 to-white dark:from-dark-300 dark:to-dark-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                        <i class="fas fa-user-clock text-white"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white">Pending Approvals</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Drivers awaiting review</p>
                    </div>
                </div>
                <a href="{{ route('admin.drivers.pending') }}" class="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View All <i class="fas fa-arrow-right text-xs"></i>
                </a>
            </div>
        </div>
        <div class="p-5">
            @forelse($pendingDriversList as $driver)
                <div class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-100 rounded-xl transition-colors mb-2 last:mb-0 border border-transparent hover:border-gray-100 dark:hover:border-dark-100">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                            {{ strtoupper(substr($driver->user->name ?? 'D', 0, 1)) }}
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">{{ $driver->user->name ?? 'N/A' }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-300">
                                    {{ $driver->vehicle_type }}
                                </span>
                                <span>{{ $driver->city }}</span>
                            </p>
                        </div>
                    </div>
                    <a href="{{ route('admin.drivers.show', $driver->id) }}" class="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow-md">
                        Review
                    </a>
                </div>
            @empty
                <div class="text-center py-10">
                    <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <i class="fas fa-check text-green-500 text-2xl"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">All caught up!</p>
                    <p class="text-sm text-gray-400 dark:text-gray-500">No pending drivers</p>
                </div>
            @endforelse
        </div>
    </div>

    <!-- Recent Rides -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-dark-100 bg-gradient-to-r from-purple-50 to-white dark:from-dark-300 dark:to-dark-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 bg-gradient-to-br from-purple-400 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                        <i class="fas fa-history text-white"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white">Recent Rides</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Latest activity</p>
                    </div>
                </div>
                <a href="{{ route('admin.rides.index') }}" class="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View All <i class="fas fa-arrow-right text-xs"></i>
                </a>
            </div>
        </div>
        <div class="p-5">
            @forelse($recentRides as $ride)
                <div class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-100 rounded-xl transition-colors mb-2 last:mb-0 border border-transparent hover:border-gray-100 dark:hover:border-dark-100">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm
                            @if($ride->status == 'completed') bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30
                            @elseif($ride->status == 'in_progress') bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30
                            @else bg-gray-100 dark:bg-dark-100 @endif">
                            <i class="fas fa-car
                                @if($ride->status == 'completed') text-green-500
                                @elseif($ride->status == 'in_progress') text-blue-500
                                @else text-gray-400 @endif text-lg"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">{{ $ride->rider->name ?? 'N/A' }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ Str::limit($ride->pickup_address, 28) }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-1 text-xs rounded-lg font-semibold
                            @if($ride->status == 'completed') bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400
                            @elseif($ride->status == 'in_progress') bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                            @elseif(str_contains($ride->status, 'cancelled')) bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400
                            @else bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 @endif">
                            {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                        </span>
                        <p class="text-sm font-bold text-gray-900 dark:text-white mt-1">PKR {{ number_format($ride->estimated_price ?? 0) }}</p>
                    </div>
                </div>
            @empty
                <div class="text-center py-10">
                    <div class="w-16 h-16 bg-gray-100 dark:bg-dark-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <i class="fas fa-car text-gray-400 text-2xl"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">No recent rides</p>
                    <p class="text-sm text-gray-400 dark:text-gray-500">Rides will appear here</p>
                </div>
            @endforelse
        </div>
    </div>
</div>

<!-- SOS Alerts Section -->
@if($activeSOSAlerts > 0)
<div class="mt-8 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-lg">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
            </div>
            <div>
                <h3 class="text-xl font-bold text-red-800 dark:text-red-300">Emergency Alerts</h3>
                <p class="text-sm text-red-600 dark:text-red-400">{{ $activeSOSAlerts }} alert(s) require immediate attention</p>
            </div>
        </div>
        <a href="{{ route('admin.sos.active') }}" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
            <i class="fas fa-eye"></i> View All Alerts
        </a>
    </div>
    <div class="grid gap-4">
        @foreach($recentSOSAlerts as $alert)
            <div class="bg-white dark:bg-dark-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-red-100 dark:border-red-800/50 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-xl flex items-center justify-center">
                        <i class="fas fa-user text-red-500 text-lg"></i>
                    </div>
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white">{{ $alert->user->name ?? 'Unknown User' }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $alert->location_address ?? 'Location not available' }}</p>
                        <p class="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                            <i class="fas fa-clock"></i>{{ $alert->created_at->diffForHumans() }}
                        </p>
                    </div>
                </div>
                <a href="{{ route('admin.sos.show', $alert->id) }}" class="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
                    <i class="fas fa-phone-alt"></i> Respond Now
                </a>
            </div>
        @endforeach
    </div>
</div>
@endif
@endsection

@push('scripts')
<script>
    // Chart.js Configuration
    Chart.defaults.font.family = 'Sora, sans-serif';
    Chart.defaults.color = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';

    // Rides Chart
    const ridesCtx = document.getElementById('ridesChart').getContext('2d');
    const ridesGradient = ridesCtx.createLinearGradient(0, 0, 0, 220);
    ridesGradient.addColorStop(0, 'rgba(255, 193, 7, 0.4)');
    ridesGradient.addColorStop(1, 'rgba(255, 193, 7, 0.0)');

    new Chart(ridesCtx, {
        type: 'line',
        data: {
            labels: @json($chartLabels),
            datasets: [{
                label: 'Rides',
                data: @json($ridesData),
                borderColor: '#f59e0b',
                backgroundColor: ridesGradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#f59e0b',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        drawBorder: false
                    },
                    ticks: { padding: 10 }
                },
                x: {
                    grid: { display: false },
                    ticks: { padding: 10 }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    const revenueGradient = revenueCtx.createLinearGradient(0, 0, 0, 220);
    revenueGradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
    revenueGradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');

    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: @json($chartLabels),
            datasets: [{
                label: 'Revenue (PKR)',
                data: @json($revenueData),
                backgroundColor: revenueGradient,
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 32,
                maxBarThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'PKR ' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        padding: 10,
                        callback: function(value) {
                            return 'PKR ' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { padding: 10 }
                }
            }
        }
    });
</script>
@endpush
