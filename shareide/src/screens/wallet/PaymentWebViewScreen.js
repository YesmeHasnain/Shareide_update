import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';

const PaymentWebViewScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { paymentUrl, formData, orderId, amount } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Generate HTML form that auto-submits to Bank Alfalah
  const generateFormHtml = () => {
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
    const { url } = navState;

    // Check for success callback URL
    if (url.includes('/wallet/topup/success')) {
      Alert.alert(
        'Payment Successful',
        `Rs. ${amount.toLocaleString()} has been added to your wallet!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Drawer' }],
              });
            },
          },
        ]
      );
    }

    // Check for failed callback URL
    if (url.includes('/wallet/topup/failed')) {
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
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
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
