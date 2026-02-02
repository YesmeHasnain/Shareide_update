@extends('admin.layouts.app')

@section('title', 'Ride Details')
@section('subtitle', 'Ride #' . $ride->id)

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <!-- Ride Info -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-800">Ride Information</h3>
                <span class="px-3 py-1 text-sm rounded-full font-medium
                    @if($ride->status == 'completed') bg-green-100 text-green-600
                    @elseif($ride->status == 'in_progress') bg-blue-100 text-blue-600
                    @elseif(str_contains($ride->status, 'cancelled')) bg-red-100 text-red-600
                    @else bg-gray-100 text-gray-600 @endif">
                    {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                </span>
            </div>

            <!-- Route -->
            <div class="space-y-4 mb-6">
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-circle text-green-500 text-xs"></i>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Pickup</p>
                        <p class="text-gray-800">{{ $ride->pickup_address }}</p>
                    </div>
                </div>
                <div class="ml-4 border-l-2 border-dashed border-gray-300 h-8"></div>
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-map-marker-alt text-red-500"></i>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase">Dropoff</p>
                        <p class="text-gray-800">{{ $ride->drop_address }}</p>
                    </div>
                </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500">Distance</p>
                    <p class="font-semibold text-gray-800">{{ $ride->distance_km ?? 'N/A' }} km</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500">Duration</p>
                    <p class="font-semibold text-gray-800">{{ $ride->duration_minutes ?? 'N/A' }} min</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500">Fare</p>
                    <p class="font-semibold text-green-600">PKR {{ number_format($ride->actual_price ?? $ride->estimated_price) }}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500">Payment</p>
                    <p class="font-semibold text-gray-800">{{ ucfirst($ride->payment_method) }}</p>
                </div>
            </div>

            @if(str_contains($ride->status, 'cancelled') && $ride->cancellation_reason)
                <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm font-medium text-red-800">Cancellation Reason:</p>
                    <p class="text-red-600">{{ $ride->cancellation_reason }}</p>
                </div>
            @endif
        </div>

        <!-- Chat Messages -->
        @if($ride->chat && $ride->chat->messages->count() > 0)
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Chat Messages</h3>
            <div class="space-y-3 max-h-64 overflow-y-auto">
                @foreach($ride->chat->messages as $message)
                    <div class="p-3 rounded-lg {{ $message->sender_type == 'rider' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8' }}">
                        <p class="text-xs text-gray-500 mb-1">{{ $message->sender->name ?? 'Unknown' }} - {{ $message->created_at->format('H:i') }}</p>
                        <p class="text-gray-800">{{ $message->message }}</p>
                    </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Rating -->
        @if($ride->rating)
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Rating & Review</h3>
            <div class="grid grid-cols-2 gap-4">
                @if($ride->rating->driver_rating)
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500 mb-2">Driver Rating (by Rider)</p>
                    <div class="flex items-center">
                        @for($i = 1; $i <= 5; $i++)
                            <i class="fas fa-star {{ $i <= $ride->rating->driver_rating ? 'text-yellow-400' : 'text-gray-300' }}"></i>
                        @endfor
                        <span class="ml-2 font-semibold">{{ $ride->rating->driver_rating }}/5</span>
                    </div>
                    @if($ride->rating->driver_comment)
                        <p class="text-gray-600 mt-2 text-sm">"{{ $ride->rating->driver_comment }}"</p>
                    @endif
                </div>
                @endif
                @if($ride->rating->rider_rating)
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500 mb-2">Rider Rating (by Driver)</p>
                    <div class="flex items-center">
                        @for($i = 1; $i <= 5; $i++)
                            <i class="fas fa-star {{ $i <= $ride->rating->rider_rating ? 'text-yellow-400' : 'text-gray-300' }}"></i>
                        @endfor
                        <span class="ml-2 font-semibold">{{ $ride->rating->rider_rating }}/5</span>
                    </div>
                </div>
                @endif
            </div>
        </div>
        @endif
    </div>

    <div class="space-y-6">
        <!-- Rider Info -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Rider</h3>
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-blue-500"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">{{ $ride->rider->name ?? 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ $ride->rider->phone ?? '-' }}</p>
                </div>
            </div>
            <a href="{{ route('admin.users.show', $ride->rider_id) }}" class="mt-4 block text-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200">View Profile</a>
        </div>

        <!-- Driver Info -->
        @if($ride->driver)
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Driver</h3>
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-car text-green-500"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">{{ $ride->driver->name ?? 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ $ride->driver->phone ?? '-' }}</p>
                    @if($ride->driverDetails)
                        <p class="text-xs text-gray-400">{{ $ride->driverDetails->plate_number }}</p>
                    @endif
                </div>
            </div>
            @if($ride->driverDetails)
                <a href="{{ route('admin.drivers.show', $ride->driverDetails->id) }}" class="mt-4 block text-center px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200">View Profile</a>
            @endif
        </div>
        @endif

        <!-- Payment Info -->
        @if($ride->payment)
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment</h3>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Amount</span><span class="font-medium">PKR {{ number_format($ride->payment->amount) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Commission</span><span class="font-medium">PKR {{ number_format($ride->payment->commission_amount) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Driver Earning</span><span class="font-medium text-green-600">PKR {{ number_format($ride->payment->driver_earning) }}</span></div>
                <hr>
                <div class="flex justify-between"><span class="text-gray-500">Status</span>
                    <span class="px-2 py-0.5 text-xs rounded-full {{ $ride->payment->status == 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600' }}">
                        {{ ucfirst($ride->payment->status) }}
                    </span>
                </div>
            </div>
        </div>
        @endif

        <!-- Timeline -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Timeline</h3>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Created</span><span>{{ $ride->created_at->format('M d, H:i') }}</span></div>
                @if($ride->matched_at)<div class="flex justify-between"><span class="text-gray-500">Matched</span><span>{{ $ride->matched_at->format('M d, H:i') }}</span></div>@endif
                @if($ride->accepted_at)<div class="flex justify-between"><span class="text-gray-500">Accepted</span><span>{{ $ride->accepted_at->format('M d, H:i') }}</span></div>@endif
                @if($ride->started_at)<div class="flex justify-between"><span class="text-gray-500">Started</span><span>{{ $ride->started_at->format('M d, H:i') }}</span></div>@endif
                @if($ride->completed_at)<div class="flex justify-between"><span class="text-gray-500">Completed</span><span>{{ $ride->completed_at->format('M d, H:i') }}</span></div>@endif
                @if($ride->cancelled_at)<div class="flex justify-between"><span class="text-gray-500">Cancelled</span><span>{{ $ride->cancelled_at->format('M d, H:i') }}</span></div>@endif
            </div>
        </div>
    </div>
</div>
@endsection
