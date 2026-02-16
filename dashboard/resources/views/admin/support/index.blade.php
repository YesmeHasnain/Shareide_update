@extends('admin.layouts.app')

@section('title', 'Support Tickets')
@section('subtitle', 'Manage customer support requests')

@section('content')
<div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <i class="fas fa-inbox text-yellow-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['open'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Open Tickets</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <i class="fas fa-clock text-blue-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['in_progress'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <i class="fas fa-check-circle text-green-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['resolved'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100 {{ $stats['urgent'] > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : '' }}">
            <div class="flex items-center gap-3">
                <div class="p-2 {{ $stats['urgent'] > 0 ? 'bg-red-200 dark:bg-red-900/50' : 'bg-red-100 dark:bg-red-900/30' }} rounded-lg">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold {{ $stats['urgent'] > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white' }}">{{ $stats['urgent'] }}</p>
                    <p class="text-sm {{ $stats['urgent'] > 0 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400' }}">Urgent</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-4">
        <form method="GET" class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-[200px]">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search tickets..." class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
            </div>
            <select name="status" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                <option value="">All Status</option>
                <option value="open" {{ request('status') === 'open' ? 'selected' : '' }}>Open</option>
                <option value="in_progress" {{ request('status') === 'in_progress' ? 'selected' : '' }}>In Progress</option>
                <option value="resolved" {{ request('status') === 'resolved' ? 'selected' : '' }}>Resolved</option>
                <option value="closed" {{ request('status') === 'closed' ? 'selected' : '' }}>Closed</option>
            </select>
            <select name="priority" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                <option value="">All Priority</option>
                <option value="urgent" {{ request('priority') === 'urgent' ? 'selected' : '' }}>Urgent</option>
                <option value="high" {{ request('priority') === 'high' ? 'selected' : '' }}>High</option>
                <option value="medium" {{ request('priority') === 'medium' ? 'selected' : '' }}>Medium</option>
                <option value="low" {{ request('priority') === 'low' ? 'selected' : '' }}>Low</option>
            </select>
            <select name="category" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                <option value="">All Categories</option>
                <option value="website_contact" {{ request('category') === 'website_contact' ? 'selected' : '' }}>Website Contact</option>
                <option value="ride_issue" {{ request('category') === 'ride_issue' ? 'selected' : '' }}>Ride Issue</option>
                <option value="payment" {{ request('category') === 'payment' ? 'selected' : '' }}>Payment</option>
                <option value="driver_behavior" {{ request('category') === 'driver_behavior' ? 'selected' : '' }}>Driver Behavior</option>
                <option value="app_bug" {{ request('category') === 'app_bug' ? 'selected' : '' }}>App Bug</option>
                <option value="account" {{ request('category') === 'account' ? 'selected' : '' }}>Account</option>
                <option value="other" {{ request('category') === 'other' ? 'selected' : '' }}>Other</option>
            </select>
            <button type="submit" class="px-4 py-2 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors">
                <i class="fas fa-filter mr-1"></i>Filter
            </button>
            @if(request()->hasAny(['search', 'status', 'priority', 'category']))
                <a href="{{ route('admin.support.index') }}" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <i class="fas fa-times mr-1"></i>Clear
                </a>
            @endif
        </form>
    </div>

    <!-- Tickets List -->
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-dark-300">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ticket</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assigned To</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-dark-100">
                    @forelse($tickets as $ticket)
                        <tr class="hover:bg-gray-50 dark:hover:bg-dark-300">
                            <td class="px-6 py-4">
                                <span class="font-mono text-sm text-gray-600 dark:text-gray-400">{{ $ticket->ticket_number }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    @if($ticket->is_guest)
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium">
                                            <i class="fas fa-globe"></i>
                                        </span>
                                    @endif
                                    <div>
                                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->display_name }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            @if($ticket->is_guest)
                                                {{ $ticket->guest_email }}
                                            @else
                                                {{ $ticket->user->phone ?? '' }}
                                            @endif
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <p class="text-gray-900 dark:text-white max-w-xs truncate">{{ $ticket->subject }}</p>
                                    @if($ticket->source === 'chatbot')
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 whitespace-nowrap">
                                            <i class="fas fa-robot mr-1" style="font-size:9px;"></i>Bot
                                        </span>
                                    @endif
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {{ ucfirst(str_replace('_', ' ', $ticket->category)) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                @php
                                    $priorityColors = [
                                        'urgent' => 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                                        'high' => 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                                        'medium' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                                        'low' => 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                                    ];
                                @endphp
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $priorityColors[$ticket->priority] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }}">
                                    {{ ucfirst($ticket->priority) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                @php
                                    $statusColors = [
                                        'open' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                                        'in_progress' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                                        'waiting_response' => 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                                        'resolved' => 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                                        'closed' => 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
                                    ];
                                @endphp
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $statusColors[$ticket->status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }}">
                                    {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {{ $ticket->assignedAdmin->name ?? 'Unassigned' }}
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {{ $ticket->created_at->diffForHumans() }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('admin.support.show', $ticket->id) }}" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium">
                                    <i class="fas fa-eye mr-1"></i>View
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                <i class="fas fa-ticket-alt text-4xl mb-2 opacity-50"></i>
                                <p>No tickets found.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($tickets->hasPages())
            <div class="px-6 py-4 border-t border-gray-100 dark:border-dark-100">
                {{ $tickets->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
