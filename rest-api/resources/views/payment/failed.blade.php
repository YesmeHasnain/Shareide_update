<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
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
            background: #EF4444;
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
        .error-message {
            color: #EF4444;
            font-size: 14px;
            background: #FEF2F2;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 16px 0 24px;
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
    <div class="url-marker" id="payment-failed" data-error="{{ $error }}"></div>

    <div class="container">
        <div class="icon">
            <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
        </div>
        <h1>Payment Failed</h1>
        <div class="error-message">{{ $error }}</div>
        <p class="message">
            Your payment could not be processed.<br>
            Please try again or use a different payment method.
        </p>
    </div>

    <script>
        // Signal to the app that payment failed
        window.paymentResult = {
            success: false,
            error: "{{ $error }}"
        };
    </script>
</body>
</html>
