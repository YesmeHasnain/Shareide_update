@extends('admin.layouts.app')

@section('title', 'Search Messages')
@section('subtitle', 'Search across all chat messages')

@section('content')
<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <form action="{{ route('admin.chats.search') }}" method="GET" class="flex gap-4">
        <div class="flex-1">
            <input type="text" name="keyword" value="{{ request('keyword') }}" placeholder="Search messages..."
                class="w-full px-4 py-2 border rounded-lg" required minlength="2">
        </div>
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg">
            <i class="fas fa-search mr-2"></i>Search
        </button>
    </form>
</div>

@if(isset($messages))
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b">
        <h3 class="font-semibold text-gray-800">{{ $messages->total() }} results for "{{ request('keyword') }}"</h3>
    </div>

    <div class="divide-y">
        @forelse($messages as $message)
            <div class="p-4 hover:bg-gray-50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-800">{{ $message->message }}</p>
                        <div class="mt-2 text-xs text-gray-500">
                            <span class="font-medium">{{ $message->sender->name ?? 'Unknown' }}</span>
                            in chat between
                            <span class="font-medium">{{ $message->chat->rider->name ?? 'N/A' }}</span>
                            &
                            <span class="font-medium">{{ $message->chat->driver->user->name ?? 'N/A' }}</span>
                            - {{ $message->created_at->format('M d, Y H:i') }}
                        </div>
                    </div>
                    <a href="{{ route('admin.chats.show', $message->chat_id) }}" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                        View Chat
                    </a>
                </div>
            </div>
        @empty
            <div class="p-8 text-center text-gray-500">No messages found</div>
        @endforelse
    </div>

    <div class="px-4 py-3 border-t">{{ $messages->links() }}</div>
</div>
@endif
@endsection
