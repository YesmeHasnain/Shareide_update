@extends('admin.layouts.app')

@section('title', 'Active Shared Rides')

@section('content')
<div class="page-header">
    <h1>Active Shared Rides</h1>
    <div class="page-actions">
        <a href="{{ route('admin.shared-rides.index') }}" class="btn btn-secondary">
            <i class="ti ti-arrow-left"></i> All Rides
        </a>
    </div>
</div>

<!-- Active Rides Grid -->
<div class="active-rides-grid">
    @forelse($rides as $ride)
    <div class="active-ride-card">
        <div class="ride-header">
            <div class="ride-id">#{{ $ride->id }}</div>
            @php
                $statusColors = [
                    'open' => 'success',
                    'full' => 'warning',
                    'in_progress' => 'primary',
                ];
            @endphp
            <span class="badge bg-{{ $statusColors[$ride->status] ?? 'secondary' }}">
                {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
            </span>
        </div>

        <div class="driver-section">
            <div class="driver-avatar">{{ substr($ride->driver->name ?? 'D', 0, 1) }}</div>
            <div class="driver-details">
                <div class="driver-name">{{ $ride->driver->name ?? 'N/A' }}</div>
                <div class="driver-phone">{{ $ride->driver->phone ?? '' }}</div>
            </div>
        </div>

        <div class="route-section">
            <div class="route-item">
                <i class="ti ti-circle text-primary" style="font-size: 8px;"></i>
                <span>{{ Str::limit($ride->from_address, 35) }}</span>
            </div>
            <div class="route-item">
                <i class="ti ti-circle text-success" style="font-size: 8px;"></i>
                <span>{{ Str::limit($ride->to_address, 35) }}</span>
            </div>
        </div>

        <div class="ride-info-row">
            <div class="info-box">
                <i class="ti ti-clock"></i>
                <span>{{ $ride->departure_time->format('h:i A') }}</span>
            </div>
            <div class="info-box">
                <i class="ti ti-armchair"></i>
                <span>{{ $ride->total_seats - $ride->available_seats }}/{{ $ride->total_seats }}</span>
            </div>
            <div class="info-box">
                <i class="ti ti-cash"></i>
                <span>Rs. {{ number_format($ride->price_per_seat) }}</span>
            </div>
        </div>

        @if($ride->bookings->count() > 0)
        <div class="passengers-section">
            <div class="passengers-label">Passengers ({{ $ride->bookings->count() }})</div>
            <div class="passengers-avatars">
                @foreach($ride->bookings->take(4) as $booking)
                <div class="passenger-avatar" title="{{ $booking->passenger->name ?? 'Passenger' }}">
                    {{ substr($booking->passenger->name ?? 'P', 0, 1) }}
                </div>
                @endforeach
                @if($ride->bookings->count() > 4)
                <div class="passenger-avatar more">+{{ $ride->bookings->count() - 4 }}</div>
                @endif
            </div>
        </div>
        @endif

        <div class="ride-actions">
            <a href="{{ route('admin.shared-rides.show', $ride->id) }}" class="btn btn-sm btn-info">
                <i class="ti ti-eye"></i> View Details
            </a>
            @if($ride->status !== 'in_progress')
            <form action="{{ route('admin.shared-rides.cancel', $ride->id) }}" method="POST" style="display: inline;">
                @csrf
                <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Cancel this ride?')">
                    <i class="ti ti-x"></i> Cancel
                </button>
            </form>
            @endif
        </div>
    </div>
    @empty
    <div class="empty-state-full">
        <i class="ti ti-car"></i>
        <h3>No Active Rides</h3>
        <p>There are no active shared rides at the moment</p>
    </div>
    @endforelse
</div>

{{ $rides->links() }}

<style>
.active-rides-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 25px;
}

.active-ride-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.active-ride-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.ride-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.ride-id {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
}

.driver-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border);
}

.driver-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 700;
    font-size: 18px;
}

.driver-name {
    font-weight: 600;
    color: var(--text);
    font-size: 15px;
}

.driver-phone {
    font-size: 12px;
    color: var(--text-muted);
}

.route-section {
    margin-bottom: 15px;
}

.route-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text);
}

.ride-info-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.info-box {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    background: var(--background);
    border-radius: 8px;
    font-size: 12px;
    color: var(--text);
}

.info-box i {
    color: var(--primary);
    font-size: 11px;
}

.passengers-section {
    margin-bottom: 15px;
    padding: 12px;
    background: var(--background);
    border-radius: 10px;
}

.passengers-label {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 8px;
}

.passengers-avatars {
    display: flex;
    gap: -5px;
}

.passenger-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border: 2px solid var(--surface);
    margin-left: -8px;
}

.passenger-avatar:first-child {
    margin-left: 0;
}

.passenger-avatar.more {
    background: var(--text-muted);
    font-size: 10px;
}

.ride-actions {
    display: flex;
    gap: 10px;
}

.ride-actions .btn {
    flex: 1;
}

.empty-state-full {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    background: var(--surface);
    border-radius: 16px;
}

.empty-state-full i {
    font-size: 64px;
    color: var(--text-muted);
    opacity: 0.3;
    margin-bottom: 20px;
}

.empty-state-full h3 {
    color: var(--text);
    margin-bottom: 10px;
}

.empty-state-full p {
    color: var(--text-muted);
}

@media (max-width: 1200px) {
    .active-rides-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .active-rides-grid {
        grid-template-columns: 1fr;
    }
}
</style>
@endsection
