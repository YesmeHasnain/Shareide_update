@extends('admin.layouts.app')

@section('title', 'Promo Codes')
@section('subtitle', 'Manage discount and promotional codes')

@section('content')
<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ $stats['total'] }}</p>
        <p class="text-xs text-gray-500">Total Codes</p>
    </div>
    <div class="bg-green-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ $stats['active'] }}</p>
        <p class="text-xs text-green-600">Active</p>
    </div>
    <div class="bg-blue-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ $stats['total_usage'] }}</p>
        <p class="text-xs text-blue-600">Total Uses</p>
    </div>
    <div class="bg-purple-50 rounded-lg shadow-sm p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">PKR {{ number_format($stats['total_discount_given']) }}</p>
        <p class="text-xs text-purple-600">Discount Given</p>
    </div>
</div>

<!-- Actions -->
<div class="mb-6">
    <a href="{{ route('admin.promo-codes.create') }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
        <i class="fas fa-plus mr-2"></i>Create New Promo Code
    </a>
</div>

<!-- Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($promoCodes as $code)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-bold text-blue-600">{{ $code->code }}</p>
                            <p class="text-xs text-gray-500">{{ $code->description }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm font-medium text-gray-800">
                                {{ $code->discount_type == 'percentage' ? $code->discount_value . '%' : 'PKR ' . number_format($code->discount_value) }}
                            </p>
                            @if($code->max_discount)
                                <p class="text-xs text-gray-500">Max: PKR {{ number_format($code->max_discount) }}</p>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-sm">{{ $code->times_used }} / {{ $code->total_usage_limit ?? '&infin;' }}</p>
                            <p class="text-xs text-gray-500">{{ $code->per_user_limit }} per user</p>
                        </td>
                        <td class="px-4 py-3 text-xs text-gray-600">
                            {{ $code->valid_from ? \Carbon\Carbon::parse($code->valid_from)->format('M d, Y') : 'Anytime' }}
                            -
                            {{ $code->valid_until ? \Carbon\Carbon::parse($code->valid_until)->format('M d, Y') : 'Forever' }}
                        </td>
                        <td class="px-4 py-3">
                            @if($code->is_active)
                                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>
                            @else
                                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactive</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex space-x-2">
                                <a href="{{ route('admin.promo-codes.edit', $code->id) }}" class="p-2 text-blue-600 hover:bg-blue-50 rounded"><i class="fas fa-edit"></i></a>
                                <a href="{{ route('admin.promo-codes.usage', $code->id) }}" class="p-2 text-purple-600 hover:bg-purple-50 rounded"><i class="fas fa-chart-bar"></i></a>
                                <form action="{{ route('admin.promo-codes.toggle', $code->id) }}" method="POST" class="inline">
                                    @csrf
                                    <button class="p-2 {{ $code->is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50' }} rounded">
                                        <i class="fas {{ $code->is_active ? 'fa-pause' : 'fa-play' }}"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No promo codes found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-4 py-3 border-t">{{ $promoCodes->links() }}</div>
</div>
@endsection
