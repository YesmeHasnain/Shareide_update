import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { onboardingAPI } from '../../api/onboarding';
import { spacing, typography, borderRadius } from '../../theme/colors';

const STATUS_CONFIG = {
  incomplete: {
    icon: 'create',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  pending: {
    icon: 'hourglass',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  rejected: {
    icon: 'close-circle',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
  },
  approved: {
    icon: 'checkmark-circle',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  default: {
    icon: 'document-text',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.12)',
  },
};

const PendingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { logout, user, updateUser } = useAuth();

  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef();

  useEffect(() => {
    fetchStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);

    // Listen for app state changes (when app comes to foreground)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground - checking status');
        fetchStatus();
      }
      appState.current = nextAppState;
    });

    // Listen for approval/rejection notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { data } = notification.request.content;
      if (data?.type === 'driver_approved' || data?.type === 'driver_rejected') {
        console.log('Received approval notification:', data);
        fetchStatus();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await onboardingAPI.getStatus();
      if (response.success) {
        setStatus(response.data);

        // If approved, update user context and navigate to main app
        if (response.data.driver?.status === 'approved') {
          // Update user context with new driver status and documents
          const updatedUser = {
            ...(user || {}),
            driver: {
              ...response.data.driver,
              documents: response.data.documents,
            },
            documents: response.data.documents,
          };
          await updateUser(updatedUser);
          // Small delay to let AuthContext state settle before navigating
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }, 300);
        }
      }
    } catch (error) {
      console.error('Fetch status error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  const getStatusInfo = () => {
    const driverStatus = status?.driver?.status || 'pending';
    const config = STATUS_CONFIG[driverStatus] || STATUS_CONFIG.default;

    switch (driverStatus) {
      case 'incomplete':
        return {
          ...config,
          title: 'Registration Incomplete',
          message: 'Please complete all registration steps to submit your application for review.',
        };
      case 'pending':
        return {
          ...config,
          title: 'Under Review',
          message: 'Your application is being reviewed by our team. This usually takes 24-48 hours.',
        };
      case 'rejected':
        return {
          ...config,
          title: 'Application Not Approved',
          message: status?.driver?.rejection_reason || 'Your application did not meet our requirements. Please contact support for more details.',
        };
      case 'approved':
        return {
          ...config,
          title: 'Approved!',
          message: 'Congratulations! Your application has been approved. You can now start accepting rides.',
        };
      default:
        return {
          ...config,
          title: 'Pending',
          message: 'Please complete your application.',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Icon */}
        <View style={[styles.iconContainer, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon} size={56} color={statusInfo.color} />
        </View>

        {/* Status Info */}
        <Text style={[styles.title, { color: colors.text }]}>
          {statusInfo.title}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {statusInfo.message}
        </Text>

        {/* Completion Status */}
        {status && (
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statusCardTitle, { color: colors.text }]}>
              Application Status
            </Text>

            <StatusItem
              label="Personal Info"
              completed={status.steps_completed.personal_info}
              colors={colors}
            />
            <StatusItem
              label="Vehicle Info"
              completed={status.steps_completed.vehicle_info}
              colors={colors}
            />
            <StatusItem
              label="Documents"
              completed={status.steps_completed.documents}
              colors={colors}
            />
            <StatusItem
              label="Selfies"
              completed={status.steps_completed.selfies}
              colors={colors}
            />
            <StatusItem
              label="Submitted"
              completed={status.steps_completed.submitted}
              colors={colors}
            />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Refresh Status"
            onPress={handleRefresh}
            variant="outline"
            style={styles.button}
          />

          {status?.driver?.status === 'rejected' && (
            <Button
              title="Contact Support"
              onPress={() => {/* TODO: Add support contact */}}
              style={styles.button}
            />
          )}

          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={[styles.helpCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.helpIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
            <Ionicons name="bulb" size={20} color="#3B82F6" />
          </View>
          <View style={styles.helpTextContainer}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>
              Need Help?
            </Text>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Pull down to refresh your application status. If you have any questions,
              please contact our support team.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatusItem = ({ label, completed, colors }) => (
  <View style={styles.statusItem}>
    <View style={[
      styles.statusItemIconBg,
      { backgroundColor: completed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)' }
    ]}>
      <Ionicons
        name={completed ? 'checkmark-circle' : 'hourglass'}
        size={18}
        color={completed ? '#10B981' : '#F59E0B'}
      />
    </View>
    <Text style={[styles.statusItemLabel, { color: colors.text }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.massive,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  statusCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  statusCardTitle: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusItemIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusItemLabel: {
    fontSize: typography.body,
  },
  actions: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  logoutButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  helpCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  helpIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
});

export default PendingScreen;
