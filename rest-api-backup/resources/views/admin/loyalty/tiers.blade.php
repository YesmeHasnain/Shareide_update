@extends('admin.layouts.app')

@section('title', 'Loyalty Tiers')
@section('subtitle', 'Manage membership levels')

@section('content')
<div class="space-y-6">
    <!-- Add Tier Button -->
    <div class="flex justify-between items-center">
        <a href="{{ route('admin.loyalty.index') }}" class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'">
            <i class="fas fa-arrow-left"></i> Back to Loyalty
        </a>
        <button onclick="document.getElementById('addTierModal').classList.remove('hidden')" class="btn-primary px-4 py-2 rounded-xl">
            <i class="fas fa-plus mr-2"></i>Add Tier
        </button>
    </div>

    <!-- Tiers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @foreach($tiers as $tier)
        <div class="rounded-2xl p-6 border-t-4" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'" style="border-top-color: {{ $tier->badge_color }}">
            <div class="flex items-center justify-between mb-4">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center" style="background-color: {{ $tier->badge_color }}">
                    <i class="fas fa-crown text-white text-2xl"></i>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium {{ $tier->is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700' }}">
                    {{ $tier->is_active ? 'Active' : 'Inactive' }}
                </span>
            </div>

            <h3 class="text-xl font-bold mb-2" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $tier->name }}</h3>
            <p class="text-sm mb-4" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $tier->users_count }} members</p>

            <div class="space-y-3 mb-4">
                <div class="flex justify-between text-sm">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Min Points</span>
                    <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ number_format($tier->min_points) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Max Points</span>
                    <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $tier->max_points ? number_format($tier->max_points) : 'Unlimited' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Discount</span>
                    <span class="font-semibold text-green-500">{{ $tier->discount_percentage }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Points Multiplier</span>
                    <span class="font-semibold text-yellow-500">{{ $tier->points_multiplier }}x</span>
                </div>
            </div>

            @if($tier->benefits)
            <div class="border-t pt-3 mt-3" :class="darkMode ? 'border-dark-100' : 'border-gray-200'">
                <p class="text-xs font-medium mb-2" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Benefits:</p>
                <ul class="space-y-1">
                    @foreach($tier->benefits as $benefit)
                    <li class="text-xs flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                        <i class="fas fa-check text-green-500"></i>{{ $benefit }}
                    </li>
                    @endforeach
                </ul>
            </div>
            @endif
        </div>
        @endforeach
    </div>
</div>

<!-- Add Tier Modal -->
<div id="addTierModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="rounded-2xl p-6 w-full max-w-md" :class="darkMode ? 'bg-dark-200' : 'bg-white'">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-gray-800'">Add New Tier</h3>
            <button onclick="document.getElementById('addTierModal').classList.add('hidden')" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form action="{{ route('admin.loyalty.tiers.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Name</label>
                <input type="text" name="name" required class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Min Points</label>
                    <input type="number" name="min_points" required min="0" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Max Points</label>
                    <input type="number" name="max_points" min="0" placeholder="Optional" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Discount %</label>
                    <input type="number" name="discount_percentage" required min="0" max="100" step="0.01" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Points Multiplier</label>
                    <input type="number" name="points_multiplier" required min="1" max="10" step="0.01" value="1" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Badge Color</label>
                <input type="color" name="badge_color" value="#FFD700" class="w-full h-10 rounded-lg border" :class="darkMode ? 'border-dark-100' : 'border-gray-300'">
            </div>
            <button type="submit" class="w-full btn-primary py-3 rounded-xl font-semibold">Create Tier</button>
        </form>
    </div>
</div>
@endsection
