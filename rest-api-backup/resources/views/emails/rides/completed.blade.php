<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ride Receipt</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .header { background: #1A1A2E; padding: 30px; text-align: center; }
        .header h1 { color: #FCC014; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; color: #1A1A2E; margin-bottom: 20px; }
        .fare-box { background: #FCC014; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .fare-label { font-size: 12px; color: rgba(0,0,0,0.6); text-transform: uppercase; letter-spacing: 1px; }
        .fare-amount { font-size: 36px; font-weight: 800; color: #000; margin: 4px 0; }
        .route { margin-bottom: 24px; }
        .route-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
        .route-dot { width: 12px; height: 12px; border-radius: 6px; margin-right: 12px; margin-top: 4px; flex-shrink: 0; }
        .route-dot.pickup { background: #10B981; }
        .route-dot.dropoff { background: #EF4444; }
        .route-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; }
        .route-address { font-size: 14px; color: #1A1A2E; font-weight: 500; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .detail-item { background: #F8F9FA; border-radius: 8px; padding: 12px; }
        .detail-label { font-size: 11px; color: #9CA3AF; }
        .detail-value { font-size: 16px; font-weight: 700; color: #1A1A2E; }
        .divider { height: 1px; background: #E5E7EB; margin: 20px 0; }
        .footer { background: #F8F9FA; padding: 20px 30px; text-align: center; }
        .footer p { font-size: 12px; color: #9CA3AF; margin: 4px 0; }
        .footer a { color: #FCC014; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SHAREIDE</h1>
            <p>Ride Receipt</p>
        </div>
        <div class="content">
            <p class="greeting">Hi {{ $user->name ?? 'there' }},</p>
            <p style="color: #6B7280; margin-bottom: 24px;">Here's your ride receipt. Thank you for choosing Shareide!</p>

            <div class="fare-box">
                <div class="fare-label">Total Fare</div>
                <div class="fare-amount">Rs. {{ number_format($ride->fare ?? $ride->estimated_price ?? 0) }}</div>
                <div class="fare-label">{{ ucfirst($ride->payment_method ?? 'Cash') }}</div>
            </div>

            <div class="route">
                <div class="route-item">
                    <div class="route-dot pickup"></div>
                    <div>
                        <div class="route-label">Pickup</div>
                        <div class="route-address">{{ $ride->pickup_address ?? $ride->pickup_location ?? 'N/A' }}</div>
                    </div>
                </div>
                <div class="route-item">
                    <div class="route-dot dropoff"></div>
                    <div>
                        <div class="route-label">Dropoff</div>
                        <div class="route-address">{{ $ride->drop_address ?? $ride->dropoff_location ?? 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Distance</div>
                    <div class="detail-value">{{ $ride->distance_km ?? '0' }} km</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">{{ $ride->duration_minutes ?? '0' }} min</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Ride ID</div>
                    <div class="detail-value">#{{ $ride->id }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">{{ $ride->completed_at ? \Carbon\Carbon::parse($ride->completed_at)->format('M d, Y') : now()->format('M d, Y') }}</div>
                </div>
            </div>

            <div class="divider"></div>
            <p style="color: #6B7280; font-size: 13px; text-align: center;">
                If you have any questions about this ride, please contact our support team.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Shareide. All rights reserved.</p>
            <p><a href="https://shareide.com">shareide.com</a></p>
        </div>
    </div>
</body>
</html>
