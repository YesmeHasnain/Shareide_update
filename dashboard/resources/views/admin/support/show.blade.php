@extends('admin.layouts.app')

@section('title', 'Ticket #' . $ticket->ticket_number)
@section('subtitle', $ticket->subject)

@push('styles')
<style>
    /* Chat container styling */
    #chatMessages {
        scroll-behavior: smooth;
    }
    #chatMessages::-webkit-scrollbar {
        width: 5px;
    }
    #chatMessages::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.4);
        border-radius: 3px;
    }
    #chatMessages::-webkit-scrollbar-track {
        background: transparent;
    }
    .dark #chatMessages::-webkit-scrollbar-thumb {
        background: rgba(75, 85, 99, 0.5);
    }

    /* Chat bubble animations */
    .chat-bubble-in {
        animation: bubbleIn 0.3s ease-out;
    }
    @keyframes bubbleIn {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Typing indicator */
    .typing-dot {
        animation: typingBounce 1.4s infinite ease-in-out both;
    }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }

    /* Pulse for online indicator */
    @keyframes onlinePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .online-pulse {
        animation: onlinePulse 2s ease-in-out infinite;
    }

    /* Send button animation */
    .send-btn:active {
        transform: scale(0.92);
    }
    .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
@endpush

@section('content')
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

