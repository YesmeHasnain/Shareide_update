import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
};

const PaymentWebViewScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const params = route?.params || {};
  const { paymentUrl, formData, orderId, amount, testMode, testHtml } = params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('PaymentWebView params:', {
    paymentUrl,
    formData: formData ? Object.keys(formData) : null,
    orderId,
    amount,
    testMode,
    hasTestHtml: !!testHtml,
  });

  // Validate params (skip for test mode with inline HTML)
  if (!testHtml && (!paymentUrl || !formData)) {
    console.error('Missing payment parameters:', { paymentUrl, formData });
    Alert.alert(
      'Error',
      'Payment configuration error. Please try again.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    return null;
  }

  // Generate HTML form that auto-submits to Bank Alfalah
  const generateFormHtml = () => {
    // If test HTML is provided, use it directly
    if (testHtml) {
      return testHtml;
    }

    const formFields = Object.entries(formData || {})
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .loader {
            text-align: center;
            color: #FFD700;
          }
          .loader p {
            margin-top: 20px;
            font-size: 16px;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #333;
            border-top: 4px solid #FFD700;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <p>Redirecting to Bank Alfalah...</p>
          <p style="font-size: 12px; color: #888;">Please wait</p>
        </div>
        <form id="paymentForm" method="POST" action="${paymentUrl}">
          ${formFields}
        </form>
        <script>
          document.getElementById('paymentForm').submit();
        </script>
      </body>
      </html>
    `;
  };

  const handleNavigationStateChange = (navState) => {
    const { url, title } = navState;
    console.log('WebView navigation:', url, title);

    // Check for success page (callback returns HTML with success marker)
    if (url.includes('/wallet/payment-callback') || url.includes('/payment/callback')) {
      // The callback page will be loaded - we'll detect success/failure via injected JS
      return;
    }

    // Check for success in URL or title
    if (url.includes('payment-success') || url.includes('/wallet/topup/success') || title === 'Payment Successful') {
      Alert.alert(
        'Payment Successful',
        `Rs. ${amount?.toLocaleString()} has been added to your wallet!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
    }

    // Check for failure
    if (url.includes('payment-failed') || url.includes('/wallet/topup/failed') || title === 'Payment Failed') {
      const errorMatch = url.match(/error=([^&]+)/);
      const errorMessage = errorMatch ? decodeURIComponent(errorMatch[1]) : 'Payment was not successful';

      Alert.alert(
        'Payment Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Cancel',
            onPress: () => navigation.navigate('Wallet'),
            style: 'cancel',
          },
        ]
      );
    }
  };

  // Handle messages from the WebView
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      // Handle test payment request from WebView
      if (data.type === 'test_payment') {
        console.log('Processing test payment:', data);
        try {
          const response = await apiClient.post('/wallet/test-payment/process', {
            order_id: data.order_id,
            action: data.action,
          });
          console.log('Test payment response:', response.data);

          if (data.action === 'success') {
            Alert.alert(
              'Payment Successful',
              `Rs. ${amount?.toLocaleString()} has been added to your wallet!`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs' }],
                    });
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              'Payment Cancelled',
              'You have cancelled the payment.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }
        } catch (error) {
          console.error('Test payment error:', error);
          Alert.alert(
            'Error',
            error.response?.data?.message || 'Payment processing failed. Please try again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
        return;
      }

      if (data.type === 'payment_result') {
        if (data.success) {
          Alert.alert(
            'Payment Successful',
            `Rs. ${data.amount?.toLocaleString()} has been added to your wallet!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Payment Failed',
            data.error || 'Payment was not successful',
            [
              {
                text: 'Try Again',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Cancel',
                onPress: () => navigation.navigate('Wallet'),
                style: 'cancel',
              },
            ]
          );
        }
      }
    } catch (e) {
      // Not a JSON message, ignore
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Payment</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Bank Alfalah Gateway
          </Text>
        </View>
        <Text style={styles.secureIcon}>🔒</Text>
      </View>

      <View style={[styles.amountBar, { backgroundColor: colors.primary }]}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amountValue}>Rs. {amount?.toLocaleString()}</Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading payment gateway...
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: generateFormHtml() }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
          Alert.alert(
            'Connection Error',
            'Failed to connect to payment gateway. Please check your internet connection and try again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent.statusCode, nativeEvent.url);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        cacheEnabled={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        injectedJavaScript={`
          // Check for payment result markers in the page
          (function() {
            var successMarker = document.getElementById('payment-success');
            var failedMarker = document.getElementById('payment-failed');

            if (successMarker) {
              var amount = successMarker.getAttribute('data-amount');
              var balance = successMarker.getAttribute('data-balance');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_result',
                success: true,
                amount: parseFloat(amount),
                balance: parseFloat(balance)
              }));
            }

            if (failedMarker) {
              var error = failedMarker.getAttribute('data-error');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_result',
                success: false,
                error: error
              }));
            }
          })();
          true;
        `}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeIcon: { fontSize: 24, padding: 8 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  secureIcon: { fontSize: 24, padding: 8 },
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  amountLabel: { fontSize: 14, color: '#000' },
  amountValue: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  loadingOverlay: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14 },
  webview: { flex: 1 },
});

export default PaymentWebViewScreen;
