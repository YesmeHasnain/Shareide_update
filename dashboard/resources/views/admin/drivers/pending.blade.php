@extends('admin.layouts.app')

@section('title', 'Pending Driver Approvals')
@section('subtitle', 'Review and approve new driver registrations')

@section('content')
<div class="mb-6">
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div class="flex items-center">
            <i class="fas fa-info-circle text-yellow-600 mr-3 text-xl"></i>
            <div>
                <p class="font-medium text-yellow-800">{{ $drivers->total() }} driver(s) waiting for approval</p>
                <p class="text-sm text-yellow-600">Please review their documents carefully before approving.</p>
            </div>
        </div>
    </div>
</div>

@if($drivers->count() > 0)
    <div class="space-y-4">
        @foreach($drivers as $driver)
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="p-6">
                    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <!-- Driver Info -->
                        <div class="flex items-start space-x-4">
                            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-gray-500 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">{{ $driver->user->name ?? 'N/A' }}</h3>
                                <p class="text-gray-500">{{ $driver->user->phone ?? 'N/A' }}</p>
                                <p class="text-sm text-gray-400">Registered {{ $driver->created_at->diffForHumans() }}</p>
                            </div>
                        </div>

                        <!-- Vehicle Info -->
                        <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Vehicle Type</p>
                                <p class="font-medium text-gray-800">
                                    <i class="fas {{ $driver->vehicle_type == 'car' ? 'fa-car' : 'fa-motorcycle' }} mr-1"></i>
                                    {{ ucfirst($driver->vehicle_type) }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Plate Number</p>
                                <p class="font-medium text-gray-800">{{ $driver->plate_number }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Vehicle Model</p>
                                <p class="font-medium text-gray-800">{{ $driver->vehicle_model ?? 'N/A' }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 uppercase">City</p>
                                <p class="font-medium text-gray-800">{{ $driver->city }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Documents Status -->
                    @if($driver->documents)
                        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 class="text-sm font-semibold text-gray-700 mb-3">Submitted Documents</h4>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->nic_front ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>NIC Front</span>
                                </div>
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->nic_back ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>NIC Back</span>
                                </div>
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->license_front ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>License Front</span>
                                </div>
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->license_back ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>License Back</span>
                                </div>
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->vehicle_registration ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>Vehicle Registration</span>
                                </div>
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->selfie_with_nic ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>Selfie with NIC</span>
                                </div>
                                <div class="flex items-center text-sm">
                                    <i class="fas {{ $driver->documents->live_selfie ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500' }} mr-2"></i>
                                    <span>Live Selfie</span>
                                </div>
                            </div>
                        </div>
                    @endif

                    <!-- Actions -->
                    <div class="mt-6 flex flex-wrap gap-3">
                        <a href="{{ route('admin.drivers.show', $driver->id) }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-eye mr-2"></i>View Details & Documents
                        </a>
                        <form action="{{ route('admin.drivers.approve', $driver->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to approve this driver?')">
                            @csrf
                            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <i class="fas fa-check mr-2"></i>Approve
                            </button>
                        </form>
                        <button onclick="openRejectModal({{ $driver->id }})" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            <i class="fas fa-times mr-2"></i>Reject
                        </button>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $drivers->links() }}
    </div>
@else
    <div class="bg-white rounded-xl shadow-sm p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check-circle text-green-500 text-3xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-800">All Caught Up!</h3>
        <p class="text-gray-500 mt-2">No pending driver approvals at the moment.</p>
        <a href="{{ route('admin.drivers.index') }}" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View All Drivers
        </a>
    </div>
@endif

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Reject Driver Application</h3>
            <form id="rejectForm" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm text-gray-600 mb-2">Rejection Reason *</label>
                    <textarea name="rejection_reason" rows="4" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="Please provide a reason for rejection..."></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="closeRejectModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Reject Driver
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function openRejectModal(driverId) {
        document.getElementById('rejectForm').action = '/admin/drivers/' + driverId + '/reject';
        document.getElementById('rejectModal').classList.remove('hidden');
    }

    function closeRejectModal() {
        document.getElementById('rejectModal').classList.add('hidden');
    }
</script>
@endpush
@endsection
