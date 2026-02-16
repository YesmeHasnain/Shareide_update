@extends('admin.layouts.app')

@section('title', 'Loyalty Rewards')
@section('subtitle', 'Manage redeemable rewards')

@section('content')
<div class="space-y-6">
    <div class="flex justify-between items-center">
        <a href="{{ route('admin.loyalty.index') }}" class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'">
            <i class="fas fa-arrow-left"></i> Back to Loyalty
        </a>
        <button onclick="document.getElementById('addRewardModal').classList.remove('hidden')" class="btn-primary px-4 py-2 rounded-xl">
            <i class="fas fa-plus mr-2"></i>Add Reward
        </button>
    </div>

    <!-- Rewards Table -->
    <div class="rounded-2xl overflow-hidden" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
        <table class="w-full">
            <thead class="border-b" :class="darkMode ? 'border-dark-100 bg-dark-300' : 'border-gray-200 bg-gray-50'">
                <tr>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Reward</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Type</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Points Required</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Value</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Redeemed</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Status</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y" :class="darkMode ? 'divide-dark-100' : 'divide-gray-100'">
                @forelse($rewards as $reward)
                <tr class="hover:bg-gray-50 dark:hover:bg-dark-100">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                <i class="fas fa-gift text-white"></i>
                            </div>
                            <div>
                                <p class="font-medium" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $reward->name }}</p>
                                <p class="text-xs truncate max-w-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ Str::limit($reward->description, 50) }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">{{ ucwords(str_replace('_', ' ', $reward->reward_type)) }}</td>
                    <td class="px-6 py-4">
                        <span class="font-semibold text-yellow-500">{{ number_format($reward->points_required) }}</span>
                    </td>
                    <td class="px-6 py-4 font-medium" :class="darkMode ? 'text-white' : 'text-gray-800'">
                        @if(str_contains($reward->reward_type, 'percentage'))
                            {{ $reward->reward_value }}%
                        @else
                            PKR {{ number_format($reward->reward_value) }}
                        @endif
                    </td>
                    <td class="px-6 py-4" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">{{ $reward->current_redemptions }}</td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs font-medium {{ $reward->is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' }}">
                            {{ $reward->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <form action="{{ route('admin.loyalty.rewards.toggle', $reward->id) }}" method="POST" class="inline">
                            @csrf
                            <button type="submit" class="text-sm px-3 py-1 rounded-lg transition-colors {{ $reward->is_active ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' }}">
                                {{ $reward->is_active ? 'Disable' : 'Enable' }}
                            </button>
                        </form>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                        <i class="fas fa-gift text-5xl mb-3 opacity-30"></i>
                        <p>No rewards created yet</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{ $rewards->links() }}
</div>

<!-- Add Reward Modal -->
<div id="addRewardModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" :class="darkMode ? 'bg-dark-200' : 'bg-white'">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-gray-800'">Add New Reward</h3>
            <button onclick="document.getElementById('addRewardModal').classList.add('hidden')" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form action="{{ route('admin.loyalty.rewards.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Name</label>
                <input type="text" name="name" required class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
                <textarea name="description" required rows="2" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Points Required</label>
                    <input type="number" name="points_required" required min="1" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Type</label>
                    <select name="reward_type" required class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                        <option value="discount_fixed">Fixed Discount</option>
                        <option value="discount_percentage">% Discount</option>
                        <option value="free_ride">Free Ride</option>
                        <option value="priority_booking">Priority Booking</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Reward Value (PKR or %)</label>
                <input type="number" name="reward_value" required min="0" step="0.01" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Terms & Conditions</label>
                <textarea name="terms_conditions" rows="2" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'"></textarea>
            </div>
            <input type="hidden" name="is_active" value="1">
            <button type="submit" class="w-full btn-primary py-3 rounded-xl font-semibold">Create Reward</button>
        </form>
    </div>
</div>
@endsection
