@extends('admin.layouts.app')

@section('title', 'Shared Ride Details')

@section('content')
<div class="page-header">
    <h1>Shared Ride #{{ $ride->id }}</h1>
    <div class="page-actions">
        <a href="{{ route('admin.shared-rides.index') }}" class="btn btn-secondary">
            <i class="ti ti-arrow-left"></i> Back to Rides
        </a>
        @if(!in_array($ride->status, ['completed', 'cancelled']))
        <form action="{{ route('admin.shared-rides.cancel', $ride->id) }}" method="POST" style="display: inline;">
            @csrf
            <button type="submit" class="btn btn-danger" onclick="return confirm('Cancel this ride and all bookings?')">
                <i class="ti ti-x"></i> Cancel Ride
            </button>
        </form>
        @endif
    </div>
</div>

<div class="ride-details-grid">
    <!-- Ride Info Card -->
    <div class="card">
        <div class="card-header">
            <h3><i class="ti ti-car"></i> Ride Information</h3>
            @php
                $statusColors = [
                    'open' => 'success',
                    'full' => 'warning',
                    'in_progress' => 'primary',
                    'completed' => 'secondary',
                    'cancelled' => 'danger',
                ];
            @endphp
            <span class="badge bg-{{ $statusColors[$ride->status] ?? 'secondary' }} badge-lg">
                {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
            </span>
        </div>
        <div class="card-body">
            <div class="info-grid">
                <div class="info-item">
                    <label>Departure Time</label>
                    <span>{{ $ride->departure_time->format('M d, Y - h:i A') }}</span>
                </div>
                <div class="info-item">
                    <label>Created At</label>
                    <span>{{ $ride->created_at->format('M d, Y - h:i A') }}</span>
                </div>
                <div class="info-item">
                    <label>Total Seats</label>
                    <span>{{ $ride->total_seats }}</span>
                </div>
                <div class="info-item">
                    <label>Available Seats</label>
                    <span>{{ $ride->available_seats }}</span>
                </div>
                <div class="info-item">
                    <label>Price per Seat</label>
                    <span class="text-primary fw-bold">Rs. {{ number_format($ride->price_per_seat) }}</span>
                </div>
                <div class="info-item">
                    <label>Distance</label>
                    <span>{{ $ride->distance_km ?? 'N/A' }} km</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Driver Info Card -->
    <div class="card">
        <div class="card-header">
            <h3><i class="ti ti-user"></i> Driver Information</h3>
        </div>
        <div class="card-body">
            <div class="driver-profile">
                <div class="driver-avatar">
                    {{ substr($ride->driver->name ?? 'D', 0, 1) }}
                </div>
                <div class="driver-info">
                    <h4>{{ $ride->driver->name ?? 'N/A' }}</h4>
                    <p><i class="ti ti-phone"></i> {{ $ride->driver->phone ?? 'N/A' }}</p>
                    <p><i class="ti ti-mail"></i> {{ $ride->driver->email ?? 'N/A' }}</p>
                    @if($ride->driver->driver)
                    <p><i class="ti ti-car"></i> {{ $ride->driver->driver->vehicle_model ?? '' }} - {{ $ride->driver->driver->vehicle_color ?? '' }}</p>
                    <p><i class="ti ti-id-badge"></i> {{ $ride->driver->driver->vehicle_number ?? '' }}</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Route Card -->
<div class="card">
    <div class="card-header">
        <h3><i class="ti ti-route"></i> Route Details</h3>
    </div>
    <div class="card-body">
        <div class="route-display">
            <div class="route-point">
                <div class="route-marker pickup">
                    <i class="ti ti-circle"></i>
                </div>
                <div class="route-content">
                    <label>Pickup Location</label>
                    <p>{{ $ride->from_address }}</p>
                    <small class="text-muted">{{ $ride->from_lat }}, {{ $ride->from_lng }}</small>
                </div>
            </div>
            <div class="route-line"></div>
            <div class="route-point">
                <div class="route-marker dropoff">
                    <i class="ti ti-circle"></i>
                </div>
                <div class="route-content">
                    <label>Dropoff Location</label>
                    <p>{{ $ride->to_address }}</p>
                    <small class="text-muted">{{ $ride->to_lat }}, {{ $ride->to_lng }}</small>
                </div>
            </div>
        </div>
        @if($ride->notes)
        <div class="notes-section">
            <label>Driver Notes</label>
            <p>{{ $ride->notes }}</p>
        </div>
        @endif
    </div>
</div>

<!-- Bookings Card -->
<div class="card">
    <div class="card-header">
        <h3><i class="ti ti-ticket"></i> Bookings ({{ $ride->bookings->count() }})</h3>
    </div>
    <div class="card-body">
        @if($ride->bookings->count() > 0)
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Booked At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($ride->bookings as $booking)
                <tr>
                    <td>#{{ $booking->id }}</td>
                    <td>
                        <div class="user-info-mini">
                            <div class="user-avatar-sm">{{ substr($booking->passenger->name ?? 'P', 0, 1) }}</div>
                            <div>
                                <div class="fw-bold">{{ $booking->passenger->name ?? 'N/A' }}</div>
                                <small class="text-muted">{{ $booking->passenger->phone ?? '' }}</small>
                            </div>
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
                            $bookingStatusColors = [
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
                        <span class="badge bg-{{ $bookingStatusColors[$booking->status] ?? 'secondary' }}">
                            {{ ucfirst(str_replace('_', ' ', $booking->status)) }}
                        </span>
                    </td>
                    <td>{{ $booking->created_at->format('M d, h:i A') }}</td>
                    <td>
                        @if(!in_array($booking->status, ['dropped_off', 'cancelled', 'rejected']))
                        <form action="{{ route('admin.shared-rides.cancel-booking', $booking->id) }}" method="POST" style="display: inline;">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-danger" title="Cancel" onclick="return confirm('Cancel this booking?')">
                                <i class="ti ti-x"></i>
                            </button>
                        </form>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <div class="empty-state">
            <i class="ti ti-ticket"></i>
            <p>No bookings yet</p>
        </div>
        @endif
    </div>
</div>

<!-- Earnings Summary -->
<div class="card">
    <div class="card-header">
        <h3><i class="ti ti-coins"></i> Earnings Summary</h3>
    </div>
    <div class="card-body">
        @php
            $totalEarnings = $ride->bookings->where('status', 'dropped_off')->where('payment_status', 'paid')->sum('amount');
            $pendingEarnings = $ride->bookings->whereIn('status', ['pending', 'accepted', 'confirmed', 'picked_up'])->sum('amount');
            $confirmedBookings = $ride->bookings->whereIn('status', ['confirmed', 'picked_up', 'dropped_off'])->count();
        @endphp
        <div class="earnings-grid">
            <div class="earning-item">
                <div class="earning-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
                    <i class="ti ti-circle-check"></i>
                </div>
                <div>
                    <div class="earning-value">Rs. {{ number_format($totalEarnings) }}</div>
                    <div class="earning-label">Completed Earnings</div>
                </div>
            </div>
            <div class="earning-item">
                <div class="earning-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
                    <i class="ti ti-clock"></i>
                </div>
                <div>
                    <div class="earning-value">Rs. {{ number_format($pendingEarnings) }}</div>
                    <div class="earning-label">Pending Earnings</div>
                </div>
            </div>
            <div class="earning-item">
                <div class="earning-icon" style="background: linear-gradient(135deg, #6366F1, #8B5CF6);">
                    <i class="ti ti-users"></i>
                </div>
                <div>
                    <div class="earning-value">{{ $confirmedBookings }}</div>
                    <div class="earning-label">Confirmed Passengers</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.ride-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.info-item label {
    display: block;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 5px;
}

.info-item span {
    font-size: 16px;
    color: var(--text);
    font-weight: 500;
}

.driver-profile {
    display: flex;
    align-items: center;
    gap: 20px;
}

.driver-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
    color: #000;
}

.driver-info h4 {
    margin: 0 0 10px 0;
    font-size: 20px;
    color: var(--text);
}

.driver-info p {
    margin: 5px 0;
    color: var(--text-secondary);
    font-size: 14px;
}

.driver-info i {
    width: 20px;
    color: var(--primary);
}

.route-display {
    position: relative;
    padding: 20px 0;
}

.route-point {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 20px;
}

.route-point:last-child {
    margin-bottom: 0;
}

.route-marker {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
}

.route-marker.pickup {
    background: rgba(99, 102, 241, 0.2);
    color: #6366F1;
}

.route-marker.dropoff {
    background: rgba(16, 185, 129, 0.2);
    color: #10B981;
}

.route-content label {
    display: block;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 5px;
}

.route-content p {
    margin: 0;
    font-size: 16px;
    color: var(--text);
    font-weight: 500;
}

.route-line {
    position: absolute;
    left: 14px;
    top: 50px;
    bottom: 50px;
    width: 2px;
    background: linear-gradient(to bottom, #6366F1, #10B981);
}

.notes-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

.notes-section label {
    display: block;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 5px;
}

.notes-section p {
    margin: 0;
    color: var(--text);
}

.user-info-mini {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar-sm {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 600;
    font-size: 14px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--text-muted);
}

.empty-state i {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
}

.earnings-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.earning-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: var(--background);
    border-radius: 12px;
}

.earning-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
}

.earning-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
}

.earning-label {
    font-size: 12px;
    color: var(--text-muted);
}

.badge-lg {
    font-size: 14px;
    padding: 8px 16px;
}

@media (max-width: 992px) {
    .ride-details-grid {
        grid-template-columns: 1fr;
    }

    .info-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .earnings-grid {
        grid-template-columns: 1fr;
    }
}
</style>
@endsection
