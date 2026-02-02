@extends('admin.layouts.app')

@section('title', 'Fare Management')
@section('subtitle', 'Configure pricing, surge rates, and commission')

@section('content')
<div class="space-y-6">
    <!-- Tabs -->
    <div x-data="{ activeTab: 'fares' }">
        <div class="border-b border-gray-200 dark:border-dark-100">
            <nav class="flex -mb-px space-x-8">
                <button @click="activeTab = 'fares'" :class="{ 'border-yellow-500 text-yellow-600': activeTab === 'fares', 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'fares' }" class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                    <i class="fas fa-calculator mr-2"></i>Fare Settings
                </button>
                <button @click="activeTab = 'surge'" :class="{ 'border-yellow-500 text-yellow-600': activeTab === 'surge', 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'surge' }" class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                    <i class="fas fa-bolt mr-2"></i>Surge Pricing
                </button>
                <button @click="activeTab = 'commission'" :class="{ 'border-yellow-500 text-yellow-600': activeTab === 'commission', 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'commission' }" class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                    <i class="fas fa-percentage mr-2"></i>Commission
                </button>
                <button @click="activeTab = 'zones'" :class="{ 'border-yellow-500 text-yellow-600': activeTab === 'zones', 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'zones' }" class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                    <i class="fas fa-map-marked-alt mr-2"></i>Service Zones
                </button>
            </nav>
        </div>

        <!-- Fare Settings Tab -->
        <div x-show="activeTab === 'fares'" class="mt-6 space-y-6">
            <!-- Add New Fare Form -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add/Update Fare Setting</h3>
                <form action="{{ route('admin.fare.store') }}" method="POST">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <input type="text" name="city" required list="cities" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="e.g. Lahore">
                            <datalist id="cities">
                                @foreach($cities as $city)
                                    <option value="{{ $city }}">
                                @endforeach
                            </datalist>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
                            <select name="vehicle_type" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fare (Rs.)</label>
                            <input type="number" name="base_fare" required step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Per KM Rate (Rs.)</label>
                            <input type="number" name="per_km_rate" required step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Per Minute (Rs.)</label>
                            <input type="number" name="per_minute_rate" step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Fare (Rs.)</label>
                            <input type="number" name="minimum_fare" required step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booking Fee (Rs.)</label>
                            <input type="number" name="booking_fee" step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cancellation Fee (Rs.)</label>
                            <input type="number" name="cancellation_fee" step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
                            <i class="fas fa-save mr-2"></i>Save Fare Settings
                        </button>
                    </div>
                </form>
            </div>

            <!-- Existing Fares Table -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Current Fare Settings</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-dark-300">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">City</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Base Fare</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Per KM</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Per Min</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Minimum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-dark-100">
                            @forelse($fareSettings as $fare)
                                <tr class="hover:bg-gray-50 dark:hover:bg-dark-300">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ $fare->city }}</td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $fare->vehicle_type === 'car' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }}">
                                            <i class="fas fa-{{ $fare->vehicle_type === 'car' ? 'car' : 'motorcycle' }} mr-1"></i>
                                            {{ ucfirst($fare->vehicle_type) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">Rs. {{ number_format($fare->base_fare, 2) }}</td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">Rs. {{ number_format($fare->per_km_rate, 2) }}</td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">Rs. {{ number_format($fare->per_minute_rate ?? 0, 2) }}</td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">Rs. {{ number_format($fare->minimum_fare, 2) }}</td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $fare->is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }}">
                                            {{ $fare->is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <form action="{{ route('admin.fare.delete', $fare->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No fare settings configured yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Surge Pricing Tab -->
        <div x-show="activeTab === 'surge'" class="mt-6 space-y-6">
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Surge Pricing</h3>
                <form action="{{ route('admin.surge.store') }}" method="POST">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <input type="text" name="city" required list="cities" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multiplier</label>
                            <input type="number" name="multiplier" required step="0.1" min="1" max="5" value="1.5" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starts At</label>
                            <input type="datetime-local" name="starts_at" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ends At</label>
                            <input type="datetime-local" name="ends_at" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div class="md:col-span-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                            <input type="text" name="reason" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="e.g. High demand, Rain, Event">
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
                            <i class="fas fa-bolt mr-2"></i>Activate Surge
                        </button>
                    </div>
                </form>
            </div>

            <!-- Active Surge List -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Active Surge Pricing</h3>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-dark-100">
                    @forelse($surgePricing as $surge)
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div>
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl font-bold text-yellow-600">{{ $surge->multiplier }}x</span>
                                    <span class="font-medium text-gray-900 dark:text-white">{{ $surge->city }}</span>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $surge->reason ?? 'No reason specified' }}</p>
                                <p class="text-xs text-gray-400">{{ $surge->starts_at->format('M d, H:i') }} - {{ $surge->ends_at ? $surge->ends_at->format('M d, H:i') : 'Until deactivated' }}</p>
                            </div>
                            <form action="{{ route('admin.surge.deactivate', $surge->id) }}" method="POST">
                                @csrf
                                <button type="submit" class="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    <i class="fas fa-power-off mr-1"></i>Deactivate
                                </button>
                            </form>
                        </div>
                    @empty
                        <div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No active surge pricing.</div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Commission Tab -->
        <div x-show="activeTab === 'commission'" class="mt-6 space-y-6">
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Commission Setting</h3>
                <form action="{{ route('admin.commission.store') }}" method="POST">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input type="text" name="name" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="e.g. Standard Commission">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select name="type" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (Rs.)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                            <input type="number" name="value" required step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City (Optional)</label>
                            <input type="text" name="city" list="cities" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="Leave empty for all cities">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
                            <select name="vehicle_type" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                                <option value="all">All</option>
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Rides for Discount</label>
                            <input type="number" name="min_rides_for_discount" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="e.g. 100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discounted Value</label>
                            <input type="number" name="discounted_value" step="0.01" min="0" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="Commission after reaching rides">
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
                            <i class="fas fa-save mr-2"></i>Save Commission
                        </button>
                    </div>
                </form>
            </div>

            <!-- Commission List -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Active Commission Settings</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-dark-300">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">City</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vehicle</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-dark-100">
                            @forelse($commissionSettings as $commission)
                                <tr class="hover:bg-gray-50 dark:hover:bg-dark-300">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ $commission->name }}</td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ ucfirst($commission->type) }}</td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {{ $commission->type === 'percentage' ? $commission->value . '%' : 'Rs. ' . number_format($commission->value, 2) }}
                                    </td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ $commission->city ?? 'All' }}</td>
                                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ ucfirst($commission->vehicle_type) }}</td>
                                    <td class="px-6 py-4 text-right">
                                        <form action="{{ route('admin.commission.delete', $commission->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No commission settings configured.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Service Zones Tab -->
        <div x-show="activeTab === 'zones'" class="mt-6 space-y-6">
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Service Zone</h3>
                <form action="{{ route('admin.zone.store') }}" method="POST">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone Name</label>
                            <input type="text" name="name" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="e.g. DHA Phase 5">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <input type="text" name="city" required list="cities" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone Type</label>
                            <select name="type" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                                <option value="service_area">Service Area (Active)</option>
                                <option value="restricted">Restricted Zone</option>
                                <option value="high_demand">High Demand Area</option>
                                <option value="airport">Airport Zone</option>
                                <option value="special">Special Zone</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fare Multiplier</label>
                            <input type="number" name="fare_multiplier" step="0.01" min="0.5" max="3" value="1.00" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <input type="text" name="description" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div class="md:col-span-3">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coordinates (JSON Array)</label>
                            <textarea name="coordinates" required rows="3" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500 font-mono text-sm" placeholder='[{"lat": 31.5204, "lng": 74.3587}, {"lat": 31.5304, "lng": 74.3687}]'></textarea>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter polygon coordinates as JSON array. Each point should have lat and lng.</p>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
                            <i class="fas fa-map-marker-alt mr-2"></i>Create Zone
                        </button>
                    </div>
                </form>
            </div>

            <!-- Zones List -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Service Zones</h3>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-dark-100">
                    @forelse($serviceZones as $zone)
                        @php
                            $zoneColors = [
                                'service_area' => 'bg-green-500',
                                'restricted' => 'bg-red-500',
                                'high_demand' => 'bg-orange-500',
                                'airport' => 'bg-blue-500',
                                'special' => 'bg-purple-500',
                            ];
                        @endphp
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <span class="w-3 h-3 rounded-full {{ $zoneColors[$zone->type] ?? 'bg-gray-500' }}"></span>
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">{{ $zone->name }}</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ $zone->city }} - {{ ucfirst(str_replace('_', ' ', $zone->type)) }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $zone->fare_multiplier }}x fare</span>
                                <form action="{{ route('admin.zone.delete', $zone->id) }}" method="POST" onsubmit="return confirm('Are you sure?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    @empty
                        <div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No service zones configured.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
