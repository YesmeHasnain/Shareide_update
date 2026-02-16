<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
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
        .icon {
            width: 80px;
            height: 80px;
            background: #10B981;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 24px;
        }
        .icon svg {
            width: 40px;
            height: 40px;
            fill: #fff;
        }
        h1 {
            color: #1a1a2e;
            font-size: 24px;
            margin-bottom: 8px;
        }
        .amount {
            color: #FCC014;
            font-size: 36px;
            font-weight: 700;
            margin: 16px 0;
        }
        .balance {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .message {
            color: #6B7280;
            font-size: 14px;
            line-height: 1.6;
        }
        .url-marker {
            display: none;
        }
    </style>
</head>
<body>
    <!-- URL marker for app detection -->
    <div class="url-marker" id="payment-success" data-amount="{{ $amount }}" data-balance="{{ $balance }}"></div>

    <div class="container">
        <div class="icon">
            <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
        </div>
        <h1>Payment Successful!</h1>
        <div class="amount">Rs. {{ number_format($amount) }}</div>
        <div class="balance">New Balance: Rs. {{ number_format($balance) }}</div>
        <p class="message">
            Your wallet has been topped up successfully.<br>
            You can now use your balance for rides.
        </p>
    </div>

    <script>
        // Signal to the app that payment was successful
        window.paymentResult = {
            success: true,
            amount: {{ $amount }},
            balance: {{ $balance }}
        };
    </script>
</body>
</html>
