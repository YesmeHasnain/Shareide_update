import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { onboardingAPI } from '../../api/onboarding';

const PendingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { logout, user } = useAuth();
  
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await onboardingAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
        
        // If approved, navigate to main app
        if (response.data.driver?.status === 'approved') {
          navigation.replace('MainTabs');
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
    
    switch (driverStatus) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Under Review',
          message: 'Your application is being reviewed by our team. This usually takes 24-48 hours.',
          color: colors.warning,
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Application Not Approved',
          message: status?.driver?.rejection_reason || 'Your application did not meet our requirements. Please contact support for more details.',
          color: colors.error,
        };
      case 'approved':
        return {
          icon: '✅',
          title: 'Approved!',
          message: 'Congratulations! Your application has been approved. You can now start accepting rides.',
          color: colors.success,
        };
      default:
        return {
          icon: '📋',
          title: 'Pending',
          message: 'Please complete your application.',
          color: colors.textSecondary,
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
        <View style={styles.iconContainer}>
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
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
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            💡 Need Help?
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Pull down to refresh your application status. If you have any questions, 
            please contact our support team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatusItem = ({ label, completed, colors }) => (
  <View style={styles.statusItem}>
    <Text style={styles.statusItemIcon}>{completed ? '✅' : '⏳'}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  statusIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statusCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statusItemLabel: {
    fontSize: 16,
  },
  actions: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PendingScreen;