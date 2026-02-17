@extends('admin.layouts.app')

@section('title', 'Drivers Report')
@section('subtitle', 'Driver performance and earnings analytics')

@section('content')
<!-- Summary -->
<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ number_format($summary['total_drivers']) }}</p>
        <p class="text-xs text-gray-500">Total Drivers</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ number_format($summary['approved_drivers']) }}</p>
        <p class="text-xs text-gray-500">Approved</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ number_format($summary['online_now']) }}</p>
        <p class="text-xs text-gray-500">Online Now</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ number_format($summary['avg_rating'], 1) }}</p>
        <p class="text-xs text-gray-500">Avg Rating</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">PKR {{ number_format($summary['total_earnings']) }}</p>
        <p class="text-xs text-gray-500">Total Earnings</p>
    </div>
</div>

<!-- Charts & Tables -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- Top Drivers -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Performing Drivers</h3>
        <div class="space-y-3 max-h-80 overflow-y-auto">
            @forelse($topDrivers as $index => $driver)
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <span class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold text-sm mr-3">{{ $index + 1 }}</span>
                        <div>
                            <p class="font-medium text-gray-800">{{ $driver->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $driver->city }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-semibold text-green-600">{{ $driver->completed_rides_count }} rides</p>
                        <div class="flex items-center justify-end text-xs text-yellow-500">
                            <i class="ti ti-star mr-1"></i>{{ number_format($driver->rating_average, 1) }}
                        </div>
                    </div>
                </div>
            @empty
                <p class="text-gray-500 text-center py-4">No data</p>
            @endforelse
        </div>
    </div>

    <!-- Top Earners -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Earning Drivers</h3>
        <div class="space-y-3 max-h-80 overflow-y-auto">
            @forelse($driverEarnings as $index => $wallet)
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <span class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full font-bold text-sm mr-3">{{ $index + 1 }}</span>
                        <div>
                            <p class="font-medium text-gray-800">{{ $wallet->driver->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $wallet->driver->user->phone ?? '-' }}</p>
                        </div>
                    </div>
                    <p class="text-sm font-bold text-green-600">PKR {{ number_format($wallet->total_earned) }}</p>
                </div>
            @empty
                <p class="text-gray-500 text-center py-4">No data</p>
            @endforelse
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Online by City -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Online Drivers by City</h3>
        <canvas id="cityChart" height="200"></canvas>
    </div>

    <!-- Rating Distribution -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
        <canvas id="ratingChart" height="200"></canvas>
    </div>
</div>

@push('scripts')
<script>
    // City Chart
    new Chart(document.getElementById('cityChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: @json($onlinePattern->pluck('city')),
            datasets: [{
                label: 'Online Drivers',
                data: @json($onlinePattern->pluck('count')),
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        },
        options: { responsive: true, indexAxis: 'y', scales: { x: { beginAtZero: true } } }
    });

    // Rating Chart
    new Chart(document.getElementById('ratingChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: @json($ratingDistribution->pluck('rating')->map(fn($r) => $r . ' Stars')),
            datasets: [{
                label: 'Drivers',
                data: @json($ratingDistribution->pluck('count')),
                backgroundColor: '#f59e0b',
                borderRadius: 8
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
</script>
@endpush
@endsection
