@extends('admin.layouts.app')

@section('title', 'System Alerts')
@section('subtitle', 'Monitor and respond to system notifications')

@section('content')
<div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100 {{ $stats['critical'] > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-pulse' : '' }}">
            <div class="flex items-center gap-3">
                <div class="p-2 {{ $stats['critical'] > 0 ? 'bg-red-200 dark:bg-red-900/50' : 'bg-red-100 dark:bg-red-900/30' }} rounded-lg">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold {{ $stats['critical'] > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white' }}">{{ $stats['critical'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Critical</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <i class="fas fa-exclamation-circle text-yellow-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['warning'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Warnings</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <i class="fas fa-info-circle text-blue-600"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['info'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Info</p>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <i class="fas fa-clipboard-list text-gray-600 dark:text-gray-400"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['total_unresolved'] }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total Unresolved</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 p-4">
        <form method="GET" class="flex flex-wrap items-center gap-4">
            <select name="severity" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                <option value="">All Severity</option>
                <option value="critical" {{ request('severity') === 'critical' ? 'selected' : '' }}>Critical</option>
                <option value="warning" {{ request('severity') === 'warning' ? 'selected' : '' }}>Warning</option>
                <option value="info" {{ request('severity') === 'info' ? 'selected' : '' }}>Info</option>
            </select>
            <select name="type" class="rounded-lg border-gray-300 dark:border-dark-100 dark:bg-dark-300 dark:text-white focus:border-yellow-500 focus:ring-yellow-500">
                <option value="">All Types</option>
                @foreach($alertTypes as $type)
                    <option value="{{ $type }}" {{ request('type') === $type ? 'selected' : '' }}>{{ ucfirst(str_replace('_', ' ', $type)) }}</option>
                @endforeach
            </select>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="unresolved_only" value="1" {{ request('unresolved_only') ? 'checked' : '' }} class="rounded border-gray-300 dark:border-dark-100 text-yellow-600 focus:ring-yellow-500">
                <span class="text-sm text-gray-700 dark:text-gray-300">Unresolved only</span>
            </label>
            <button type="submit" class="px-4 py-2 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors">
                <i class="fas fa-filter mr-1"></i>Filter
            </button>
            @if(request()->hasAny(['severity', 'type', 'unresolved_only']))
                <a href="{{ route('admin.alerts.index') }}" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <i class="fas fa-times mr-1"></i>Clear
                </a>
            @endif
        </form>
    </div>

    <!-- Alerts List -->
    <div class="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <form id="bulkForm" action="{{ route('admin.alerts.bulk-resolve') }}" method="POST">
            @csrf
            <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h3>
                <button type="submit" class="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium transition-colors" onclick="return confirm('Mark selected alerts as resolved?')">
                    <i class="fas fa-check-double mr-1"></i>Resolve Selected
                </button>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-dark-100">
                @forelse($alerts as $alert)
                    <div class="px-6 py-4 flex items-start gap-4 {{ !$alert->is_resolved ? 'bg-gray-50 dark:bg-dark-300' : '' }}">
                        <input type="checkbox" name="alert_ids[]" value="{{ $alert->id }}" class="mt-1 rounded border-gray-300 dark:border-dark-100 text-yellow-600 focus:ring-yellow-500" {{ $alert->is_resolved ? 'disabled' : '' }}>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                @php
                                    $severityColors = [
                                        'critical' => 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                                        'warning' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                                        'info' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                                    ];
                                @endphp
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $severityColors[$alert->severity] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }}">
                                    <i class="fas fa-{{ $alert->severity === 'critical' ? 'exclamation-triangle' : ($alert->severity === 'warning' ? 'exclamation-circle' : 'info-circle') }} mr-1"></i>
                                    {{ ucfirst($alert->severity) }}
                                </span>
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {{ ucfirst(str_replace('_', ' ', $alert->alert_type)) }}
                                </span>
                                @if($alert->is_resolved)
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        <i class="fas fa-check mr-1"></i>Resolved
                                    </span>
                                @endif
                            </div>
                            <h4 class="font-medium text-gray-900 dark:text-white">{{ $alert->title }}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $alert->message }}</p>
                            <div class="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span><i class="fas fa-clock mr-1"></i>{{ $alert->created_at->diffForHumans() }}</span>
                                @if($alert->is_resolved && $alert->resolved_at)
                                    <span><i class="fas fa-user-check mr-1"></i>Resolved by {{ $alert->resolvedByUser->name ?? 'Unknown' }} {{ $alert->resolved_at->diffForHumans() }}</span>
                                @endif
                            </div>
                        </div>
                        @if(!$alert->is_resolved)
                            <form action="{{ route('admin.alerts.resolve', $alert->id) }}" method="POST" class="inline">
                                @csrf
                                <button type="submit" class="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm transition-colors">
                                    <i class="fas fa-check mr-1"></i>Resolve
                                </button>
                            </form>
                        @endif
                    </div>
                @empty
                    <div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <i class="fas fa-bell-slash text-4xl mb-2 opacity-50"></i>
                        <p>No alerts found.</p>
                    </div>
                @endforelse
            </div>
        </form>
        @if($alerts->hasPages())
            <div class="px-6 py-4 border-t border-gray-100 dark:border-dark-100">
                {{ $alerts->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