<div class="space-y-4">
    {{-- Header --}}
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.support.index') }}" class="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <i class="ti ti-arrow-left text-sm"></i>
            </a>
            <div>
                <div class="flex items-center gap-2">
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ $ticket->ticket_number }}</h1>
                    <span id="statusBadge" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$ticket->status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }}">
                        {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}
                    </span>
                    <span id="priorityBadge" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $priorityColors[$ticket->priority] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }}">
                        {{ ucfirst($ticket->priority) }}
                    </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ $ticket->subject }}</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            {{-- Priority selector --}}
            <select id="prioritySelect" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500 text-xs py-1.5 px-2">
                <option value="low" {{ $ticket->priority === 'low' ? 'selected' : '' }}>Low</option>
                <option value="medium" {{ $ticket->priority === 'medium' ? 'selected' : '' }}>Medium</option>
                <option value="high" {{ $ticket->priority === 'high' ? 'selected' : '' }}>High</option>
                <option value="urgent" {{ $ticket->priority === 'urgent' ? 'selected' : '' }}>Urgent</option>
            </select>
            {{-- Status selector --}}
            <select id="statusSelect" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500 text-xs py-1.5 px-2">
                <option value="open" {{ $ticket->status === 'open' ? 'selected' : '' }}>Open</option>
                <option value="in_progress" {{ $ticket->status === 'in_progress' ? 'selected' : '' }}>In Progress</option>
                <option value="waiting_response" {{ $ticket->status === 'waiting_response' ? 'selected' : '' }}>Waiting Response</option>
                <option value="resolved" {{ $ticket->status === 'resolved' ? 'selected' : '' }}>Resolved</option>
                <option value="closed" {{ $ticket->status === 'closed' ? 'selected' : '' }}>Closed</option>
            </select>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {{-- ============================================================ --}}
        {{-- MAIN CHAT AREA (2/3 width) --}}
        {{-- ============================================================ --}}
        <div class="lg:col-span-2 flex flex-col" style="height: calc(100vh - 220px); min-height: 500px;">

            {{-- Bot Transcript (collapsible) --}}
            @if(str_contains($ticket->description ?? '', '--- Bot Conversation Transcript ---'))
                @php
                    $parts = explode('--- Bot Conversation Transcript ---', $ticket->description, 2);
                    $beforeTranscript = trim($parts[0] ?? '');
                    $transcriptRaw = $parts[1] ?? '';
                    $transcriptRaw = str_replace('--- End of Bot Transcript ---', '', $transcriptRaw);
                    $transcriptLines = array_filter(array_map('trim', explode("\n", trim($transcriptRaw))));
                @endphp
                <details class="mb-3 bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden flex-shrink-0">
                    <summary class="px-4 py-3 cursor-pointer text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2">
                        <i class="ti ti-robot"></i>
                        <span>Bot Conversation Transcript ({{ count($transcriptLines) }} messages)</span>
                        @if($beforeTranscript)
                            <span class="ml-auto text-xs text-gray-400 dark:text-gray-500 font-normal truncate max-w-[200px]">{{ Str::limit($beforeTranscript, 50) }}</span>
                        @endif
                    </summary>
                    <div class="border-t border-gray-100 dark:border-dark-100">
                        @if($beforeTranscript)
                            <div class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-300 border-b border-gray-100 dark:border-dark-100">
                                {!! nl2br(e($beforeTranscript)) !!}
                            </div>
                        @endif
                        <div class="p-4 space-y-2 max-h-52 overflow-y-auto bg-gray-50/50 dark:bg-dark-300/50">
                            @foreach($transcriptLines as $line)
                                @if(str_starts_with($line, 'User:'))
                                    <div class="flex justify-end">
                                        <span class="inline-block px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-2xl rounded-br-sm text-xs max-w-[80%]">{{ trim(substr($line, 5)) }}</span>
                                    </div>
                                @elseif(str_starts_with($line, 'Bot:'))
                                    <div class="flex justify-start">
                                        <span class="inline-block px-3 py-1.5 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-2xl rounded-bl-sm text-xs max-w-[80%] border border-gray-200 dark:border-dark-100">{{ trim(substr($line, 4)) }}</span>
                                    </div>
                                @endif
                            @endforeach
                        </div>
                    </div>
                </details>
            @endif

            {{-- Chat Container --}}
            <div class="flex-1 flex flex-col bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">

                {{-- Chat Header Bar --}}
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-100 bg-gray-50/50 dark:bg-dark-300/30 flex-shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-9 h-9 bg-gradient-to-br {{ $ticket->is_guest ? 'from-purple-400 to-purple-600' : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700' }} rounded-full flex items-center justify-center">
                                <span class="text-white font-semibold text-sm">{{ strtoupper(substr($ticket->display_name, 0, 1)) }}</span>
                            </div>
                            @if($ticket->is_guest && !in_array($ticket->status, ['closed', 'resolved']))
                                <span id="chatOnlineDot" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-200 bg-gray-400" title="Checking..."></span>
                            @endif
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ $ticket->display_name }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                @if($ticket->is_guest)
                                    <span class="text-purple-600 dark:text-purple-400">Guest</span> &middot;
                                @endif
                                {{ ucfirst(str_replace('_', ' ', $ticket->category)) }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span id="chatOnlineText" class="text-xs text-gray-400 dark:text-gray-500 hidden">
                            <i class="ti ti-circle text-[6px] align-middle"></i> <span></span>
                        </span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">{{ $ticket->messages->count() }} messages</span>
                    </div>
                </div>

                {{-- Scrollable Messages Area --}}
                <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3" style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22none%22 width=%2260%22 height=%2260%22/><circle cx=%2230%22 cy=%2230%22 r=%221%22 fill=%22rgba(0,0,0,0.03)%22/></svg>'); background-size: 60px 60px;">

                    {{-- Initial ticket description as first message --}}
                    <div class="flex justify-start items-end gap-2 chat-bubble-in">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-br {{ $ticket->is_guest ? 'from-purple-400 to-purple-600' : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700' }} flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xs font-semibold">{{ strtoupper(substr($ticket->display_name, 0, 1)) }}</span>
                        </div>
                        <div class="max-w-[75%]">
                            <div class="px-3 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-100 shadow-sm">
                                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $ticket->display_name }} &middot; Opened ticket</p>
                                @php
                                    $descriptionText = $ticket->description;
                                    if (str_contains($descriptionText, '--- Bot Conversation Transcript ---')) {
                                        $descriptionText = trim(explode('--- Bot Conversation Transcript ---', $descriptionText, 2)[0]);
                                    }
                                @endphp
                                @if($descriptionText)
                                    <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{{ $descriptionText }}</p>
                                @else
                                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Escalated from chatbot</p>
                                @endif
                            </div>
                            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">{{ $ticket->created_at->format('M d, Y \a\t h:i A') }}</p>
                        </div>
                    </div>

                    {{-- All messages --}}
                    @foreach($ticket->messages as $message)
                        @if($message->sender_type === 'admin')
                            {{-- Admin message — right side --}}
                            <div class="flex justify-end items-end gap-2 chat-bubble-in" data-message-id="{{ $message->id }}">
                                <div class="max-w-[75%]">
                                    @if($message->is_internal)
                                        <div class="px-3 py-2 rounded-2xl rounded-br-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 shadow-sm">
                                            <div class="flex items-center gap-1.5 mb-1">
                                                <i class="ti ti-lock text-[9px] text-amber-500"></i>
                                                <p class="text-xs font-medium text-amber-600 dark:text-amber-400">Internal Note</p>
                                            </div>
                                            <p class="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line">{{ $message->message }}</p>
                                        </div>
                                    @else
                                        <div class="px-3 py-2 rounded-2xl rounded-br-sm bg-gradient-to-br from-yellow-400 to-orange-400 shadow-sm">
                                            @if($message->attachment)
                                                @php $fileUrl = route('admin.support.file', [$ticket->id, $message->id]); @endphp
                                                @if(in_array(strtolower(pathinfo($message->attachment, PATHINFO_EXTENSION)), ['jpg','jpeg','png','gif','webp']))
                                                    <span class="block mb-1 cursor-pointer img-lightbox-trigger" data-lightbox-src="{{ $fileUrl }}">
                                                        <img src="{{ $fileUrl }}" alt="Attachment" class="max-w-[220px] rounded-lg hover:opacity-90 transition-opacity">
                                                    </span>
                                                @else
                                                    <a href="{{ $fileUrl }}" target="_blank" class="flex items-center gap-2 p-2 bg-black/10 rounded-lg mb-1 hover:bg-black/20 transition-colors">
                                                        <i class="ti ti-file text-lg"></i>
                                                        <span class="text-xs font-medium truncate">{{ basename($message->attachment) }}</span>
                                                        <i class="ti ti-download text-xs ml-auto"></i>
                                                    </a>
                                                @endif
                                            @endif
                                            @if($message->message)
                                                <p class="text-sm text-black whitespace-pre-line">{{ $message->message }}</p>
                                            @endif
                                        </div>
                                    @endif
                                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mr-1 text-right">
                                        {{ $message->user->name ?? 'Admin' }} &middot; {{ $message->created_at->format('M d \a\t h:i A') }}
                                    </p>
                                </div>
                                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                    <span class="text-white text-xs font-semibold">{{ strtoupper(substr($message->user->name ?? 'A', 0, 1)) }}</span>
                                </div>
                            </div>
                        @else
                            {{-- Guest message — left side --}}
                            <div class="flex justify-start items-end gap-2 chat-bubble-in" data-message-id="{{ $message->id }}">
                                <div class="w-7 h-7 rounded-full bg-gradient-to-br {{ $ticket->is_guest ? 'from-purple-400 to-purple-600' : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700' }} flex items-center justify-center flex-shrink-0">
                                    <span class="text-white text-xs font-semibold">{{ strtoupper(substr($ticket->display_name, 0, 1)) }}</span>
                                </div>
                                <div class="max-w-[75%]">
                                    <div class="px-3 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-100 shadow-sm">
                                        @if($message->attachment)
                                            @php $fileUrl = route('admin.support.file', [$ticket->id, $message->id]); @endphp
                                            @if(in_array(strtolower(pathinfo($message->attachment, PATHINFO_EXTENSION)), ['jpg','jpeg','png','gif','webp']))
                                                <span class="block mb-1 cursor-pointer img-lightbox-trigger" data-lightbox-src="{{ $fileUrl }}">
                                                    <img src="{{ $fileUrl }}" alt="Attachment" class="max-w-[220px] rounded-lg hover:opacity-90 transition-opacity">
                                                </span>
                                            @else
                                                <a href="{{ $fileUrl }}" target="_blank" class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-dark-100 rounded-lg mb-1 hover:bg-gray-200 dark:hover:bg-dark-200 transition-colors">
                                                    <i class="ti ti-file text-lg text-gray-500"></i>
                                                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ basename($message->attachment) }}</span>
                                                    <i class="ti ti-download text-xs text-gray-400 ml-auto"></i>
                                                </a>
                                            @endif
                                        @endif
                                        @if($message->message)
                                            <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{{ $message->message }}</p>
                                        @endif
                                    </div>
                                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">{{ $message->created_at->format('M d \a\t h:i A') }}</p>
                                </div>
                            </div>
                        @endif
                    @endforeach

                    {{-- Guest typing indicator (hidden by default) --}}
                    <div id="guestTypingIndicator" class="flex justify-start items-end gap-2" style="display: none;">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-br {{ $ticket->is_guest ? 'from-purple-400 to-purple-600' : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700' }} flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xs font-semibold">{{ strtoupper(substr($ticket->display_name, 0, 1)) }}</span>
                        </div>
                        <div class="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-100 shadow-sm">
                            <div class="flex items-center gap-1">
                                <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot"></span>
                                <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot"></span>
                                <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot"></span>
                            </div>
                        </div>
                    </div>

                </div>

                {{-- Reply Input Bar (chat-style) --}}
                @if($ticket->status !== 'closed')
                    <div class="flex-shrink-0 border-t border-gray-100 dark:border-dark-100 bg-gray-50/80 dark:bg-dark-300/50 px-3 py-3">
                        {{-- Internal note toggle --}}
                        <div class="flex items-center gap-3 mb-2">
                            <label class="flex items-center gap-1.5 cursor-pointer select-none">
                                <input type="checkbox" id="internalNoteToggle" class="rounded border-gray-300 dark:border-dark-100 text-yellow-600 focus:ring-yellow-500 w-3.5 h-3.5">
                                <span class="text-[11px] text-gray-500 dark:text-gray-400"><i class="ti ti-lock mr-0.5"></i> Internal note</span>
                            </label>
                            <div id="internalNoteHint" class="text-[10px] text-amber-500 dark:text-amber-400 hidden">
                                <i class="ti ti-eye-off mr-0.5"></i> Not visible to user
                            </div>
                        </div>
                        {{-- File preview bar --}}
                        <div id="filePreview" class="hidden mb-2 p-2 bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100">
                            <div class="flex items-center gap-2">
                                <div id="filePreviewThumb" class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <i class="ti ti-file text-gray-400"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p id="filePreviewName" class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate"></p>
                                    <p id="filePreviewSize" class="text-[10px] text-gray-400"></p>
                                </div>
                                <button id="filePreviewRemove" type="button" class="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-dark-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                    <i class="ti ti-x text-xs"></i>
                                </button>
                            </div>
                        </div>
                        {{-- Input row --}}
                        <div class="flex items-end gap-2">
                            <input type="file" id="fileInput" class="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip">
                            <button id="attachBtn" type="button"
                                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-100 hover:bg-gray-200 dark:hover:bg-dark-300 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-yellow-600 transition-all flex-shrink-0"
                                title="Attach file">
                                <i class="ti ti-paperclip text-sm"></i>
                            </button>
                            <div class="flex-1 relative">
                                <textarea id="chatInput"
                                    rows="1"
                                    maxlength="5000"
                                    class="w-full rounded-2xl border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm px-4 py-2.5 pr-10 resize-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                                    placeholder="Type a message..."
                                    style="min-height: 42px; max-height: 120px;"></textarea>
                            </div>
                            <button id="sendBtn"
                                class="send-btn w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 flex items-center justify-center text-black shadow-md hover:shadow-lg transition-all flex-shrink-0"
                                title="Send message">
                                <i class="ti ti-send text-sm"></i>
                            </button>
                        </div>
                    </div>
                @else
                    <div class="flex-shrink-0 border-t border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300/50 px-4 py-3 text-center">
                        <p class="text-sm text-gray-400 dark:text-gray-500"><i class="ti ti-lock mr-1"></i> This ticket is closed</p>
                    </div>
                @endif
            </div>
        </div>

        {{-- ============================================================ --}}
        {{-- SIDEBAR (1/3 width) --}}
        {{-- ============================================================ --}}
        <div class="space-y-4">

            {{-- Guest Online Status --}}
            @if($ticket->is_guest && !in_array($ticket->status, ['closed', 'resolved']))
                <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-4" id="guestStatusCard">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <i class="ti ti-wifi mr-1"></i> Guest Status
                        </span>
                        <span id="guestOnlineIndicator" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            <span class="w-2 h-2 rounded-full bg-gray-400"></span> Checking...
                        </span>
                    </div>
                </div>
            @endif

            {{-- User Info --}}
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-5">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i class="ti ti-user text-yellow-500 text-xs"></i>
                    @if($ticket->is_guest) Website Contact @else User Details @endif
                </h3>
                @if($ticket->is_guest)
                    <div class="mb-3 flex flex-wrap gap-1.5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            <i class="ti ti-world mr-1"></i>Website
                        </span>
                        @if($ticket->source === 'chatbot')
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <i class="ti ti-robot mr-1"></i>AI Bot
                            </span>
                        @endif
                    </div>
                    <div class="space-y-2.5 text-sm">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Name</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->guest_name ?? 'Unknown' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            <p class="font-medium text-gray-900 dark:text-white">
                                <a href="mailto:{{ $ticket->guest_email }}" class="text-blue-600 hover:underline">{{ $ticket->guest_email ?? 'N/A' }}</a>
                            </p>
                        </div>
                        @if($ticket->guest_phone)
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                            <p class="font-medium text-gray-900 dark:text-white">
                                <a href="tel:{{ $ticket->guest_phone }}" class="text-blue-600 hover:underline">{{ $ticket->guest_phone }}</a>
                            </p>
                        </div>
                        @endif
                    </div>
                @else
                    <div class="space-y-2.5 text-sm">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Name</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->name ?? 'Unknown' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->phone ?? 'N/A' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->user->email ?? 'N/A' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Role</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst($ticket->user_type ?? $ticket->user->role ?? 'Unknown') }}</p>
                        </div>
                        @if($ticket->user)
                            <div class="pt-1">
                                <a href="{{ route('admin.users.show', $ticket->user->id) }}" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-xs font-medium">
                                    <i class="ti ti-external-link mr-1"></i>View Full Profile
                                </a>
                            </div>
                        @endif
                    </div>
                @endif

                {{-- IP Address --}}
                @if($ticket->ip_address)
                <div class="mt-3 pt-3 border-t border-gray-100 dark:border-dark-100">
                    <div class="space-y-2 text-sm">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                            <code class="text-[12px] bg-gray-100 dark:bg-dark-100 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{{ $ticket->ip_address }}</code>
                        </div>
                        @if($ticket->user_agent)
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Browser</p>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 break-all">{{ Str::limit($ticket->user_agent, 80) }}</p>
                        </div>
                        @endif
                    </div>
                </div>
                @endif
            </div>

            {{-- Ticket Details --}}
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-5">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i class="ti ti-ticket text-yellow-500 text-xs"></i>
                    Ticket Details
                </h3>
                <div class="space-y-2.5 text-sm">
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Source</p>
                        @php
                            $sourceStyles = [
                                'blue' => 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                'indigo' => 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
                                'green' => 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                'emerald' => 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                                'orange' => 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                'amber' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            ];
                        @endphp
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold {{ $sourceStyles[$ticket->source_color] ?? $sourceStyles['blue'] }} whitespace-nowrap mt-1">
                            <i class="ti {{ $ticket->source_icon }} mr-1" style="font-size:10px;"></i>{{ $ticket->source_label }}
                        </span>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Category</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst(str_replace('_', ' ', $ticket->category)) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Created</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->created_at->format('M d, Y H:i') }}</p>
                    </div>
                    @if($ticket->resolved_at)
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Resolved</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->resolved_at->format('M d, Y H:i') }}</p>
                        </div>
                    @endif
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ticket->assignedAdmin->name ?? 'Unassigned' }}</p>
                    </div>
                    @if($ticket->ride_request_id)
                        <div class="pt-1">
                            <a href="{{ route('admin.rides.show', $ticket->ride_request_id) }}" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-xs font-medium">
                                <i class="ti ti-car mr-1"></i>View Related Ride
                            </a>
                        </div>
                    @endif
                </div>
            </div>

            {{-- Quick Actions --}}
            <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-5">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i class="ti ti-bolt text-yellow-500 text-xs"></i>
                    Quick Actions
                </h3>
                <div class="space-y-2" id="quickActions">
                    @if($ticket->status !== 'resolved' && $ticket->status !== 'closed')
                        <button onclick="quickAction('status', 'resolved', this)" class="w-full px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="ti ti-check"></i> Mark as Resolved
                        </button>
                    @endif
                    @if($ticket->status !== 'closed')
                        <button onclick="quickAction('status', 'closed', this)" class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="ti ti-x"></i> Close Ticket
                        </button>
                    @endif
                    @if(!$ticket->assigned_to)
                        <button onclick="quickAction('assign', '{{ auth()->id() }}', this)" class="w-full px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="ti ti-hand-finger"></i> Assign to Me
                        </button>
                    @endif
                    <div class="border-t border-gray-200 dark:border-dark-100 my-2 pt-2">
                        <button onclick="deleteTicket()" class="w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="ti ti-trash"></i> Delete Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Hidden delete form --}}
