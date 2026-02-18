@extends('admin.layouts.app')

@section('title', 'Users Management')
@section('subtitle', 'Manage all riders/passengers')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-3 gap-4 mb-6">
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-4 text-center">
        <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
    </div>
    <div class="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm border border-green-100 dark:border-green-800 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['active'] }}</p>
        <p class="text-xs text-green-600">Active</p>
    </div>
    <div class="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border border-red-100 dark:border-red-800 p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ $stats['blocked'] }}</p>
        <p class="text-xs text-red-600">Blocked</p>
    </div>
</div>

<!-- Filters -->
<div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-4 mb-6">
    <form action="{{ route('admin.users.index') }}" method="GET" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Name, phone, email..."
                class="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Status</label>
            <select name="status" class="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                <option value="">All</option>
                <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                <option value="blocked" {{ request('status') == 'blocked' ? 'selected' : '' }}>Blocked</option>
            </select>
        </div>
        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
            <i class="ti ti-search mr-2"></i>Filter
        </button>
        <a href="{{ route('admin.users.index') }}" class="px-4 py-2 bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-100 transition-colors">
            <i class="ti ti-x"></i>
        </a>
    </form>
</div>

<!-- Users Table -->
<div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
    <div class="p-4 border-b border-gray-100 dark:border-dark-100 flex justify-between items-center">
        <h3 class="font-semibold text-gray-800 dark:text-white">All Users</h3>
        <a href="{{ route('admin.users.export', request()->query()) }}" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
            <i class="ti ti-download mr-2"></i>Export
        </a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50 dark:bg-dark-300">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wallet</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rides</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last IP</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-100">
                @forelse($users as $user)
                    <tr class="hover:bg-gray-50 dark:hover:bg-dark-300">
                        <td class="px-4 py-3">
                            <div class="flex items-center">
                                @if($user->profile_photo)
                                    <div class="w-10 h-10 rounded-lg overflow-hidden">
                                        <img src="{{ config('app.api_storage_url') }}/{{ $user->profile_photo }}" alt="{{ $user->name }}" class="w-full h-full object-cover">
                                    </div>
                                @else
                                    <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                        <span class="text-white font-medium">{{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}</span>
                                    </div>
                                @endif
                                <div class="ml-3">
                                    <p class="font-medium text-gray-800 dark:text-white">{{ $user->name ?? 'N/A' }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">ID: {{ $user->id }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm text-gray-800 dark:text-white">{{ $user->phone }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $user->email ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-green-600">PKR {{ number_format($user->riderWallet->balance ?? 0) }}</p>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ $user->ridesAsRider()->count() }}</td>
                        <td class="px-4 py-3">
                            @if($user->last_ip)
                                <code class="text-[11px] bg-gray-100 dark:bg-dark-100 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{{ $user->last_ip }}</code>
                            @else
                                <span class="text-xs text-gray-400">-</span>
                            @endif
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ $user->created_at->format('M d, Y') }}</td>
                        <td class="px-4 py-3">
                            @if($user->status == 'active')
                                <span class="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Active</span>
                            @else
                                <span class="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Blocked</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-2">
                                <a href="{{ route('admin.users.show', $user->id) }}" class="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors">
                                    <i class="ti ti-eye"></i>
                                </a>
                                @if($user->status == 'active')
                                    <form action="{{ route('admin.users.block', $user->id) }}" method="POST" onsubmit="return confirm('Block this user?')">
                                        @csrf
                                        <button class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                            <i class="ti ti-ban"></i>
                                        </button>
                                    </form>
                                @else
                                    <form action="{{ route('admin.users.unblock', $user->id) }}" method="POST">
                                        @csrf
                                        <button class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                                            <i class="ti ti-lock-open"></i>
                                        </button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <i class="ti ti-users text-4xl mb-2 opacity-50"></i>
                            <p>No users found</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t border-gray-100 dark:border-dark-100">{{ $users->links() }}</div>
</div>
@endsection
