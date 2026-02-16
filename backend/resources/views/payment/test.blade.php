<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Payment</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: #fff;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .logo {
            width: 80px;
            height: 80px;
            background: #FCC014;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 24px;
            font-size: 32px;
        }
        h1 {
            color: #1a1a2e;
            font-size: 22px;
            margin-bottom: 8px;
        }
        .test-badge {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .amount-box {
            background: #F3F4F6;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
        }
        .amount-label {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .amount-value {
            color: #1a1a2e;
            font-size: 36px;
            font-weight: 700;
        }
        .order-id {
            color: #9CA3AF;
            font-size: 12px;
            margin-top: 8px;
        }
        .buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 24px;
        }
        .btn {
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn:active {
            transform: translateY(0);
        }
        .btn-success {
            background: #10B981;
            color: #fff;
        }
        .btn-success:hover {
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        .btn-fail {
            background: #EF4444;
            color: #fff;
        }
        .btn-fail:hover {
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }
        .note {
            color: #9CA3AF;
            font-size: 12px;
            margin-top: 20px;
            line-height: 1.5;
        }
        form {
            display: contents;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">💳</div>
        <h1>Test Payment Gateway</h1>
        <span class="test-badge">TEST MODE</span>

        <div class="amount-box">
            <div class="amount-label">Amount to Pay</div>
            <div class="amount-value">Rs. {{ number_format($amount ?? 0) }}</div>
            <div class="order-id">Order: {{ $order_id ?? 'N/A' }}</div>
        </div>

        <div class="buttons">
            <form action="{{ url('/api/wallet/test-payment/process') }}" method="POST">
                <input type="hidden" name="order_id" value="{{ $order_id }}">
                <input type="hidden" name="action" value="success">
                <button type="submit" class="btn btn-success">
                    ✓ Simulate Successful Payment
                </button>
            </form>

            <form action="{{ url('/api/wallet/test-payment/process') }}" method="POST">
                <input type="hidden" name="order_id" value="{{ $order_id }}">
                <input type="hidden" name="action" value="fail">
                <button type="submit" class="btn btn-fail">
                    ✕ Simulate Failed Payment
                </button>
            </form>
        </div>

        <p class="note">
            This is a test payment page for development.<br>
            In production, this will connect to Bank Alfalah.
        </p>
    </div>
</body>
</html>
