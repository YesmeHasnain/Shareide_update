@extends('admin.layouts.app')

@section('title', 'Users Report')
@section('subtitle', 'User growth and activity analytics')

@section('content')
<!-- Summary -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ number_format($summary['total_users']) }}</p>
        <p class="text-xs text-gray-500">Total Users</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ number_format($summary['new_this_year']) }}</p>
        <p class="text-xs text-gray-500">New This Year</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ number_format($summary['active_last_30_days']) }}</p>
        <p class="text-xs text-gray-500">Active (30 Days)</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ number_format($summary['blocked_users']) }}</p>
        <p class="text-xs text-gray-500">Blocked</p>
    </div>
</div>

<!-- Filter -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.reports.users') }}" method="GET" class="flex gap-4 items-end">
        <div class="w-32">
            <label class="block text-sm text-gray-600 mb-1">Year</label>
            <select name="year" class="w-full px-4 py-2 border rounded-lg">
                @for($y = date('Y'); $y >= 2024; $y--)
                    <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>{{ $y }}</option>
                @endfor
            </select>
        </div>
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="ti ti-filter mr-2"></i>Apply</button>
    </form>
</div>

<!-- Charts -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly User Signups - {{ $year }}</h3>
        <canvas id="signupsChart" height="200"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Active Users</h3>
        <div class="space-y-3 max-h-64 overflow-y-auto">
            @forelse($userActivity as $user)
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium text-gray-800">{{ $user->name ?? 'N/A' }}</p>
                        <p class="text-xs text-gray-500">{{ $user->phone }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-semibold text-blue-600">{{ $user->rides_as_rider_count }} rides</p>
                        <p class="text-xs text-green-600">{{ $user->completed_rides_count }} completed</p>
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const signupData = Array(12).fill(0);
    @foreach($monthlySignups as $m)
        signupData[{{ $m->month - 1 }}] = {{ $m->count }};
    @endforeach

    new Chart(document.getElementById('signupsChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'New Users',
                data: signupData,
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
</script>
@endpush
@endsection
