@extends('admin.layouts.app')

@section('title', 'Shared Rides - Carpooling')

@section('content')
<div class="page-header">
    <h1>Shared Rides / Carpooling</h1>
    <div class="page-actions">
        <a href="{{ route('admin.shared-rides.active') }}" class="btn btn-primary">
            <i class="fas fa-car"></i> Active Rides
        </a>
        <a href="{{ route('admin.shared-rides.bookings') }}" class="btn btn-secondary">
            <i class="fas fa-ticket-alt"></i> View Bookings
        </a>
    </div>
</div>

<!-- Stats Cards -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #6366F1, #8B5CF6);">
            <i class="fas fa-car"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['total'] }}</div>
            <div class="stat-label">Total Rides</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
            <i class="fas fa-door-open"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['open'] }}</div>
            <div class="stat-label">Open Rides</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            <i class="fas fa-chair"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['full'] }}</div>
            <div class="stat-label">Full</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
            <i class="fas fa-road"></i>
        </div>
        <div class="stat-content">
            <div class="stat-value">{{ $stats['in_progress'] }}</div>
            <div class="stat-label">In Progress</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #6B7280, #4B5563);">
            <i class="fas fa-check-circle"></i>
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
        <a href="{{ route('admin.shared-rides.index') }}" class="chip {{ !$status ? 'active' : '' }}">All</a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'open']) }}" class="chip {{ $status == 'open' ? 'active' : '' }}">Open</a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'full']) }}" class="chip {{ $status == 'full' ? 'active' : '' }}">Full</a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'in_progress']) }}" class="chip {{ $status == 'in_progress' ? 'active' : '' }}">In Progress</a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'completed']) }}" class="chip {{ $status == 'completed' ? 'active' : '' }}">Completed</a>
        <a href="{{ route('admin.shared-rides.index', ['status' => 'cancelled']) }}" class="chip {{ $status == 'cancelled' ? 'active' : '' }}">Cancelled</a>
    </div>
</div>

<!-- Rides Table -->
<div class="card">
    <div class="card-body">
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Seats</th>
                    <th>Price/Seat</th>
                    <th>Bookings</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($rides as $ride)
                <tr>
                    <td>#{{ $ride->id }}</td>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">{{ substr($ride->driver->name ?? 'D', 0, 1) }}</div>
                            <div>
                                <div class="user-name">{{ $ride->driver->name ?? 'N/A' }}</div>
                                <div class="user-phone">{{ $ride->driver->phone ?? '' }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="route-info">
                            <div class="route-from"><i class="fas fa-circle text-primary" style="font-size: 8px;"></i> {{ Str::limit($ride->from_address, 30) }}</div>
                            <div class="route-to"><i class="fas fa-circle text-success" style="font-size: 8px;"></i> {{ Str::limit($ride->to_address, 30) }}</div>
                        </div>
                    </td>
                    <td>
                        <div>{{ $ride->departure_time->format('M d, Y') }}</div>
                        <div class="text-muted">{{ $ride->departure_time->format('h:i A') }}</div>
                    </td>
                    <td>
                        <span class="badge bg-info">{{ $ride->total_seats - $ride->available_seats }}/{{ $ride->total_seats }}</span>
                    </td>
                    <td>Rs. {{ number_format($ride->price_per_seat) }}</td>
                    <td>
                        <span class="badge bg-secondary">{{ $ride->total_bookings ?? 0 }}</span>
                    </td>
                    <td>
                        @php
                            $statusColors = [
                                'open' => 'success',
                                'full' => 'warning',
                                'in_progress' => 'primary',
                                'completed' => 'secondary',
                                'cancelled' => 'danger',
                            ];
                        @endphp
                        <span class="badge bg-{{ $statusColors[$ride->status] ?? 'secondary' }}">
                            {{ ucfirst(str_replace('_', ' ', $ride->status)) }}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <a href="{{ route('admin.shared-rides.show', $ride->id) }}" class="btn btn-sm btn-info" title="View">
                                <i class="fas fa-eye"></i>
                            </a>
                            @if(!in_array($ride->status, ['completed', 'cancelled']))
                            <form action="{{ route('admin.shared-rides.cancel', $ride->id) }}" method="POST" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn btn-sm btn-danger" title="Cancel" onclick="return confirm('Cancel this ride?')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="9" class="text-center py-4">No shared rides found</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        {{ $rides->links() }}
    </div>
</div>

<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
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
    font-size: 13px;
}

.route-from, .route-to {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
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
}

.user-phone {
    font-size: 12px;
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
