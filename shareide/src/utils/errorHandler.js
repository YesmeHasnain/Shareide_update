import { Alert } from 'react-native';
import log from './logger';

export const handleApiError = (error, customMessage = null) => {
  log.error('API Error:', error);

  // Network error
  if (error.message === 'Network Error' || !error.response) {
    Alert.alert(
      'Connection Error',
      'Unable to connect to server. Please check your internet connection and try again.'
    );
    return;
  }

  // Get error message from response
  const message = error.response?.data?.message
    || error.response?.data?.error
    || customMessage
    || 'Something went wrong. Please try again.';

  // Handle specific status codes
  switch (error.response?.status) {
    case 400:
      Alert.alert('Invalid Request', message);
      break;
    case 401:
      Alert.alert('Session Expired', 'Please login again to continue.');
      break;
    case 403:
      Alert.alert('Access Denied', 'You do not have permission to perform this action.');
      break;
    case 404:
      Alert.alert('Not Found', message);
      break;
    case 422:
      // Validation error
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        Alert.alert('Validation Error', Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        Alert.alert('Validation Error', message);
      }
      break;
    case 429:
      Alert.alert('Too Many Requests', 'Please wait a moment before trying again.');
      break;
    case 500:
      Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
      break;
    default:
      Alert.alert('Error', message);
  }
};

export const showSuccessMessage = (title, message, onOk = null) => {
  Alert.alert(title, message, [
    { text: 'OK', onPress: onOk },
  ]);
};

export const showConfirmation = (title, message, onConfirm, onCancel = null) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', onPress: onConfirm },
    ]
  );
};

export const showDestructiveConfirmation = (title, message, confirmText, onConfirm) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]
  );
};