<form id="deleteTicketForm" method="POST" action="{{ route('admin.support.destroy', $ticket->id) }}" style="display:none;">
    @csrf
    @method('DELETE')
</form>
@endsection

@push('scripts')
<script>
(function() {
    // =============================================
    // CONFIGURATION
    // =============================================
    var TICKET_ID = {{ $ticket->id }};
    var TICKET_STATUS = '{{ $ticket->status }}';
    var IS_GUEST = {{ $ticket->is_guest ? 'true' : 'false' }};
    var ADMIN_NAME = '{{ addslashes(auth()->user()->name ?? "Admin") }}';
    var ADMIN_INITIAL = '{{ strtoupper(substr(auth()->user()->name ?? "A", 0, 1)) }}';
    var GUEST_NAME = '{{ addslashes($ticket->display_name) }}';
    var GUEST_INITIAL = '{{ strtoupper(substr($ticket->display_name, 0, 1)) }}';
    var IS_GUEST_USER = {{ $ticket->is_guest ? 'true' : 'false' }};
    var LAST_MESSAGE_ID = {{ $ticket->messages->last() ? $ticket->messages->last()->id : 0 }};
    var CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').content;
    var IS_ACTIVE = ['open', 'in_progress', 'waiting_response'].indexOf(TICKET_STATUS) !== -1;

    var REPLY_URL = '{{ route("admin.support.reply", $ticket->id) }}';
    var STATUS_URL = '{{ route("admin.support.status", $ticket->id) }}';
    var PRIORITY_URL = '{{ route("admin.support.priority", $ticket->id) }}';
    var ASSIGN_URL = '{{ route("admin.support.assign", $ticket->id) }}';
    var TYPING_URL = '{{ route("admin.support.typing", $ticket->id) }}';
    var MESSAGES_URL = '{{ route("admin.support.messages", $ticket->id) }}';
    var UPLOAD_URL = '{{ route("admin.support.upload", $ticket->id) }}';

    // =============================================
    // DOM REFERENCES
    // =============================================
    var chatMessages = document.getElementById('chatMessages');
    var chatInput = document.getElementById('chatInput');
    var sendBtn = document.getElementById('sendBtn');
    var internalToggle = document.getElementById('internalNoteToggle');
    var internalHint = document.getElementById('internalNoteHint');
    var statusSelect = document.getElementById('statusSelect');
    var prioritySelect = document.getElementById('prioritySelect');
    var guestTypingEl = document.getElementById('guestTypingIndicator');
    var fileInput = document.getElementById('fileInput');
    var attachBtn = document.getElementById('attachBtn');
    var filePreview = document.getElementById('filePreview');
    var filePreviewThumb = document.getElementById('filePreviewThumb');
    var filePreviewName = document.getElementById('filePreviewName');
    var filePreviewSize = document.getElementById('filePreviewSize');
    var filePreviewRemove = document.getElementById('filePreviewRemove');
    var pendingFile = null;

    // =============================================
    // AUTO-SCROLL TO BOTTOM
    // =============================================
    function scrollToBottom(smooth) {
        if (!chatMessages) return;
        if (smooth) {
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        } else {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Scroll on load
    scrollToBottom(false);

    // =============================================
    // AUTO-RESIZE TEXTAREA + TYPING DETECTION
    // =============================================
    var typingTimeout = null;

    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';

            // Typing indicator: debounce 1s, send typing signal
            if (IS_ACTIVE) {
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(function() {
                    sendTypingSignal();
                }, 1000);
                // Send immediately on first keystroke
                if (!typingTimeout._sent) {
                    sendTypingSignal();
                }
            }
        });

        // Send on Enter (Shift+Enter for newline)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function sendTypingSignal() {
        fetch(TYPING_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json'
            }
        }).catch(function() {});
    }

    // =============================================
    // GUEST TYPING INDICATOR
    // =============================================
    function showGuestTyping(show) {
        if (!guestTypingEl) return;
        if (show) {
            guestTypingEl.style.display = 'flex';
            scrollToBottom(true);
        } else {
            guestTypingEl.style.display = 'none';
        }
    }

    // =============================================
    // INTERNAL NOTE TOGGLE
    // =============================================
    if (internalToggle) {
        internalToggle.addEventListener('change', function() {
            if (internalHint) {
                internalHint.classList.toggle('hidden', !this.checked);
            }
            if (chatInput) {
                chatInput.placeholder = this.checked ? 'Type an internal note...' : 'Type a message...';
            }
        });
    }

    // =============================================
    // FILE ATTACHMENT HANDLING
    // =============================================
    if (attachBtn) {
        attachBtn.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            var file = this.files[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
                showToast('File too large. Max 10MB.', 'error');
                this.value = '';
                return;
            }
            pendingFile = file;
            showFilePreview(file);
        });
    }

    if (filePreviewRemove) {
        filePreviewRemove.addEventListener('click', function() {
            clearFilePreview();
        });
    }

    function showFilePreview(file) {
        if (!filePreview) return;
        filePreview.classList.remove('hidden');
        filePreviewName.textContent = file.name;
        filePreviewSize.textContent = formatFileSize(file.size);

        var isImage = file.type.startsWith('image/');
        if (isImage) {
            var reader = new FileReader();
            reader.onload = function(e) {
                filePreviewThumb.innerHTML = '<img src="' + e.target.result + '" class="w-10 h-10 object-cover rounded-lg">';
            };
            reader.readAsDataURL(file);
        } else {
            var ext = file.name.split('.').pop().toLowerCase();
            var icons = { pdf: 'ti-file-type-pdf', doc: 'ti-file-type-doc', docx: 'ti-file-type-doc', xls: 'ti-file-type-xls', xlsx: 'ti-file-type-xls', zip: 'ti-file-type-zip', txt: 'ti-file-type-txt' };
            filePreviewThumb.innerHTML = '<i class="ti ' + (icons[ext] || 'ti-file') + ' text-gray-400 text-lg"></i>';
        }
    }

    function clearFilePreview() {
        pendingFile = null;
        if (fileInput) fileInput.value = '';
        if (filePreview) filePreview.classList.add('hidden');
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // =============================================
    // SEND MESSAGE (AJAX)
    // =============================================
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    var isSending = false;

    function sendMessage() {
        if (isSending) return;
        if (!chatInput) return;

        var message = chatInput.value.trim();
        var hasFile = pendingFile !== null;

        if (!message && !hasFile) return;

        var isInternal = internalToggle ? internalToggle.checked : false;

        isSending = true;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="ti ti-loader fa-spin text-sm"></i>';

        var tempId = 'temp-' + Date.now();

        if (hasFile) {
            // File upload via FormData
            var formData = new FormData();
            formData.append('file', pendingFile);
            if (message) formData.append('message', message);

            // Optimistic UI for file
            appendAdminBubble(message, false, ADMIN_NAME, new Date(), tempId, pendingFile.type.startsWith('image/') ? URL.createObjectURL(pendingFile) : null, pendingFile.name);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            clearFilePreview();
            scrollToBottom(true);

            fetch(UPLOAD_URL, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': CSRF_TOKEN,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(function(response) {
                if (!response.ok) throw new Error('Upload failed: ' + response.status);
                return response.json();
            })
            .then(function(data) {
                if (data && data.message_id) {
                    LAST_MESSAGE_ID = data.message_id;
                    var tempEl = document.querySelector('[data-message-id="' + tempId + '"]');
                    if (tempEl) tempEl.setAttribute('data-message-id', data.message_id);
                    // Update image src to server URL
                    if (data.attachment_url) {
                        var img = tempEl ? tempEl.querySelector('img[data-temp]') : null;
                        if (img) { img.src = data.attachment_url; img.removeAttribute('data-temp'); }
                        var link = tempEl ? tempEl.querySelector('a[data-temp]') : null;
                        if (link) { link.href = data.attachment_url; link.removeAttribute('data-temp'); }
                    }
                }
            })
            .catch(function(err) {
                var tempEl = document.querySelector('[data-message-id="' + tempId + '"]');
                if (tempEl) tempEl.remove();
                showToast('Failed to upload file. Please try again.', 'error');
            })
            .finally(function() {
                isSending = false;
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="ti ti-send text-sm"></i>';
            });
        } else {
            // Text-only message
            appendAdminBubble(message, isInternal, ADMIN_NAME, new Date(), tempId);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            scrollToBottom(true);

            fetch(REPLY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    message: message,
                    is_internal: isInternal ? 1 : 0
                })
            })
            .then(function(response) {
                if (!response.ok) throw new Error('Send failed: ' + response.status);
                return response.json().catch(function() { return {}; });
            })
            .then(function(data) {
                if (data && data.message_id) {
                    LAST_MESSAGE_ID = data.message_id;
                    var tempEl = document.querySelector('[data-message-id="' + tempId + '"]');
                    if (tempEl) tempEl.setAttribute('data-message-id', data.message_id);
                }
            })
            .catch(function(err) {
                var tempEl = document.querySelector('[data-message-id="' + tempId + '"]');
                if (tempEl) tempEl.remove();
                showToast('Failed to send message. Please try again.', 'error');
                if (chatInput) chatInput.value = message;
            })
            .finally(function() {
                isSending = false;
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="ti ti-send text-sm"></i>';
            });
        }
    }

    // =============================================
    // APPEND CHAT BUBBLES
    // =============================================
    function buildAttachmentHtml(attachUrl, attachName, isAdmin) {
        if (!attachUrl) return '';
        var ext = (attachName || '').split('.').pop().toLowerCase();
        var isImage = ['jpg','jpeg','png','gif','webp'].indexOf(ext) !== -1;
        var isTemp = attachUrl.startsWith('blob:');
        if (isImage) {
            return '<span class="block mb-1 cursor-pointer img-lightbox-trigger" data-lightbox-src="' + escapeAttr(attachUrl) + '"' + (isTemp ? ' data-temp="1"' : '') + '>' +
                '<img src="' + escapeAttr(attachUrl) + '" alt="Attachment" class="max-w-[220px] rounded-lg hover:opacity-90 transition-opacity"' + (isTemp ? ' data-temp="1"' : '') + '></span>';
        }
        var bgClass = isAdmin ? 'bg-black/10 hover:bg-black/20' : 'bg-gray-100 dark:bg-dark-100 hover:bg-gray-200 dark:hover:bg-dark-200';
        var textClass = isAdmin ? '' : 'text-gray-700 dark:text-gray-300';
        return '<a href="' + escapeAttr(attachUrl) + '" target="_blank" class="flex items-center gap-2 p-2 ' + bgClass + ' rounded-lg mb-1 transition-colors"' + (isTemp ? ' data-temp="1"' : '') + '>' +
            '<i class="ti ti-file text-lg"></i>' +
            '<span class="text-xs font-medium ' + textClass + ' truncate">' + escapeHtml(attachName || 'File') + '</span>' +
            '<i class="ti ti-download text-xs ml-auto"></i></a>';
    }

    function appendAdminBubble(message, isInternal, adminName, date, msgId, attachUrl, attachName) {
        var timeStr = typeof date === 'string' ? date : formatTime(date);
        var attachHtml = buildAttachmentHtml(attachUrl, attachName, true);
        var msgHtml = message ? '<p class="text-sm text-black whitespace-pre-line">' + escapeHtml(message) + '</p>' : '';
        var html = '';
        if (isInternal) {
            html = '<div class="flex justify-end items-end gap-2 chat-bubble-in" data-message-id="' + escapeAttr(msgId) + '">' +
                '<div class="max-w-[75%]">' +
                    '<div class="px-3 py-2 rounded-2xl rounded-br-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 shadow-sm">' +
                        '<div class="flex items-center gap-1.5 mb-1">' +
                            '<i class="ti ti-lock text-[9px] text-amber-500"></i>' +
                            '<p class="text-xs font-medium text-amber-600 dark:text-amber-400">Internal Note</p>' +
                        '</div>' +
                        '<p class="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line">' + escapeHtml(message) + '</p>' +
                    '</div>' +
                    '<p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mr-1 text-right">' + escapeHtml(adminName) + ' &middot; ' + timeStr + '</p>' +
                '</div>' +
                '<div class="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">' +
                    '<span class="text-white text-xs font-semibold">' + ADMIN_INITIAL + '</span>' +
                '</div>' +
            '</div>';
        } else {
            html = '<div class="flex justify-end items-end gap-2 chat-bubble-in" data-message-id="' + escapeAttr(msgId) + '">' +
                '<div class="max-w-[75%]">' +
                    '<div class="px-3 py-2 rounded-2xl rounded-br-sm bg-gradient-to-br from-yellow-400 to-orange-400 shadow-sm">' +
                        attachHtml + msgHtml +
                    '</div>' +
                    '<p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mr-1 text-right">' + escapeHtml(adminName) + ' &middot; ' + timeStr + '</p>' +
                '</div>' +
                '<div class="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">' +
                    '<span class="text-white text-xs font-semibold">' + ADMIN_INITIAL + '</span>' +
                '</div>' +
            '</div>';
        }
        if (guestTypingEl) {
            guestTypingEl.insertAdjacentHTML('beforebegin', html);
        } else {
            chatMessages.insertAdjacentHTML('beforeend', html);
        }
    }

    function appendGuestBubble(message, date, msgId, attachUrl, attachName) {
        var timeStr = typeof date === 'string' ? date : formatTime(date);
        var avatarGradient = IS_GUEST_USER ? 'from-purple-400 to-purple-600' : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700';
        var attachHtml = buildAttachmentHtml(attachUrl, attachName, false);
        var msgHtml = message ? '<p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">' + escapeHtml(message) + '</p>' : '';
        var html = '<div class="flex justify-start items-end gap-2 chat-bubble-in" data-message-id="' + escapeAttr(msgId) + '">' +
            '<div class="w-7 h-7 rounded-full bg-gradient-to-br ' + avatarGradient + ' flex items-center justify-center flex-shrink-0">' +
                '<span class="text-white text-xs font-semibold">' + GUEST_INITIAL + '</span>' +
            '</div>' +
            '<div class="max-w-[75%]">' +
                '<div class="px-3 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-100 shadow-sm">' +
                    attachHtml + msgHtml +
                '</div>' +
                '<p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">' + timeStr + '</p>' +
            '</div>' +
        '</div>';
        if (guestTypingEl) {
            guestTypingEl.insertAdjacentHTML('beforebegin', html);
        } else {
            chatMessages.insertAdjacentHTML('beforeend', html);
        }
    }

    // =============================================
    // INCREMENTAL POLLING FOR NEW MESSAGES (3s)
    // =============================================
    var pollTimer = null;

    function pollNewMessages() {
        if (!IS_ACTIVE) return;

        var url = MESSAGES_URL + '?after=' + LAST_MESSAGE_ID;
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': CSRF_TOKEN
            }
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) return;

            // Update online status
            updateOnlineStatus(data.guest_online);

            // Show/hide guest typing indicator
            showGuestTyping(data.guest_typing);

            // Update status if changed
            if (data.ticket_status && data.ticket_status !== TICKET_STATUS) {
                TICKET_STATUS = data.ticket_status;
                updateStatusUI(data.ticket_status);
                if (data.ticket_status === 'closed' || data.ticket_status === 'resolved') {
                    IS_ACTIVE = false;
                    stopPolling();
                }
            }

            // Append new messages
            var newCount = 0;
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(function(msg) {
                    // Skip if we already have this message rendered (optimistic or duplicate)
                    if (document.querySelector('[data-message-id="' + msg.id + '"]')) return;

                    if (msg.sender_type === 'admin') {
                        appendAdminBubble(msg.message, msg.is_internal, msg.sender_name || 'Admin', msg.created_at, msg.id, msg.attachment, msg.attachment_name);
                    } else {
                        appendGuestBubble(msg.message, msg.created_at, msg.id, msg.attachment, msg.attachment_name);
                        newCount++;
                    }

                    LAST_MESSAGE_ID = msg.id;
                });

                if (newCount > 0) {
                    scrollToBottom(true);
                    playNotificationSound();
                }
            }
        })
        .catch(function() {});
    }

    function startPolling() {
        if (pollTimer) return;
        pollTimer = setInterval(pollNewMessages, 3000);
    }

    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function playNotificationSound() {
        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 600;
            osc.type = 'sine';
            gain.gain.value = 0.15;
            osc.start();
            setTimeout(function() { osc.stop(); audioCtx.close(); }, 150);
        } catch(e) {}
    }

    // =============================================
    // ONLINE STATUS INDICATOR
    // =============================================
    function updateOnlineStatus(isOnline) {
        var indicator = document.getElementById('guestOnlineIndicator');
        if (indicator) {
            if (isOnline) {
                indicator.className = 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                indicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 online-pulse"></span> Online';
            } else {
                indicator.className = 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
                indicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-gray-400"></span> Offline';
            }
        }

        var chatDot = document.getElementById('chatOnlineDot');
        if (chatDot) {
            if (isOnline) {
                chatDot.className = 'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-200 bg-green-500 online-pulse';
                chatDot.title = 'Online';
            } else {
                chatDot.className = 'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-200 bg-gray-400';
                chatDot.title = 'Offline';
            }
        }

        var chatOnlineText = document.getElementById('chatOnlineText');
        if (chatOnlineText) {
            chatOnlineText.classList.remove('hidden');
            var dot = chatOnlineText.querySelector('i');
            var span = chatOnlineText.querySelector('span');
            if (isOnline) {
                if (dot) dot.className = 'ti ti-circle text-[6px] align-middle text-green-500';
                if (span) span.textContent = 'Online now';
            } else {
                if (dot) dot.className = 'ti ti-circle text-[6px] align-middle text-gray-400';
                if (span) span.textContent = 'Offline';
            }
        }
    }

    function updateStatusUI(status) {
        var statusBadge = document.getElementById('statusBadge');
        var colors = {
            'open': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'waiting_response': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'closed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        };
        if (statusBadge) {
            statusBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ' + (colors[status] || colors['open']);
            statusBadge.textContent = status.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
        }
        if (statusSelect) {
            statusSelect.value = status;
        }
    }

    // =============================================
    // QUICK ACTIONS (AJAX)
    // =============================================
    window.quickAction = function(type, value, btnEl) {
        var url, body;

        if (type === 'status') {
            url = STATUS_URL;
            body = { status: value };
        } else if (type === 'assign') {
            url = ASSIGN_URL;
            body = { assigned_to: value };
        } else {
            return;
        }

        var originalHTML = btnEl.innerHTML;
        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="ti ti-loader fa-spin"></i> Processing...';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(body)
        })
        .then(function(response) {
            if (!response.ok) throw new Error('Action failed');
            return response.json().catch(function() { return {}; });
        })
        .then(function() {
            if (type === 'status') {
                TICKET_STATUS = value;
                updateStatusUI(value);
                if (value === 'closed' || value === 'resolved') {
                    IS_ACTIVE = false;
                    stopPolling();
                }
            }
            showToast('Action completed successfully!', 'success');
            setTimeout(function() { window.location.reload(); }, 1200);
        })
        .catch(function() {
            showToast('Action failed. Please try again.', 'error');
            btnEl.disabled = false;
            btnEl.innerHTML = originalHTML;
        });
    };

    // =============================================
    // DELETE TICKET
    // =============================================
    window.deleteTicket = function() {
        if (confirm('Are you sure you want to permanently delete this chat/ticket? This action cannot be undone.')) {
            document.getElementById('deleteTicketForm').submit();
        }
    };

    // =============================================
    // STATUS & PRIORITY SELECT (AJAX)
    // =============================================
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            var newStatus = this.value;
            fetch(STATUS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ status: newStatus })
            })
            .then(function(r) {
                if (!r.ok) throw new Error('Failed');
                return r.json().catch(function() { return {}; });
            })
            .then(function() {
                TICKET_STATUS = newStatus;
                updateStatusUI(newStatus);
                showToast('Status updated to ' + newStatus.replace(/_/g, ' '), 'success');
                if (newStatus === 'closed' || newStatus === 'resolved') {
                    IS_ACTIVE = false;
                    stopPolling();
                }
            })
            .catch(function() {
                showToast('Failed to update status', 'error');
            });
        });
    }

    if (prioritySelect) {
        prioritySelect.addEventListener('change', function() {
            var newPriority = this.value;
            fetch(PRIORITY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ priority: newPriority })
            })
            .then(function(r) {
                if (!r.ok) throw new Error('Failed');
                return r.json().catch(function() { return {}; });
            })
            .then(function() {
                var priorityBadge = document.getElementById('priorityBadge');
                var pColors = {
                    'urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                    'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                    'low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                };
                if (priorityBadge) {
                    priorityBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ' + (pColors[newPriority] || pColors['medium']);
                    priorityBadge.textContent = newPriority.charAt(0).toUpperCase() + newPriority.slice(1);
                }
                showToast('Priority updated to ' + newPriority, 'success');
            })
            .catch(function() {
                showToast('Failed to update priority', 'error');
            });
        });
    }

    // =============================================
    // START POLLING (3s incremental)
    // =============================================
    if (IS_ACTIVE) {
        // Initial poll after 1 second, then every 3 seconds
        setTimeout(pollNewMessages, 1000);
        startPolling();
    }

    // =============================================
    // HELPERS
    // =============================================
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeAttr(text) {
        return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatTime(date) {
        if (typeof date === 'string') date = new Date(date);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var h = date.getHours();
        var m = date.getMinutes();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        m = m < 10 ? '0' + m : m;
        return months[date.getMonth()] + ' ' + date.getDate() + ' at ' + h + ':' + m + ' ' + ampm;
    }

    function showToast(message, type) {
        if (typeof ShareideRealtime !== 'undefined' && ShareideRealtime.showToast) {
            ShareideRealtime.showToast(message, type || 'info');
            return;
        }

        var toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 transform translate-y-2 opacity-0';
        toast.style.background = type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#FCC014';
        toast.style.color = type === 'error' ? '#fff' : type === 'success' ? '#fff' : '#000';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(function() {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
        setTimeout(function() {
            toast.style.transform = 'translateY(8px)';
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }
    // =============================================
    // IMAGE LIGHTBOX MODAL
    // =============================================
    var lightboxOverlay = document.createElement('div');
    lightboxOverlay.id = 'imgLightbox';
    lightboxOverlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 opacity-0 invisible transition-all duration-200 cursor-zoom-out';
    lightboxOverlay.innerHTML = '<button class="absolute top-4 right-5 w-10 h-10 flex items-center justify-center bg-white/15 hover:bg-white/30 text-white rounded-full text-lg transition-colors"><i class="ti ti-x"></i></button>' +
        '<img src="" alt="Image" class="max-w-[90%] max-h-[85vh] rounded-xl shadow-2xl transform scale-90 transition-transform duration-200 cursor-default">';

    document.body.appendChild(lightboxOverlay);

    var lbImg = lightboxOverlay.querySelector('img');
    var lbClose = lightboxOverlay.querySelector('button');

    function openImgLightbox(src) {
        lbImg.src = src;
        lightboxOverlay.classList.remove('opacity-0', 'invisible');
        lightboxOverlay.classList.add('opacity-100', 'visible');
        lbImg.classList.remove('scale-90');
        lbImg.classList.add('scale-100');
    }

    function closeImgLightbox() {
        lightboxOverlay.classList.add('opacity-0', 'invisible');
        lightboxOverlay.classList.remove('opacity-100', 'visible');
        lbImg.classList.add('scale-90');
        lbImg.classList.remove('scale-100');
        setTimeout(function() { lbImg.src = ''; }, 200);
    }

    lbClose.addEventListener('click', function(e) { e.stopPropagation(); closeImgLightbox(); });
    lightboxOverlay.addEventListener('click', function(e) { if (e.target === lightboxOverlay) closeImgLightbox(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeImgLightbox(); });

    // Delegate click on all image lightbox triggers
    document.addEventListener('click', function(e) {
        var trigger = e.target.closest('.img-lightbox-trigger');
        if (trigger) {
            e.preventDefault();
            var src = trigger.getAttribute('data-lightbox-src');
            if (src) openImgLightbox(src);
        }
    });

})();
</script>
@endpush
