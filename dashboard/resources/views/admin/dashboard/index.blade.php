@extends('admin.layouts.app')

@section('title', 'Dashboard')
@section('subtitle', 'Welcome back! Here\'s what\'s happening with SHAREIDE.')

@section('content')
<!-- Hero Stats Section -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Users -->
    <div class="bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-100 dark:border-dark-100">
        <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <i class="ti ti-users text-blue-600 dark:text-blue-400 text-[18px]"></i>
            </div>
            <span class="text-[11px] text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">+{{ $newUsersToday }} today</span>
        </div>
        <p class="text-[12px] text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
        <p class="text-[20px] font-semibold text-gray-900 dark:text-white mt-0.5">{{ number_format($totalUsers) }}</p>
    </div>

    <!-- Total Drivers -->
    <div class="bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-100 dark:border-dark-100">
        <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <i class="ti ti-car text-emerald-600 dark:text-emerald-400 text-[18px]"></i>
            </div>
            <span class="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                {{ $onlineDrivers }} online
            </span>
        </div>
        <p class="text-[12px] text-gray-500 dark:text-gray-400 font-medium">Total Drivers</p>
        <p class="text-[20px] font-semibold text-gray-900 dark:text-white mt-0.5">{{ number_format($totalDrivers) }}</p>
    </div>

    <!-- Total Rides -->
    <div class="bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-100 dark:border-dark-100">
        <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                <i class="ti ti-route text-violet-600 dark:text-violet-400 text-[18px]"></i>
            </div>
            <span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-dark-100 px-2 py-0.5 rounded-md">{{ $ridesToday }} today</span>
        </div>
        <p class="text-[12px] text-gray-500 dark:text-gray-400 font-medium">Total Rides</p>
        <p class="text-[20px] font-semibold text-gray-900 dark:text-white mt-0.5">{{ number_format($totalRides) }}</p>
    </div>

    <!-- Total Revenue -->
    <div class="bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-100 dark:border-dark-100">
        <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <i class="ti ti-coins text-amber-600 dark:text-amber-400 text-[18px]"></i>
            </div>
            <span class="text-[11px] text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">+PKR {{ number_format($revenueToday) }} today</span>
        </div>
        <p class="text-[12px] text-gray-500 dark:text-gray-400 font-medium">Total Revenue</p>
        <p class="text-[20px] font-semibold text-gray-900 dark:text-white mt-0.5">PKR {{ number_format($totalRevenue) }}</p>
    </div>
</div>

