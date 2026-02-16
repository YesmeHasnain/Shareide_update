@extends('admin.layouts.app')

@section('title', 'Audit Log Details')
@section('subtitle', 'View detailed audit information')

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <!-- Back Button -->
    <a href="{{ route('admin.audit.index') }}" class="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <i class="fas fa-arrow-left mr-2"></i>Back to Audit Logs
    </a>

    <!-- Audit Log Details Card -->
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ ucfirst(str_replace('_', ' ', $log->action)) }}</h2>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    <i class="fas fa-clock mr-1"></i>{{ $log->created_at->format('M d, Y \a\t h:i A') }}
                </span>
            </div>
        </div>

        <div class="p-6 space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Action</label>
                    <p class="text-gray-900 dark:text-white font-medium">{{ ucfirst(str_replace('_', ' ', $log->action)) }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Performed By</label>
                    <p class="text-gray-900 dark:text-white">{{ $log->user->name ?? 'System' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">IP Address</label>
                    <p class="text-gray-900 dark:text-white font-mono text-sm">{{ $log->ip_address ?? 'N/A' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User Agent</label>
                    <p class="text-gray-600 dark:text-gray-400 text-sm truncate">{{ $log->user_agent ?? 'N/A' }}</p>
                </div>
            </div>

            <!-- Description -->
            <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <p class="text-gray-900 dark:text-white">{{ $log->description }}</p>
            </div>

            <!-- Related Model -->
            @if($log->auditable_type && $log->auditable_id)
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Related Record</label>
                    <p class="text-gray-900 dark:text-white">
                        {{ class_basename($log->auditable_type) }} #{{ $log->auditable_id }}
                    </p>
                </div>
            @endif

            <!-- Additional Data -->
            @if($log->old_values || $log->new_values)
                <div class="border-t border-gray-100 dark:border-dark-100 pt-6">
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Changes</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @if($log->old_values)
                            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                <h4 class="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                                    <i class="fas fa-minus-circle mr-1"></i>Old Values
                                </h4>
                                <pre class="text-sm text-red-700 dark:text-red-300 overflow-x-auto">{{ json_encode($log->old_values, JSON_PRETTY_PRINT) }}</pre>
                            </div>
                        @endif
                        @if($log->new_values)
                            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <h4 class="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                                    <i class="fas fa-plus-circle mr-1"></i>New Values
                                </h4>
                                <pre class="text-sm text-green-700 dark:text-green-300 overflow-x-auto">{{ json_encode($log->new_values, JSON_PRETTY_PRINT) }}</pre>
                            </div>
                        @endif
                    </div>
                </div>
            @endif

            <!-- Metadata -->
            @if($log->metadata)
                <div class="bg-gray-50 dark:bg-dark-300 rounded-lg p-4">
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Metadata</h3>
                    <pre class="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">{{ json_encode($log->metadata, JSON_PRETTY_PRINT) }}</pre>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
