@extends('admin.layouts.app')

@section('title', 'Achievements')
@section('subtitle', 'Manage badges and milestones')

@section('content')
<div class="space-y-6">
    <div class="flex justify-between items-center">
        <a href="{{ route('admin.loyalty.index') }}" class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'">
            <i class="ti ti-arrow-left"></i> Back to Loyalty
        </a>
        <button onclick="document.getElementById('addAchievementModal').classList.remove('hidden')" class="btn-primary px-4 py-2 rounded-xl">
            <i class="ti ti-plus mr-2"></i>Add Achievement
        </button>
    </div>

    <!-- Achievements Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($achievements as $achievement)
        <div class="rounded-2xl p-6" :class="darkMode ? 'bg-dark-200' : 'bg-white shadow-lg'">
            <div class="flex items-start justify-between mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <i class="ti ti-{{ $achievement->icon ?? 'trophy' }} text-white text-2xl"></i>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium {{ $achievement->is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500' }}">
                    {{ $achievement->is_active ? 'Active' : 'Inactive' }}
                </span>
            </div>

            <h3 class="text-lg font-bold mb-1" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ $achievement->name }}</h3>
            <p class="text-sm mb-4" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ $achievement->description }}</p>

            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Type</span>
                    <span class="font-medium" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ ucwords(str_replace('_', ' ', $achievement->type)) }}</span>
                </div>
                <div class="flex justify-between">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Target</span>
                    <span class="font-medium" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ number_format($achievement->target_value) }}</span>
                </div>
                <div class="flex justify-between">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Reward</span>
                    <span class="font-medium text-yellow-500">{{ number_format($achievement->points_reward) }} pts</span>
                </div>
                <div class="flex justify-between">
                    <span :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Completed By</span>
                    <span class="font-medium text-green-500">{{ $achievement->completed_count ?? 0 }} users</span>
                </div>
            </div>
        </div>
        @endforeach
    </div>
</div>

<!-- Add Achievement Modal -->
<div id="addAchievementModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="rounded-2xl p-6 w-full max-w-md" :class="darkMode ? 'bg-dark-200' : 'bg-white'">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-gray-800'">Add Achievement</h3>
            <button onclick="document.getElementById('addAchievementModal').classList.add('hidden')" class="text-gray-500 hover:text-gray-700">
                <i class="ti ti-x"></i>
            </button>
        </div>
        <form action="{{ route('admin.loyalty.achievements.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Name</label>
                <input type="text" name="name" required class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Slug</label>
                <input type="text" name="slug" required placeholder="e.g., first-ride" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
                <textarea name="description" required rows="2" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Type</label>
                    <select name="type" required class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                        <option value="rides_completed">Rides Completed</option>
                        <option value="referrals">Referrals</option>
                        <option value="total_spent">Total Spent</option>
                        <option value="rating">Rating</option>
                        <option value="shared_rides">Shared Rides</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Target Value</label>
                    <input type="number" name="target_value" required min="1" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Points Reward</label>
                <input type="number" name="points_reward" required min="0" class="w-full rounded-lg px-4 py-2 border" :class="darkMode ? 'bg-dark-100 border-dark-100 text-white' : 'bg-white border-gray-300'">
            </div>
            <input type="hidden" name="is_active" value="1">
            <button type="submit" class="w-full btn-primary py-3 rounded-xl font-semibold">Create Achievement</button>
        </form>
    </div>
</div>
@endsection