<!-- Quick Stats Row -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
    <!-- Pending Drivers -->
    <a href="{{ route('admin.drivers.pending') }}" class="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-100 dark:border-dark-100 hover:border-gray-200 dark:hover:border-dark-100 transition-all">
        <div class="flex items-center justify-between mb-2.5">
            <div class="w-8 h-8 {{ $pendingDrivers > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-dark-100' }} rounded-lg flex items-center justify-center">
                <i class="ti ti-user-plus {{ $pendingDrivers > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400' }} text-[16px]"></i>
            </div>
            @if($pendingDrivers > 0)
                <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            @endif
        </div>
        <p class="text-[17px] font-semibold {{ $pendingDrivers > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-white' }}">{{ $pendingDrivers }}</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Pending Drivers</p>
    </a>

    <!-- Active Rides -->
    <a href="{{ route('admin.rides.active') }}" class="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-100 dark:border-dark-100 hover:border-gray-200 dark:hover:border-dark-100 transition-all">
        <div class="flex items-center justify-between mb-2.5">
            <div class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <i class="ti ti-car text-blue-600 dark:text-blue-400 text-[16px]"></i>
            </div>
            @if($activeRides > 0)
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            @endif
        </div>
        <p class="text-[17px] font-semibold text-blue-600 dark:text-blue-400">{{ $activeRides }}</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Active Rides</p>
    </a>

    <!-- SOS Alerts -->
    <a href="{{ route('admin.sos.active') }}" class="bg-white dark:bg-dark-200 rounded-xl p-4 border {{ $activeSOSAlerts > 0 ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-dark-100' }} hover:border-gray-200 transition-all">
        <div class="flex items-center justify-between mb-2.5">
            <div class="w-8 h-8 {{ $activeSOSAlerts > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-dark-100' }} rounded-lg flex items-center justify-center">
                <i class="ti ti-alert-triangle {{ $activeSOSAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400' }} text-[16px]"></i>
            </div>
            @if($activeSOSAlerts > 0)
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            @endif
        </div>
        <p class="text-[17px] font-semibold {{ $activeSOSAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white' }}">{{ $activeSOSAlerts }}</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">SOS Alerts</p>
    </a>

    <!-- Pending Withdrawals -->
    <a href="{{ route('admin.payments.withdrawals') }}" class="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-100 dark:border-dark-100 hover:border-gray-200 transition-all">
        <div class="flex items-center justify-between mb-2.5">
            <div class="w-8 h-8 {{ $pendingWithdrawals > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-dark-100' }} rounded-lg flex items-center justify-center">
                <i class="ti ti-wallet {{ $pendingWithdrawals > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400' }} text-[16px]"></i>
            </div>
        </div>
        <p class="text-[17px] font-semibold {{ $pendingWithdrawals > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-white' }}">{{ $pendingWithdrawals }}</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Withdrawals</p>
    </a>

    <!-- Commission -->
    <div class="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-100 dark:border-dark-100">
        <div class="flex items-center justify-between mb-2.5">
            <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <i class="ti ti-percentage text-emerald-600 dark:text-emerald-400 text-[16px]"></i>
            </div>
        </div>
        <p class="text-[17px] font-semibold text-emerald-600 dark:text-emerald-400">{{ number_format($totalCommission) }}</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Commission (PKR)</p>
    </div>
</div>

<!-- Charts Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
    <!-- Rides Chart -->
    <div class="bg-white dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-100">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Rides Overview</h3>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Last 7 days</p>
                </div>
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span class="text-[11px] font-medium text-amber-700 dark:text-amber-400">Rides</span>
                </div>
            </div>
        </div>
        <div class="p-5">
            <canvas id="ridesChart" height="220"></canvas>
        </div>
    </div>

    <!-- Revenue Chart -->
    <div class="bg-white dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-100">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Last 7 days</p>
                </div>
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Revenue</span>
                </div>
            </div>
        </div>
        <div class="p-5">
            <canvas id="revenueChart" height="220"></canvas>
        </div>
    </div>
</div>

