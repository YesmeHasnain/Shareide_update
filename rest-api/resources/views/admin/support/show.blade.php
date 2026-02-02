@extends('admin.layouts.app')

@section('title', 'Ticket #' . $ticket->ticket_number)
@section('subtitle', $ticket->subject)

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <a href="{{ route('admin.support.index') }}" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <i class="fas fa-arrow-left"></i>
                </a>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $ticket->ticket_number }}</h1>
                @php
                    $statusColors = [
                        'open' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                        'in_progress' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                        'waiting_response' => 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                        'resolved' => 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                        'closed' => 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
                    ];
                    $priorityColors = [
                        'urgent' => 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                        'high' => 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                        'medium' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                        'low' => 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                    ];
                @endphp
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $statusColors[$ticket->status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }}">
                    {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}
                </span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $priorityColors[$ticket->priority] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }}">
                    {{ ucfirst($ticket->priority) }}
                </span>
            </div>
            <h2 class="text-lg text-gray-700 dark:text-gray-300">{{ $ticket->subject }}</h2>
        </div>
        <div class="flex items-center gap-3">
            <!-- Priority Update -->
            <form action="{{ route('admin.support.priority', $ticket->id) }}" method="POST" class="inline">
                @csrf
                <select name="priority" onchange="this.form.submit()" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500 text-sm">
                    <option value="low" {{ $ticket->priority === 'low' ? 'selected' : '' }}>Low</option>
                    <option value="medium" {{ $ticket->priority === 'medium' ? 'selected' : '' }}>Medium</option>
                    <option value="high" {{ $ticket->priority === 'high' ? 'selected' : '' }}>High</option>
                    <option value="urgent" {{ $ticket->priority === 'urgent' ? 'selected' : '' }}>Urgent</option>
                </select>
            </form>
            <!-- Status Update -->
            <form action="{{ route('admin.support.status', $ticket->id) }}" method="POST" class="inline">
                @csrf
                <select name="status" onchange="this.form.submit()" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500 text-sm">
                    <option value="open" {{ $ticket->status === 'open' ? 'selected' : '' }}>Open</option>
                    <option value="in_progress" {{ $ticket->status === 'in_progress' ? 'selected' : '' }}>In Progress</option>
                    <option value="waiting_response" {{ $ticket->status === 'waiting_response' ? 'selected' : '' }}>Waiting Response</option>
                    <option value="resolved" {{ $ticket->status === 'resolved' ? 'selected' : '' }}>Resolved</option>
                    <option value="closed" {{ $ticket->status === 'closed' ? 'selected' : '' }}>Closed</option>
                </select>
            </form>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Original Ticket -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                        <span class="text-gray-600 dark:text-gray-300 font-medium">{{ substr($ticket->user->name ?? 'U', 0, 1) }}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->name ?? 'Unknown User' }}</p>
                            <span class="text-sm text-gray-500 dark:text-gray-400">{{ $ticket->created_at->format('M d, Y H:i') }}</span>
                        </div>
                        <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                            {!! nl2br(e($ticket->description)) !!}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Messages -->
            @foreach($ticket->messages as $message)
                <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6 {{ $message->is_internal ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' : '' }}">
                    @if($message->is_internal)
                        <div class="mb-3">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                                <i class="fas fa-lock mr-1"></i>Internal Note
                            </span>
                        </div>
                    @endif
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 {{ $message->sender_type === 'admin' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700' }} rounded-full flex items-center justify-center">
                            <span class="{{ $message->sender_type === 'admin' ? 'text-white' : 'text-gray-600 dark:text-gray-300' }} font-medium">
                                {{ substr($message->user->name ?? 'U', 0, 1) }}
                            </span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <p class="font-medium text-gray-900 dark:text-white">{{ $message->user->name ?? 'Unknown' }}</p>
                                    @if($message->sender_type === 'admin')
                                        <span class="text-xs text-yellow-600 dark:text-yellow-400 font-medium">(Staff)</span>
                                    @endif
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400">{{ $message->created_at->format('M d, Y H:i') }}</span>
                            </div>
                            <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                {!! nl2br(e($message->message)) !!}
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach

            <!-- Reply Form -->
            @if($ticket->status !== 'closed')
                <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <i class="fas fa-reply mr-2 text-yellow-500"></i>Reply
                    </h3>
                    <form action="{{ route('admin.support.reply', $ticket->id) }}" method="POST">
                        @csrf
                        <div class="space-y-4">
                            <div>
                                <textarea name="message" rows="4" required class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="Type your reply..."></textarea>
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="is_internal" value="1" class="rounded border-gray-300 dark:border-dark-100 text-yellow-600 focus:ring-yellow-500">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Internal note (not visible to user)</span>
                                </label>
                                <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
                                    <i class="fas fa-paper-plane mr-2"></i>Send Reply
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            @endif
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- User Info -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <i class="fas fa-user mr-2 text-yellow-500"></i>User Details
                </h3>
                <div class="space-y-3">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->name ?? 'Unknown' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->phone ?? 'N/A' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->email ?? 'N/A' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Role</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst($ticket->user_type ?? $ticket->user->role ?? 'Unknown') }}</p>
                    </div>
                    @if($ticket->user)
                        <div class="pt-2">
                            <a href="{{ route('admin.users.show', $ticket->user->id) }}" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm font-medium">
                                <i class="fas fa-external-link-alt mr-1"></i>View Full Profile
                            </a>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Ticket Info -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <i class="fas fa-ticket-alt mr-2 text-yellow-500"></i>Ticket Details
                </h3>
                <div class="space-y-3">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Category</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst(str_replace('_', ' ', $ticket->category)) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->created_at->format('M d, Y H:i') }}</p>
                    </div>
                    @if($ticket->resolved_at)
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->resolved_at->format('M d, Y H:i') }}</p>
                        </div>
                    @endif
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->assignedAdmin->name ?? 'Unassigned' }}</p>
                    </div>
                    @if($ticket->ride_request_id)
                        <div class="pt-2">
                            <a href="{{ route('admin.rides.show', $ticket->ride_request_id) }}" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm font-medium">
                                <i class="fas fa-car mr-1"></i>View Related Ride
                            </a>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <i class="fas fa-bolt mr-2 text-yellow-500"></i>Quick Actions
                </h3>
                <div class="space-y-2">
                    @if($ticket->status !== 'resolved' && $ticket->status !== 'closed')
                        <form action="{{ route('admin.support.status', $ticket->id) }}" method="POST">
                            @csrf
                            <input type="hidden" name="status" value="resolved">
                            <button type="submit" class="w-full px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium transition-colors">
                                <i class="fas fa-check mr-2"></i>Mark as Resolved
                            </button>
                        </form>
                    @endif
                    @if($ticket->status !== 'closed')
                        <form action="{{ route('admin.support.status', $ticket->id) }}" method="POST">
                            @csrf
                            <input type="hidden" name="status" value="closed">
                            <button type="submit" class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                                <i class="fas fa-times mr-2"></i>Close Ticket
                            </button>
                        </form>
                    @endif
                    @if(!$ticket->assigned_to)
                        <form action="{{ route('admin.support.assign', $ticket->id) }}" method="POST">
                            @csrf
                            <input type="hidden" name="assigned_to" value="{{ auth()->id() }}">
                            <button type="submit" class="w-full px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-sm font-medium transition-colors">
                                <i class="fas fa-hand-point-up mr-2"></i>Assign to Me
                            </button>
                        </form>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
