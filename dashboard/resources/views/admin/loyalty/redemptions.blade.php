@extends('admin.layouts.app')

@section('title', 'Redemption History')
@section('subtitle', 'View all reward redemptions')

@section('content')
<div class="space-y-6">
    <a href="{{ route('admin.loyalty.index') }}" class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'">
        <i class="ti ti-arrow-left"></i> Back to Loyalty
    </a>

    <!-- Redemptions Table -->
    <div class="rounded-2xl overflow-hidden" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
        <table class="w-full">
            <thead class="border-b" :class="darkMode ? 'border-dark-100 bg-dark-300' : 'border-gray-200 bg-gray-50'">
                <tr>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">User</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Reward</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Points Spent</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Code</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Status</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Redeemed At</th>
                    <th class="text-left px-6 py-4 font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Used At</th>
                </tr>
            </thead>
            <tbody class="divide-y" :class="darkMode ? 'divide-dark-100' : 'divide-gray-100'">
                @forelse($redemptions as $redemption)
                <tr class="hover:bg-gray-50 dark:hover:bg-dark-100">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                {{ strtoupper(substr($redemption->user->name ?? 'U', 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-medium" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $redemption->user->name ?? 'Unknown' }}</p>
                                <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $redemption->user->phone ?? '' }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">{{ $redemption->reward->name ?? 'N/A' }}</td>
                    <td class="px-6 py-4">
                        <span class="font-semibold text-yellow-500">{{ number_format($redemption->points_spent) }}</span>
                    </td>
                    <td class="px-6 py-4">
                        <code class="px-2 py-1 rounded text-xs font-mono" :class="darkMode ? 'bg-dark-100 text-gray-300' : 'bg-gray-100 text-gray-700'">{{ $redemption->reward_code }}</code>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs font-medium
                            @if($redemption->status === 'active') bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400
                            @elseif($redemption->status === 'used') bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
                            @else bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300
                            @endif">
                            {{ ucfirst($redemption->status) }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $redemption->created_at->format('M d, Y h:i A') }}</td>
                    <td class="px-6 py-4 text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $redemption->used_at ? $redemption->used_at->format('M d, Y h:i A') : '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                        <i class="ti ti-inbox text-5xl mb-3 opacity-30"></i>
                        <p>No redemptions yet</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{ $redemptions->links() }}
</div>
@endsection
