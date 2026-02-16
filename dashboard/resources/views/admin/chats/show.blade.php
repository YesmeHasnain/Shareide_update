@extends('admin.layouts.app')

@section('title', 'Chat Details')
@section('subtitle', 'Ride #' . $chat->ride_request_id)

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Chat Messages -->
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm">
            <div class="p-4 border-b flex items-center justify-between">
                <h3 class="font-semibold text-gray-800">Conversation</h3>
                <div class="flex items-center space-x-2">
                    @if($chat->status == 'active')
                        <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>
                    @else
                        <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Locked</span>
                    @endif
                    <form action="{{ route('admin.chats.toggle-lock', $chat->id) }}" method="POST" class="inline">
                        @csrf
                        <button class="px-3 py-1 text-sm {{ $chat->status == 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600' }} rounded-lg">
                            <i class="fas {{ $chat->status == 'active' ? 'fa-lock' : 'fa-unlock' }} mr-1"></i>
                            {{ $chat->status == 'active' ? 'Lock Chat' : 'Unlock Chat' }}
                        </button>
                    </form>
                </div>
            </div>

            <div class="p-4 h-96 overflow-y-auto bg-gray-50" id="chatMessages">
                @forelse($chat->messages as $message)
                    <div class="mb-4 {{ $message->sender_type == 'rider' ? 'text-right' : 'text-left' }}">
                        <div class="inline-block max-w-[70%] {{ $message->sender_type == 'rider' ? 'bg-blue-500 text-white' : 'bg-white border' }} rounded-lg p-3 shadow-sm">
                            @if($message->type == 'image')
                                <a href="{{ $message->image_url }}" target="_blank">
                                    <img src="{{ $message->image_url }}" alt="Image" class="max-w-full rounded">
                                </a>
                            @else
                                <p>{{ $message->message }}</p>
                            @endif
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            {{ $message->sender->name ?? 'Unknown' }} - {{ $message->created_at->format('M d, H:i') }}
                            <form action="{{ route('admin.chats.delete-message', [$chat->id, $message->id]) }}" method="POST" class="inline ml-2" onsubmit="return confirm('Delete this message?')">
                                @csrf @method('DELETE')
                                <button class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                            </form>
                        </div>
                    </div>
                @empty
                    <p class="text-center text-gray-500 py-8">No messages in this chat</p>
                @endforelse
            </div>

            <div class="p-4 border-t">
                <a href="{{ route('admin.chats.export', $chat->id) }}" class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm">
                    <i class="fas fa-download mr-2"></i>Export Chat
                </a>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
        <!-- Rider -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Rider</h3>
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-blue-500"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">{{ $chat->rider->name ?? 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ $chat->rider->phone ?? '-' }}</p>
                </div>
            </div>
        </div>

        <!-- Driver -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Driver</h3>
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-car text-green-500"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">{{ $chat->driver->user->name ?? 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ $chat->driver->user->phone ?? '-' }}</p>
                </div>
            </div>
        </div>

        <!-- Ride Info -->
        @if($chat->rideRequest)
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Ride Info</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Ride ID</span><span>#{{ $chat->ride_request_id }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Status</span>
                    <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100">{{ ucfirst(str_replace('_', ' ', $chat->rideRequest->status)) }}</span>
                </div>
                <div class="flex justify-between"><span class="text-gray-500">Fare</span><span>PKR {{ number_format($chat->rideRequest->estimated_price) }}</span></div>
            </div>
            <a href="{{ route('admin.rides.show', $chat->ride_request_id) }}" class="mt-4 block text-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">View Ride</a>
        </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
</script>
@endpush
@endsection
