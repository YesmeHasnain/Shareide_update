@extends('admin.layouts.app')

@section('title', 'Rides Report')
@section('subtitle', 'Ride analytics and statistics')

@section('content')
<!-- Summary -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ number_format($summary['total_rides']) }}</p>
        <p class="text-xs text-gray-500">Total Rides</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ number_format($summary['this_month_rides']) }}</p>
        <p class="text-xs text-gray-500">This Month</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $summary['completion_rate'] }}%</p>
        <p class="text-xs text-gray-500">Completion Rate</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">PKR {{ number_format($summary['avg_fare']) }}</p>
        <p class="text-xs text-gray-500">Avg Fare</p>
    </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.reports.rides') }}" method="GET" class="flex gap-4 items-end">
        <div class="w-32">
            <label class="block text-sm text-gray-600 mb-1">Year</label>
            <select name="year" class="w-full px-4 py-2 border rounded-lg">
                @for($y = date('Y'); $y >= 2024; $y--)
                    <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>{{ $y }}</option>
                @endfor
            </select>
        </div>
        <div class="w-32">
            <label class="block text-sm text-gray-600 mb-1">Month</label>
            <select name="month" class="w-full px-4 py-2 border rounded-lg">
                @for($m = 1; $m <= 12; $m++)
                    <option value="{{ $m }}" {{ $month == $m ? 'selected' : '' }}>{{ date('F', mktime(0, 0, 0, $m, 1)) }}</option>
                @endfor
            </select>
        </div>
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="ti ti-filter mr-2"></i>Apply</button>
    </form>
</div>

<!-- Charts -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Daily Rides - {{ date('F Y', mktime(0, 0, 0, $month, 1, $year)) }}</h3>
        <canvas id="dailyRidesChart" height="200"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Rides by Status</h3>
        <canvas id="statusChart" height="200"></canvas>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Peak Hours</h3>
        <canvas id="peakHoursChart" height="200"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Popular Routes</h3>
        <div class="space-y-3 max-h-64 overflow-y-auto">
            @forelse($popularRoutes as $route)
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-600">{{ Str::limit($route->pickup_address, 30) }}</p>
                            <p class="text-xs text-gray-400">&darr;</p>
                            <p class="text-sm text-gray-600">{{ Str::limit($route->drop_address, 30) }}</p>
                        </div>
                        <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">{{ $route->count }} rides</span>
                    </div>
                </div>
            @empty
                <p class="text-gray-500 text-center py-4">No data</p>
            @endforelse
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Daily Rides Chart
    new Chart(document.getElementById('dailyRidesChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: @json($dailyRides->pluck('date')->map(fn($d) => \Carbon\Carbon::parse($d)->format('d'))),
            datasets: [
                { label: 'Completed', data: @json($dailyRides->pluck('completed')), backgroundColor: '#10b981' },
                { label: 'Cancelled', data: @json($dailyRides->pluck('cancelled')), backgroundColor: '#ef4444' }
            ]
        },
        options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });

    // Status Chart
    new Chart(document.getElementById('statusChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: @json($ridesByStatus->pluck('status')->map(fn($s) => ucfirst(str_replace('_', ' ', $s)))),
            datasets: [{
                data: @json($ridesByStatus->pluck('count')),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            }]
        },
        options: { responsive: true }
    });

    // Peak Hours Chart
    const hoursData = Array(24).fill(0);
    @foreach($peakHours as $h)
        hoursData[{{ $h->hour }}] = {{ $h->count }};
    @endforeach

    new Chart(document.getElementById('peakHoursChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => i + ':00'),
            datasets: [{
                label: 'Rides',
                data: hoursData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
</script>
@endpush
@endsection
