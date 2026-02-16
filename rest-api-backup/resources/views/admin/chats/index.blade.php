@extends('admin.layouts.app')

@section('title', 'Chat Management')
@section('subtitle', 'Monitor all rider-driver conversations')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500">Total Chats</p>
    </div>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['active'] }}</p>
        <p class="text-xs text-green-600">Active</p>
    </div>
    <div class="bg-red-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ $stats['locked'] }}</p>
        <p class="text-xs text-red-600">Locked</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ $stats['total_messages'] }}</p>
        <p class="text-xs text-blue-600">Total Messages</p>
    </div>
    <div class="bg-purple-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ $stats['today_messages'] }}</p>
        <p class="text-xs text-purple-600">Today</p>
    </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.chats.index') }}" method="GET" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
            <label class="block text-sm text-gray-600 mb-1">Search</label>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="User name or phone..."
                class="w-full px-4 py-2 border rounded-lg">
        </div>
        <div class="w-40">
            <label class="block text-sm text-gray-600 mb-1">Status</label>
            <select name="status" class="w-full px-4 py-2 border rounded-lg">
                <option value="">All</option>
                <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                <option value="locked" {{ request('status') == 'locked' ? 'selected' : '' }}>Locked</option>
            </select>
        </div>
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-search mr-2"></i>Filter</button>
        <a href="{{ route('admin.chats.search') }}" class="px-4 py-2 bg-purple-600 text-white rounded-lg"><i class="fas fa-comment-dots mr-2"></i>Search Messages</a>
    </form>
</div>

<!-- Chats Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Message</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($chats as $chat)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">#{{ $chat->ride_request_id }}</td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $chat->rider->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $chat->rider->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">{{ $chat->driver->user->name ?? 'N/A' }}</p>
                            <p class="text-xs text-gray-500">{{ $chat->driver->user->phone ?? '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm text-gray-600">{{ Str::limit($chat->last_message, 40) }}</p>
                            <p class="text-xs text-gray-400">{{ $chat->last_message_at ? $chat->last_message_at->diffForHumans() : '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            @if($chat->status == 'active')
                                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>
                            @else
                                <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Locked</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-2">
                                <a href="{{ route('admin.chats.show', $chat->id) }}" class="p-2 text-blue-600 hover:bg-blue-50 rounded"><i class="fas fa-eye"></i></a>
                                <form action="{{ route('admin.chats.toggle-lock', $chat->id) }}" method="POST">
                                    @csrf
                                    <button class="p-2 {{ $chat->status == 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50' }} rounded">
                                        <i class="fas {{ $chat->status == 'active' ? 'fa-lock' : 'fa-unlock' }}"></i>
                                    </button>
                                </form>
                                <a href="{{ route('admin.chats.export', $chat->id) }}" class="p-2 text-gray-600 hover:bg-gray-50 rounded"><i class="fas fa-download"></i></a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No chats found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $chats->links() }}</div>
</div>
@endsection
