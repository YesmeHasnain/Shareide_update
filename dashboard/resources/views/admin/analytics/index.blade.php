@extends('admin.layouts.app')

@section('title', 'Analytics Dashboard')

@section('content')
<div class="space-y-6">
    <!-- Header with Period Selector -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p class="text-gray-600">Comprehensive business insights and metrics</p>
        </div>
        <div class="flex items-center gap-3">
            <form method="GET" class="flex items-center gap-2">
                <select name="period" onchange="this.form.submit()" class="rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                    <option value="7" {{ $period == 7 ? 'selected' : '' }}>Last 7 Days</option>
                    <option value="30" {{ $period == 30 ? 'selected' : '' }}>Last 30 Days</option>
                    <option value="90" {{ $period == 90 ? 'selected' : '' }}>Last 90 Days</option>
                    <option value="365" {{ $period == 365 ? 'selected' : '' }}>Last Year</option>
                </select>
            </form>
            <a href="{{ route('admin.analytics.export', ['period' => $period]) }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Export
            </a>
        </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @php
            $metrics = [
                ['label' => 'Total Rides', 'key' => 'total_rides', 'icon' => 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a4 4 0 00-4-4H5a4 4 0 00-4 4v10', 'color' => 'blue', 'prefix' => ''],
                ['label' => 'Completed', 'key' => 'completed_rides', 'icon' => 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 'color' => 'green', 'prefix' => ''],
                ['label' => 'Total Revenue', 'key' => 'total_revenue', 'icon' => 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 'color' => 'yellow', 'prefix' => 'Rs. '],
                ['label' => 'Commission', 'key' => 'commission_earned', 'icon' => 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', 'color' => 'purple', 'prefix' => 'Rs. '],
            ];
        @endphp

        @foreach($metrics as $metric)
            @php
                $current = $stats[$metric['key']]['current'] ?? 0;
                $previous = $stats[$metric['key']]['previous'] ?? 0;
                $change = $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : 0;
                $isPositive = $change >= 0;
            @endphp
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-3 bg-{{ $metric['color'] }}-100 rounded-lg">
                        <svg class="w-6 h-6 text-{{ $metric['color'] }}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $metric['icon'] }}"></path></svg>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full {{ $isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                        @if($isPositive)
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        @else
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        @endif
                        {{ abs($change) }}%
                    </span>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">{{ $metric['prefix'] }}{{ number_format($current) }}</h3>
                <p class="text-sm text-gray-500">{{ $metric['label'] }}</p>
            </div>
        @endforeach
    </div>

    <!-- Secondary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-indigo-100 rounded-lg">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900">{{ number_format($stats['new_users']['current']) }}</p>
                    <p class="text-xs text-gray-500">New Riders</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-teal-100 rounded-lg">
                    <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900">{{ number_format($stats['new_drivers']['current']) }}</p>
                    <p class="text-xs text-gray-500">New Drivers</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-yellow-100 rounded-lg">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900">{{ number_format($stats['avg_rating']['current'], 1) }}</p>
                    <p class="text-xs text-gray-500">Avg. Rating</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-red-100 rounded-lg">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <div>
                    <p class="text-xl font-bold text-gray-900">{{ $stats['cancellation_rate']['current'] }}%</p>
                    <p class="text-xs text-gray-500">Cancel Rate</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Rides Chart -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Rides Overview</h3>
            <canvas id="ridesChart" height="250"></canvas>
        </div>

        <!-- Revenue Chart -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <canvas id="revenueChart" height="250"></canvas>
        </div>
    </div>

    <!-- More Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Rides by Status -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Rides by Status</h3>
            <canvas id="statusChart" height="200"></canvas>
        </div>

        <!-- Rides by Hour -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
            <canvas id="hourChart" height="200"></canvas>
        </div>

        <!-- Payment Methods -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <canvas id="paymentChart" height="200"></canvas>
        </div>
    </div>

    <!-- Top Performers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Drivers -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-900">Top Drivers</h3>
            </div>
            <div class="divide-y divide-gray-100">
                @forelse($topDrivers as $index => $driver)
                    <div class="px-6 py-4 flex items-center gap-4">
                        <span class="flex items-center justify-center w-8 h-8 rounded-full {{ $index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600' }} font-semibold text-sm">
                            {{ $index + 1 }}
                        </span>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-900 truncate">{{ $driver->user->name ?? 'Unknown' }}</p>
                            <p class="text-sm text-gray-500">{{ $driver->city }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-900">{{ $driver->rides_count ?? 0 }} rides</p>
                            <p class="text-sm text-green-600">Rs. {{ number_format($driver->earnings ?? 0) }}</p>
                        </div>
                    </div>
                @empty
                    <div class="px-6 py-8 text-center text-gray-500">No data available</div>
                @endforelse
            </div>
        </div>

        <!-- Top Cities -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-900">Top Cities</h3>
            </div>
            <div class="divide-y divide-gray-100">
                @forelse($topCities as $index => $city)
                    <div class="px-6 py-4 flex items-center gap-4">
                        <span class="flex items-center justify-center w-8 h-8 rounded-full {{ $index < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600' }} font-semibold text-sm">
                            {{ $index + 1 }}
                        </span>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-900">{{ $city->city ?? 'Unknown' }}</p>
                            <p class="text-sm text-gray-500">{{ $city->driver_count }} drivers</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-900">{{ number_format($city->total_rides ?? 0) }} rides</p>
                        </div>
                    </div>
                @empty
                    <div class="px-6 py-8 text-center text-gray-500">No data available</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Rides Chart
    new Chart(document.getElementById('ridesChart'), {
        type: 'line',
        data: {
            labels: {!! json_encode($ridesChartData['labels']) !!},
            datasets: [{
                label: 'Total',
                data: {!! json_encode($ridesChartData['total']) !!},
                borderColor: '#EAB308',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Completed',
                data: {!! json_encode($ridesChartData['completed']) !!},
                borderColor: '#22C55E',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Cancelled',
                data: {!! json_encode($ridesChartData['cancelled']) !!},
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Revenue Chart
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: {!! json_encode($revenueChartData['labels']) !!},
            datasets: [{
                label: 'Total Revenue',
                data: {!! json_encode($revenueChartData['total']) !!},
                backgroundColor: 'rgba(234, 179, 8, 0.8)',
            }, {
                label: 'Commission',
                data: {!! json_encode($revenueChartData['commission']) !!},
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Status Chart
    new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: {!! json_encode(array_keys($ridesByStatus->toArray())) !!},
            datasets: [{
                data: {!! json_encode(array_values($ridesByStatus->toArray())) !!},
                backgroundColor: ['#22C55E', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // Hour Chart
    new Chart(document.getElementById('hourChart'), {
        type: 'bar',
        data: {
            labels: {!! json_encode(array_keys($ridesByHour->toArray())) !!}.map(h => h + ':00'),
            datasets: [{
                label: 'Rides',
                data: {!! json_encode(array_values($ridesByHour->toArray())) !!},
                backgroundColor: 'rgba(234, 179, 8, 0.8)',
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Payment Chart
    new Chart(document.getElementById('paymentChart'), {
        type: 'pie',
        data: {
            labels: {!! json_encode($paymentStats->pluck('payment_method')) !!},
            datasets: [{
                data: {!! json_encode($paymentStats->pluck('total')) !!},
                backgroundColor: ['#22C55E', '#3B82F6', '#EAB308', '#8B5CF6']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
</script>
@endpush
@endsection
