@extends('admin.layouts.app')

@section('title', 'Shared Ride Bookings')

@section('content')
<div class="page-header">
    <h1>Shared Ride Bookings</h1>
    <div class="page-actions">
        <a href="{{ route('admin.shared-rides.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Back to Rides
        </a>
    </div>
</div>

<!-- Stats Cards -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #6366F1, #8B5CF6);">
            <i class="fas fa-ticket-alt"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['total'] }}</div>
            <div class="stat-label">Total Bookings</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['pending'] }}</div>
            <div class="stat-label">Pending</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
            <i class="fas fa-check"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['confirmed'] }}</div>
            <div class="stat-label">Confirmed</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
            <i class="fas fa-flag-checkered"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['completed'] }}</div>
            <div class="stat-label">Completed</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
            <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['cancelled'] }}</div>
            <div class="stat-label">Cancelled</div>
        </div>
    </div>
</div>

<!-- Filters -->
<div class="filters-row">
    <div class="filter-chips">
        <a href="{{ route('admin.shared-rides.bookings') }}" class="chip {{ !$status ? 'active' : '' }}">All</a>
        <a href="{{ route('admin.shared-rides.bookings', ['status' => 'pending']) }}" class="chip {{ $status == 'pending' ? 'active' : '' }}">Pending</a>
        <a href="{{ route('admin.shared-rides.bookings', ['status' => 'accepted']) }}" class="chip {{ $status == 'accepted' ? 'active' : '' }}">Accepted</a>
        <a href="{{ route('admin.shared-rides.bookings', ['status' => 'confirmed']) }}" class="chip {{ $status == 'confirmed' ? 'active' : '' }}">Confirmed</a>
        <a href="{{ route('admin.shared-rides.bookings', ['status' => 'picked_up']) }}" class="chip {{ $status == 'picked_up' ? 'active' : '' }}">Picked Up</a>
        <a href="{{ route('admin.shared-rides.bookings', ['status' => 'dropped_off']) }}" class="chip {{ $status == 'dropped_off' ? 'active' : '' }}">Completed</a>
        <a href="{{ route('admin.shared-rides.bookings', ['status' => 'cancelled']) }}" class="chip {{ $status == 'cancelled' ? 'active' : '' }}">Cancelled</a>
    </div>
</div>

<!-- Bookings Table -->
<div class="card">
    <div class="card-body">
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Driver</th>
                    <th>Ride Route</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Booked At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($bookings as $booking)
                <tr>
                    <td>#{{ $booking->id }}</td>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">{{ substr($booking->passenger->name ?? 'P', 0, 1) }}</div>
                            <div>
                                <div class="user-name">{{ $booking->passenger->name ?? 'N/A' }}</div>
                                <div class="user-phone">{{ $booking->passenger->phone ?? '' }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="user-name">{{ $booking->sharedRide->driver->name ?? 'N/A' }}</div>
                    </td>
                    <td>
                        <div class="route-info">
                            <div class="route-from"><i class="fas fa-circle text-primary" style="font-size: 8px;"></i> {{ Str::limit($booking->sharedRide->from_address ?? '', 25) }}</div>
                            <div class="route-to"><i class="fas fa-circle text-success" style="font-size: 8px;"></i> {{ Str::limit($booking->sharedRide->to_address ?? '', 25) }}</div>
                        </div>
                    </td>
                    <td>{{ $booking->seats_booked }}</td>
                    <td><strong>Rs. {{ number_format($booking->amount) }}</strong></td>
                    <td>
                        <span class="badge bg-{{ $booking->payment_status == 'paid' ? 'success' : 'warning' }}">
                            {{ ucfirst($booking->payment_status) }}
                        </span>
                    </td>
                    <td>
                        @php
                            $statusColors = [
                                'pending' => 'warning',
                                'accepted' => 'info',
                                'rejected' => 'danger',
                                'confirmed' => 'success',
                                'picked_up' => 'primary',
                                'dropped_off' => 'secondary',
                                'cancelled' => 'danger',
                                'no_show' => 'dark',
                            ];
                        @endphp
                        <span class="badge bg-{{ $statusColors[$booking->status] ?? 'secondary' }}">
                            {{ ucfirst(str_replace('_', ' ', $booking->status)) }}
                        </span>
                    </td>
                    <td>{{ $booking->created_at->format('M d, h:i A') }}</td>
                    <td>
                        <div class="action-buttons">
                            <a href="{{ route('admin.shared-rides.show', $booking->shared_ride_id) }}" class="btn btn-sm btn-info" title="View Ride">
                                <i class="fas fa-eye"></i>
                            </a>
                            @if(!in_array($booking->status, ['dropped_off', 'cancelled', 'rejected']))
                            <form action="{{ route('admin.shared-rides.cancel-booking', $booking->id) }}" method="POST" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn btn-sm btn-danger" title="Cancel" onclick="return confirm('Cancel this booking?')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="10" class="text-center py-4">No bookings found</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        {{ $bookings->links() }}
    </div>
</div>

<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
    margin-bottom: 25px;
}

.stat-card {
    background: var(--surface);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
}

.stat-label {
    font-size: 12px;
    color: var(--text-muted);
}

.filters-row {
    margin-bottom: 20px;
}

.filter-chips {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.chip {
    padding: 8px 16px;
    border-radius: 20px;
    background: var(--surface);
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 13px;
    transition: all 0.2s;
}

.chip:hover, .chip.active {
    background: var(--primary);
    color: #000;
}

.route-info {
    font-size: 12px;
}

.route-from, .route-to {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 600;
}

.user-name {
    font-weight: 600;
    color: var(--text);
    font-size: 13px;
}

.user-phone {
    font-size: 11px;
    color: var(--text-muted);
}

.action-buttons {
    display: flex;
    gap: 5px;
}

@media (max-width: 1200px) {
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
@endsection
