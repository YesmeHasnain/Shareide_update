@extends('admin.layouts.app')

@section('title', 'Alert Details')
@section('subtitle', $alert->title)

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <!-- Back Button -->
    <a href="{{ route('admin.alerts.index') }}" class="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <i class="fas fa-arrow-left mr-2"></i>Back to Alerts
    </a>

    <!-- Alert Details Card -->
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    @php
                        $severityColors = [
                            'critical' => 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                            'warning' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                            'info' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                        ];
                        $severityIcons = [
                            'critical' => 'exclamation-triangle',
                            'warning' => 'exclamation-circle',
                            'info' => 'info-circle',
                        ];
                    @endphp
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium {{ $severityColors[$alert->severity] ?? 'bg-gray-100 text-gray-800' }}">
                        <i class="fas fa-{{ $severityIcons[$alert->severity] ?? 'bell' }} mr-2"></i>
                        {{ ucfirst($alert->severity) }}
                    </span>
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {{ ucfirst(str_replace('_', ' ', $alert->alert_type)) }}
                    </span>
                    @if($alert->is_resolved)
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <i class="fas fa-check mr-2"></i>Resolved
                        </span>
                    @endif
                </div>
            </div>
        </div>

        <div class="p-6 space-y-6">
            <!-- Title & Message -->
            <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ $alert->title }}</h2>
                <p class="text-gray-600 dark:text-gray-400">{{ $alert->message }}</p>
            </div>

            <!-- Metadata -->
            @if($alert->metadata)
                <div class="bg-gray-50 dark:bg-dark-300 rounded-lg p-4">
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details</h3>
                    <pre class="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">{{ json_encode($alert->metadata, JSON_PRETTY_PRINT) }}</pre>
                </div>
            @endif

            <!-- Timeline -->
            <div class="border-t border-gray-100 dark:border-dark-100 pt-6">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Timeline</h3>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <i class="fas fa-bell text-blue-600 text-sm"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Alert Created</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ $alert->created_at->format('M d, Y \a\t h:i A') }}</p>
                        </div>
                    </div>

                    @if($alert->is_read)
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <i class="fas fa-eye text-gray-600 text-sm"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Read by {{ $alert->readByUser->name ?? 'Admin' }}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $alert->read_at ? $alert->read_at->format('M d, Y \a\t h:i A') : 'N/A' }}</p>
                            </div>
                        </div>
                    @endif

                    @if($alert->is_resolved)
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <i class="fas fa-check text-green-600 text-sm"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Resolved by {{ $alert->resolvedByUser->name ?? 'Admin' }}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $alert->resolved_at ? $alert->resolved_at->format('M d, Y \a\t h:i A') : 'N/A' }}</p>
                                @if($alert->resolution_note)
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Note: {{ $alert->resolution_note }}</p>
                                @endif
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Resolve Form -->
            @if(!$alert->is_resolved)
                <div class="border-t border-gray-100 dark:border-dark-100 pt-6">
                    <form action="{{ route('admin.alerts.resolve', $alert->id) }}" method="POST">
                        @csrf
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resolution Note (Optional)</label>
                            <textarea name="resolution_note" rows="3" class="w-full rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500" placeholder="Add a note about how this was resolved..."></textarea>
                        </div>
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-check mr-2"></i>Mark as Resolved
                        </button>
                    </form>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
