@extends('admin.layouts.app')

@section('title', 'Loyalty Program')
@section('subtitle', 'Manage tiers, rewards, and achievements')

@section('content')
<div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rounded-2xl p-6 stat-card" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Total Points Earned</p>
                    <p class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ number_format($stats['total_points_earned']) }}</p>
                </div>
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <i class="fas fa-coins text-white text-xl"></i>
                </div>
            </div>
        </div>

        <div class="rounded-2xl p-6 stat-card" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Points Redeemed</p>
                    <p class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ number_format($stats['total_points_redeemed']) }}</p>
                </div>
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <i class="fas fa-gift text-white text-xl"></i>
                </div>
            </div>
        </div>

        <div class="rounded-2xl p-6 stat-card" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Total Redemptions</p>
                    <p class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ number_format($stats['total_redemptions']) }}</p>
                </div>
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <i class="fas fa-ticket-alt text-white text-xl"></i>
                </div>
            </div>
        </div>

        <div class="rounded-2xl p-6 stat-card" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Active Rewards</p>
                    <p class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $stats['active_rewards'] }}</p>
                </div>
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <i class="fas fa-star text-white text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <a href="{{ route('admin.loyalty.tiers') }}" class="rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105" :class="darkMode ? 'bg-dark-200 hover:bg-dark-100' : 'bg-white shadow hover:shadow-lg'">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <i class="fas fa-crown text-white"></i>
            </div>
            <div>
                <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-gray-800'">Manage Tiers</p>
                <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $tiers->count() }} tiers</p>
            </div>
        </a>

        <a href="{{ route('admin.loyalty.rewards') }}" class="rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105" :class="darkMode ? 'bg-dark-200 hover:bg-dark-100' : 'bg-white shadow hover:shadow-lg'">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <i class="fas fa-gift text-white"></i>
            </div>
            <div>
                <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-gray-800'">Manage Rewards</p>
                <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $stats['active_rewards'] }} active</p>
            </div>
        </a>

        <a href="{{ route('admin.loyalty.achievements') }}" class="rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105" :class="darkMode ? 'bg-dark-200 hover:bg-dark-100' : 'bg-white shadow hover:shadow-lg'">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <i class="fas fa-trophy text-white"></i>
            </div>
            <div>
                <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-gray-800'">Achievements</p>
                <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Badges & milestones</p>
            </div>
        </a>

        <a href="{{ route('admin.loyalty.redemptions') }}" class="rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105" :class="darkMode ? 'bg-dark-200 hover:bg-dark-100' : 'bg-white shadow hover:shadow-lg'">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <i class="fas fa-history text-white"></i>
            </div>
            <div>
                <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-gray-800'">Redemption History</p>
                <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">View all redemptions</p>
            </div>
        </a>
    </div>

    <!-- Tiers Overview -->
    <div class="rounded-2xl p-6" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
        <h3 class="text-lg font-bold mb-4" :class="darkMode ? 'text-white' : 'text-gray-800'">
            <i class="fas fa-crown text-yellow-500 mr-2"></i>Loyalty Tiers
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            @foreach($tiers as $tier)
            <div class="rounded-xl p-4 border-2" style="border-color: {{ $tier->badge_color }}">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: {{ $tier->badge_color }}">
                        <i class="fas fa-crown text-white"></i>
                    </div>
                    <div>
                        <p class="font-bold" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $tier->name }}</p>
                        <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $tier->users_count }} users</p>
                    </div>
                </div>
                <div class="space-y-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                    <p><i class="fas fa-coins text-yellow-500 w-5"></i> {{ number_format($tier->min_points) }}+ points</p>
                    <p><i class="fas fa-percent text-green-500 w-5"></i> {{ $tier->discount_percentage }}% discount</p>
                    <p><i class="fas fa-times text-blue-500 w-5"></i> {{ $tier->points_multiplier }}x multiplier</p>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    <!-- Recent Redemptions -->
    <div class="rounded-2xl p-6" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-gray-800'">
                <i class="fas fa-history text-blue-500 mr-2"></i>Recent Redemptions
            </h3>
            <a href="{{ route('admin.loyalty.redemptions') }}" class="text-primary hover:underline text-sm">View All</a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                        <th class="pb-3 font-medium">User</th>
                        <th class="pb-3 font-medium">Reward</th>
                        <th class="pb-3 font-medium">Points</th>
                        <th class="pb-3 font-medium">Code</th>
                        <th class="pb-3 font-medium">Status</th>
                        <th class="pb-3 font-medium">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y" :class="darkMode ? 'divide-dark-100' : 'divide-gray-100'">
                    @forelse($recentRedemptions as $redemption)
                    <tr>
                        <td class="py-3" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $redemption->user->name ?? 'N/A' }}</td>
                        <td class="py-3" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">{{ $redemption->reward->name ?? 'N/A' }}</td>
                        <td class="py-3" :class="darkMode ? 'text-yellow-400' : 'text-yellow-600'">{{ number_format($redemption->points_spent) }}</td>
                        <td class="py-3 font-mono text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $redemption->reward_code }}</td>
                        <td class="py-3">
                            <span class="px-2 py-1 rounded-full text-xs font-medium
                                @if($redemption->status === 'active') bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400
                                @elseif($redemption->status === 'used') bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
                                @else bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300
                                @endif">
                                {{ ucfirst($redemption->status) }}
                            </span>
                        </td>
                        <td class="py-3" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $redemption->created_at->format('M d, Y') }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="py-8 text-center" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                            <i class="fas fa-inbox text-4xl mb-2 opacity-50"></i>
                            <p>No redemptions yet</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
