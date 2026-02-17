@extends('admin.layouts.app')

@section('title', 'Shared Rides - Carpooling')

@section('content')
<div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Shared Rides / Carpooling</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Manage all carpooling rides</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.shared-rides.active') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg transition-all">
                <i class="ti ti-car"></i> Active Rides
            </a>
            <a href="{{ route('admin.shared-rides.bookings') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-dark-200 transition-all">
                <i class="ti ti-ticket"></i> View Bookings
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-dark-200">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <i class="ti ti-car text-white text-lg"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['total'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Total Rides</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-dark-200">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <i class="ti ti-door text-white text-lg"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['open'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Open</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-dark-200">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <i class="ti ti-armchair text-white text-lg"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['full'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Full</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-dark-200">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <i class="ti ti-road text-white text-lg"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['in_progress'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-dark-200">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <i class="ti ti-circle-check text-white text-lg"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['completed'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-dark-200">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <i class="ti ti-circle-x text-white text-lg"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['cancelled'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
        <a href="{{ route('admin.shared-rides.index') }}" class="px-4 py-2 rounded-full text-sm font-medium transition-all {{ !$status ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200' }}">
            All
        </a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'open']) }}" class="px-4 py-2 rounded-full text-sm font-medium transition-all {{ $status == 'open' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200' }}">
            Open
        </a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'full']) }}" class="px-4 py-2 rounded-full text-sm font-medium transition-all {{ $status == 'full' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200' }}">
            Full
        </a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'in_progress']) }}" class="px-4 py-2 rounded-full text-sm font-medium transition-all {{ $status == 'in_progress' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200' }}">
            In Progress
        </a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'completed']) }}" class="px-4 py-2 rounded-full text-sm font-medium transition-all {{ $status == 'completed' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200' }}">
            Completed
        </a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'cancelled']) }}" class="px-4 py-2 rounded-full text-sm font-medium transition-all {{ $status == 'cancelled' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200' }}">
            Cancelled
        </a>
    </div>

    <!-- Rides Table -->
    <div class="bg-white dark:bg-dark-100 rounded-2xl border border-gray-100 dark:border-dark-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-dark-200">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Route</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Departure</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seats</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price/Seat</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookings</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-dark-200">
                    @forelse($rides as $ride)
                    <tr class="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                        <td class="px-6 py-4">
                            <span class="text-sm font-medium text-gray-900 dark:text-white">#{{ $ride->id }}</span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-semibold">
                                    {{ substr($ride->driver->name ?? 'D', 0, 1) }}
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $ride->driver->name ?? 'N/A' }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ $ride->driver->phone ?? '' }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ Str::limit($ride->from_address, 25) }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ Str::limit($ride->to_address, 25) }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $ride->departure_time->format('M d, Y') }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $ride->departure_time->format('h:i A') }}</p>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {{ $ride->total_seats - $ride->available_seats }}/{{ $ride->total_seats }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm font-semibold text-green-600 dark:text-green-400">Rs. {{ number_format($ride->price_per_seat) }}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 dark:bg-dark-200 dark:text-gray-300">
                                {{ $ride->bookings_count ?? 0 }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            @php
                                $statusStyles = [
                                    'open' => 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                    'full' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                    'in_progress' => 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                    'completed' => 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                                    'cancelled' => 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                ];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium {{ $statusStyles[$ride->status] ?? $statusStyles['open'] }}">
                                {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('admin.shared-rides.show', $ride->id) }}" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View">
                                    <i class="ti ti-eye"></i>
                                </a>
                                @if(!in_array($ride->status, ['completed', 'cancelled']))
                                <form action="{{ route('admin.shared-rides.cancel', $ride->id) }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Cancel" onclick="return confirm('Cancel this ride?')">
                                        <i class="ti ti-x"></i>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9" class="px-6 py-12 text-center">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center mb-4">
                                    <i class="ti ti-car text-2xl text-gray-400"></i>
                                </div>
                                <p class="text-gray-500 dark:text-gray-400">No shared rides found</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($rides->hasPages())
        <div class="px-6 py-4 border-t border-gray-100 dark:border-dark-200">
            {{ $rides->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
