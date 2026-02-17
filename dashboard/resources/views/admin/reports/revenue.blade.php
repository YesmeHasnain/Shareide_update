@extends('admin.layouts.app')

@section('title', 'Revenue Report')
@section('subtitle', 'Financial analytics and insights')

@section('content')
<!-- Summary -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">PKR {{ number_format($summary['total_revenue']) }}</p>
        <p class="text-xs text-gray-500">Total Revenue</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">PKR {{ number_format($summary['total_commission']) }}</p>
        <p class="text-xs text-gray-500">Total Commission</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">PKR {{ number_format($summary['this_month_revenue']) }}</p>
        <p class="text-xs text-gray-500">This Month Revenue</p>
    </div>
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-orange-600">PKR {{ number_format($summary['this_month_commission']) }}</p>
        <p class="text-xs text-gray-500">This Month Commission</p>
    </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.reports.revenue') }}" method="GET" class="flex gap-4 items-end">
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
        <a href="{{ route('admin.reports.export', ['type' => 'revenue', 'date_from' => $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-01', 'date_to' => $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-31']) }}" class="px-4 py-2 bg-green-600 text-white rounded-lg"><i class="ti ti-download mr-2"></i>Export</a>
    </form>
</div>

<!-- Charts -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Daily Revenue - {{ date('F Y', mktime(0, 0, 0, $month, 1, $year)) }}</h3>
        <canvas id="dailyChart" height="200"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Revenue by Payment Method</h3>
        <canvas id="methodChart" height="200"></canvas>
    </div>
</div>

<!-- Monthly Trend -->
<div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trend - {{ $year }}</h3>
    <canvas id="monthlyChart" height="100"></canvas>
</div>

<!-- Daily Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b">
        <h3 class="font-semibold text-gray-800">Daily Breakdown</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($dailyRevenue as $day)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm text-gray-800">{{ \Carbon\Carbon::parse($day->date)->format('M d, Y (D)') }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-green-600">PKR {{ number_format($day->total_amount) }}</td>
                        <td class="px-4 py-3 text-sm text-blue-600">PKR {{ number_format($day->total_commission) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $day->total_transactions }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">No data for this period</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

@push('scripts')
<script>
    // Daily Revenue Chart
    new Chart(document.getElementById('dailyChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: @json($dailyRevenue->pluck('date')->map(fn($d) => \Carbon\Carbon::parse($d)->format('d'))),
            datasets: [{
                label: 'Revenue (PKR)',
                data: @json($dailyRevenue->pluck('total_amount')),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Payment Method Chart
    new Chart(document.getElementById('methodChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: @json($revenueByMethod->pluck('payment_method')->map(fn($m) => ucfirst($m))),
            datasets: [{
                data: @json($revenueByMethod->pluck('total_amount')),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: { responsive: true }
    });

    // Monthly Trend Chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0);
    @foreach($monthlyRevenue as $m)
        monthlyData[{{ $m->month - 1 }}] = {{ $m->total_amount }};
    @endforeach

    new Chart(document.getElementById('monthlyChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue (PKR)',
                data: monthlyData,
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
</script>
@endpush
@endsection