<!-- Tables Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Pending Drivers -->
    <div class="bg-white dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-100">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                        <i class="ti ti-user-plus text-amber-600 dark:text-amber-400 text-[16px]"></i>
                    </div>
                    <div>
                        <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400">Drivers awaiting review</p>
                    </div>
                </div>
                <a href="{{ route('admin.drivers.pending') }}" class="text-[12px] text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium flex items-center gap-1">
                    View All <i class="ti ti-arrow-right text-[12px]"></i>
                </a>
            </div>
        </div>
        <div class="p-4">
            @forelse($pendingDriversList as $driver)
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-100 rounded-lg transition-colors mb-1.5 last:mb-0">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-700 dark:text-amber-400 font-semibold text-[12px]">
                            {{ strtoupper(substr($driver->user->name ?? 'D', 0, 1)) }}
                        </div>
                        <div>
                            <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ $driver->user->name ?? 'N/A' }}</p>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-300">{{ $driver->vehicle_type }}</span>
                                <span>{{ $driver->city }}</span>
                            </p>
                        </div>
                    </div>
                    <a href="{{ route('admin.drivers.show', $driver->id) }}" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg text-[12px] transition-colors">
                        Review
                    </a>
                </div>
            @empty
                <div class="text-center py-8">
                    <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-2.5">
                        <i class="ti ti-check text-emerald-500 text-[18px]"></i>
                    </div>
                    <p class="text-[13px] text-gray-600 dark:text-gray-300 font-medium">All caught up!</p>
                    <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">No pending drivers</p>
                </div>
            @endforelse
        </div>
    </div>

    <!-- Recent Rides -->
    <div class="bg-white dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-100">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                        <i class="ti ti-history text-violet-600 dark:text-violet-400 text-[16px]"></i>
                    </div>
                    <div>
                        <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Recent Rides</h3>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400">Latest activity</p>
                    </div>
                </div>
                <a href="{{ route('admin.rides.index') }}" class="text-[12px] text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium flex items-center gap-1">
                    View All <i class="ti ti-arrow-right text-[12px]"></i>
                </a>
            </div>
        </div>
        <div class="p-4">
            @forelse($recentRides as $ride)
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-100 rounded-lg transition-colors mb-1.5 last:mb-0">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center
                            @if($ride->status == 'completed') bg-emerald-50 dark:bg-emerald-900/20
                            @elseif($ride->status == 'in_progress') bg-blue-50 dark:bg-blue-900/20
                            @else bg-gray-50 dark:bg-dark-100 @endif">
                            <i class="ti ti-car text-[15px]
                                @if($ride->status == 'completed') text-emerald-500
                                @elseif($ride->status == 'in_progress') text-blue-500
                                @else text-gray-400 @endif"></i>
                        </div>
                        <div>
                            <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ $ride->rider->name ?? 'N/A' }}</p>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ Str::limit($ride->pickup_address, 28) }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2 py-0.5 text-[10px] rounded-md font-medium
                            @if($ride->status == 'completed') bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400
                            @elseif($ride->status == 'in_progress') bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400
                            @elseif(str_contains($ride->status, 'cancelled')) bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400
                            @else bg-gray-50 dark:bg-dark-100 text-gray-600 dark:text-gray-400 @endif">
                            {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                        </span>
                        <p class="text-[12px] font-semibold text-gray-900 dark:text-white mt-1">PKR {{ number_format($ride->estimated_price ?? 0) }}</p>
                    </div>
                </div>
            @empty
                <div class="text-center py-8">
                    <div class="w-10 h-10 bg-gray-50 dark:bg-dark-100 rounded-lg flex items-center justify-center mx-auto mb-2.5">
                        <i class="ti ti-car text-gray-400 text-[18px]"></i>
                    </div>
                    <p class="text-[13px] text-gray-600 dark:text-gray-300 font-medium">No recent rides</p>
                    <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Rides will appear here</p>
                </div>
            @endforelse
        </div>
    </div>
</div>

<!-- SOS Alerts Section -->
@if($activeSOSAlerts > 0)
<div class="mt-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-5">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <i class="ti ti-alert-triangle text-red-600 dark:text-red-400 text-[18px]"></i>
            </div>
            <div>
                <h3 class="text-[14px] font-semibold text-red-800 dark:text-red-300">Emergency Alerts</h3>
                <p class="text-[12px] text-red-600 dark:text-red-400">{{ $activeSOSAlerts }} alert(s) require immediate attention</p>
            </div>
        </div>
        <a href="{{ route('admin.sos.active') }}" class="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5">
            <i class="ti ti-eye text-[14px]"></i> View All Alerts
        </a>
    </div>
    <div class="grid gap-3">
        @foreach($recentSOSAlerts as $alert)
            <div class="bg-white dark:bg-dark-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-red-100 dark:border-red-800/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <i class="ti ti-user text-red-500 text-[15px]"></i>
                    </div>
                    <div>
                        <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ $alert->user->name ?? 'Unknown User' }}</p>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ $alert->location_address ?? 'Location not available' }}</p>
                        <p class="text-[11px] text-red-500 dark:text-red-400 mt-0.5 flex items-center gap-1">
                            <i class="ti ti-clock text-[12px]"></i>{{ $alert->created_at->diffForHumans() }}
                        </p>
                    </div>
                </div>
                <a href="{{ route('admin.sos.show', $alert->id) }}" class="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5">
                    <i class="ti ti-phone text-[14px]"></i> Respond
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
    Chart.defaults.font.family = "'Plus Jakarta Sans', Inter, sans-serif";
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
