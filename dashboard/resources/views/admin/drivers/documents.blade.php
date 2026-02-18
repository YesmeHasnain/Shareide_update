@extends('admin.layouts.app')

@section('title', 'Driver Documents')
@section('subtitle', $driver->user->name ?? 'Driver #' . $driver->id)

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.drivers.show', $driver->id) }}" class="text-blue-600 hover:underline">
        <i class="ti ti-arrow-left mr-2"></i>Back to Driver Profile
    </a>
</div>

@if($driver->documents)
<div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Submitted Documents</h3>
        <span class="px-3 py-1 text-sm rounded-full font-medium
            @if($driver->documents->verification_status == 'approved') bg-green-100 text-green-600
            @elseif($driver->documents->verification_status == 'rejected') bg-red-100 text-red-600
            @else bg-yellow-100 text-yellow-600 @endif">
            {{ ucfirst($driver->documents->verification_status ?? 'Pending') }}
        </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @php
            $docs = [
                ['field' => 'nic_front', 'label' => 'CNIC Front', 'category' => 'Identity'],
                ['field' => 'nic_back', 'label' => 'CNIC Back', 'category' => 'Identity'],
                ['field' => 'selfie_with_nic', 'label' => 'Selfie with CNIC', 'category' => 'Identity'],
                ['field' => 'license_front', 'label' => 'License Front', 'category' => 'License'],
                ['field' => 'license_back', 'label' => 'License Back', 'category' => 'License'],
                ['field' => 'vehicle_registration', 'label' => 'Vehicle Registration', 'category' => 'Vehicle'],
                ['field' => 'vehicle_front', 'label' => 'Vehicle Front', 'category' => 'Vehicle'],
                ['field' => 'vehicle_back', 'label' => 'Vehicle Back', 'category' => 'Vehicle'],
                ['field' => 'vehicle_interior', 'label' => 'Vehicle Interior', 'category' => 'Vehicle'],
                ['field' => 'vehicle_with_plate', 'label' => 'Vehicle with Plate', 'category' => 'Vehicle'],
                ['field' => 'live_selfie', 'label' => 'Live Selfie', 'category' => 'Verification'],
            ];
        @endphp

        @foreach($docs as $doc)
            <div class="border rounded-xl overflow-hidden">
                <div class="p-3 bg-gray-50 border-b">
                    <p class="font-medium text-gray-800">{{ $doc['label'] }}</p>
                </div>
                <div class="p-4">
                    @if($driver->documents->{$doc['field']})
                        <a href="{{ config('app.api_storage_url') }}/{{ $driver->documents->{$doc['field']} }}" target="_blank" class="block">
                            <img src="{{ config('app.api_storage_url') }}/{{ $driver->documents->{$doc['field']} }}" alt="{{ $doc['label'] }}"
                                class="w-full h-48 object-contain bg-gray-100 rounded-lg hover:opacity-80 transition">
                        </a>
                        <div class="mt-3 flex justify-between items-center">
                            <a href="{{ config('app.api_storage_url') }}/{{ $driver->documents->{$doc['field']} }}" target="_blank" class="text-blue-600 text-sm hover:underline">
                                <i class="ti ti-external-link mr-1"></i>Full Size
                            </a>
                            <a href="{{ config('app.api_storage_url') }}/{{ $driver->documents->{$doc['field']} }}" download class="text-gray-600 text-sm hover:underline">
                                <i class="ti ti-download mr-1"></i>Download
                            </a>
                        </div>
                    @else
                        <div class="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                            <i class="ti ti-photo text-gray-300 text-4xl mb-2"></i>
                            <span class="text-gray-400 text-sm">Not uploaded</span>
                        </div>
                    @endif
                </div>
            </div>
        @endforeach
    </div>

    @if($driver->documents->rejection_reason)
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 class="font-medium text-red-800 mb-2">Rejection Reason</h4>
            <p class="text-red-600">{{ $driver->documents->rejection_reason }}</p>
        </div>
    @endif

    @if($driver->documents->verified_at)
        <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p class="text-green-800">
                <i class="ti ti-circle-check mr-2"></i>
                Documents verified on {{ $driver->documents->verified_at->format('M d, Y H:i') }}
            </p>
        </div>
    @endif

    <!-- Actions -->
    @if($driver->status == 'pending')
    <div class="mt-6 pt-6 border-t flex flex-wrap gap-4">
        <form action="{{ route('admin.drivers.approve', $driver->id) }}" method="POST" onsubmit="return confirm('Approve this driver?')">
            @csrf
            <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg">
                <i class="ti ti-check mr-2"></i>Approve Driver
            </button>
        </form>
        <button onclick="document.getElementById('rejectModal').classList.remove('hidden')" class="px-6 py-2 bg-red-600 text-white rounded-lg">
            <i class="ti ti-x mr-2"></i>Reject Driver
        </button>
    </div>
    @endif
</div>
@else
<div class="bg-white rounded-xl shadow-sm p-8 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="ti ti-file-text text-gray-400 text-2xl"></i>
    </div>
    <h3 class="text-lg font-semibold text-gray-800">No Documents</h3>
    <p class="text-gray-500 mt-2">This driver hasn't uploaded any documents yet.</p>
</div>
@endif

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Reject Driver</h3>
        <form action="{{ route('admin.drivers.reject', $driver->id) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-2">Rejection Reason *</label>
                <textarea name="rejection_reason" rows="4" required class="w-full px-4 py-2 border rounded-lg" placeholder="Please specify which documents are invalid or missing..."></textarea>
            </div>
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="document.getElementById('rejectModal').classList.add('hidden')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg">Reject</button>
            </div>
        </form>
    </div>
</div>
@endsection
