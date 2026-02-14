import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { scheduleAPI } from '../../api/schedule';
import { spacing, typography, borderRadius, shadows } from '../../theme/colors';

const ScheduleScreen = () => {
  const { colors } = useTheme();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const cardAnims = useRef([]).current;

  const [formData, setFormData] = useState({
    from_location: '',
    from_latitude: '',
    from_longitude: '',
    to_location: '',
    to_latitude: '',
    to_longitude: '',
    departure_time: '',
    days: [],
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (schedules.length > 0) {
      // Ensure we have enough anims
      while (cardAnims.length < schedules.length) {
        cardAnims.push(new Animated.Value(0));
      }
      cardAnims.forEach((anim) => anim.setValue(0));
      Animated.stagger(
        60,
        cardAnims.slice(0, schedules.length).map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [schedules]);

  const fetchSchedules = async () => {
    try {
      const response = await scheduleAPI.getSchedules();
      if (response.success) {
        setSchedules(response.data.schedules || []);
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
    }
  };

  const handleDayToggle = (day) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const days = [...formData.days];
    const index = days.indexOf(day);

    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
    }

    setFormData({ ...formData, days });
  };

  const handleSave = async () => {
    if (!formData.from_location || !formData.to_location || !formData.departure_time) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.days.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    setLoading(true);
    try {
      let response;

      if (editingSchedule) {
        response = await scheduleAPI.updateSchedule(editingSchedule.id, formData);
      } else {
        response = await scheduleAPI.createSchedule(formData);
      }

      if (response.success) {
        Alert.alert('Success', `Schedule ${editingSchedule ? 'updated' : 'created'} successfully!`);
        setModalVisible(false);
        resetForm();
        fetchSchedules();
      }
    } catch (error) {
      console.error('Save schedule error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingSchedule(schedule);
    setFormData({
      from_location: schedule.from_location,
      from_latitude: schedule.from_latitude.toString(),
      from_longitude: schedule.from_longitude.toString(),
      to_location: schedule.to_location,
      to_latitude: schedule.to_latitude.toString(),
      to_longitude: schedule.to_longitude.toString(),
      departure_time: schedule.departure_time,
      days: schedule.days,
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleAPI.deleteSchedule(id);
              fetchSchedules();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  const handleToggle = async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await scheduleAPI.toggleSchedule(id);
      fetchSchedules();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle schedule');
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      from_location: '',
      from_latitude: '',
      from_longitude: '',
      to_location: '',
      to_latitude: '',
      to_longitude: '',
      departure_time: '',
      days: [],
    });
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetForm();
    setModalVisible(true);
  };

  const getAnimStyle = (index) => {
    const anim = cardAnims[index];
    if (!anim) return {};
    return {
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
      ],
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Schedules"
        rightIcon="add"
        onRightPress={handleAddPress}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="calendar-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No schedules yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your daily routes to start receiving ride requests
            </Text>
          </View>
        ) : (
          schedules.map((schedule, index) => (
            <Animated.View key={schedule.id} style={getAnimStyle(index)}>
              <Card style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  {/* Route Timeline */}
                  <View style={styles.routeSection}>
                    <View style={styles.routeRow}>
                      <View style={[styles.routeDot, { backgroundColor: colors.pickupDot || '#10B981' }]} />
                      <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
                        {schedule.from_location}
                      </Text>
                    </View>
                    <View style={[styles.routeLine, { borderColor: colors.routeConnector || colors.border }]} />
                    <View style={styles.routeRow}>
                      <View style={[styles.routeDot, { backgroundColor: colors.dropoffDot || '#EF4444' }]} />
                      <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
                        {schedule.to_location}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={schedule.is_active}
                    onValueChange={() => handleToggle(schedule.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.scheduleDetails}>
                  <View style={styles.scheduleTime}>
                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                    <Text style={[styles.scheduleTimeText, { color: colors.textSecondary }]}>
                      {schedule.departure_time}
                    </Text>
                  </View>

                  <View style={styles.scheduleDays}>
                    {schedule.days.map((day) => (
                      <View
                        key={day}
                        style={[styles.dayBadge, { backgroundColor: colors.primary }]}
                      >
                        <Text style={styles.dayBadgeText}>
                          {day.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.scheduleStats}>
                  <View style={styles.scheduleStat}>
                    <Text style={[styles.scheduleStatValue, { color: colors.text }]}>
                      {schedule.matched_rides || 0}
                    </Text>
                    <Text style={[styles.scheduleStatLabel, { color: colors.textSecondary }]}>
                      Matched Rides
                    </Text>
                  </View>
                  <View style={styles.scheduleStat}>
                    <Text style={[styles.scheduleStatValue, { color: colors.text }]}>
                      Rs. {schedule.total_earnings || 0}
                    </Text>
                    <Text style={[styles.scheduleStatLabel, { color: colors.textSecondary }]}>
                      Earnings
                    </Text>
                  </View>
                </View>

                <View style={styles.scheduleActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.border }]}
                    onPress={() => handleEdit(schedule)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.text} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    onPress={() => handleDelete(schedule.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card || colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalCloseBtn, { backgroundColor: colors.inputBackground }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Input
                label="From Location *"
                value={formData.from_location}
                onChangeText={(value) => setFormData({ ...formData, from_location: value })}
                placeholder="Saddar"
              />

              <View style={styles.coordRow}>
                <Input
                  label="Latitude *"
                  value={formData.from_latitude}
                  onChangeText={(value) => setFormData({ ...formData, from_latitude: value })}
                  placeholder="24.8607"
                  keyboardType="numeric"
                  style={styles.coordInput}
                />
                <Input
                  label="Longitude *"
                  value={formData.from_longitude}
                  onChangeText={(value) => setFormData({ ...formData, from_longitude: value })}
                  placeholder="67.0011"
                  keyboardType="numeric"
                  style={styles.coordInput}
                />
              </View>

              <Input
                label="To Location *"
                value={formData.to_location}
                onChangeText={(value) => setFormData({ ...formData, to_location: value })}
                placeholder="Gulshan-e-Iqbal"
              />

              <View style={styles.coordRow}>
                <Input
                  label="Latitude *"
                  value={formData.to_latitude}
                  onChangeText={(value) => setFormData({ ...formData, to_latitude: value })}
                  placeholder="24.9056"
                  keyboardType="numeric"
                  style={styles.coordInput}
                />
                <Input
                  label="Longitude *"
                  value={formData.to_longitude}
                  onChangeText={(value) => setFormData({ ...formData, to_longitude: value })}
                  placeholder="67.0822"
                  keyboardType="numeric"
                  style={styles.coordInput}
                />
              </View>

              <Input
                label="Departure Time *"
                value={formData.departure_time}
                onChangeText={(value) => setFormData({ ...formData, departure_time: value })}
                placeholder="08:00"
              />

              <Text style={[styles.daysSectionLabel, { color: colors.text }]}>
                Select Days *
              </Text>
              <View style={styles.daysContainer}>
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: formData.days.includes(day.key)
                          ? colors.primary
                          : colors.background,
                        borderColor: formData.days.includes(day.key) ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleDayToggle(day.key)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        {
                          color: formData.days.includes(day.key)
                            ? '#000'
                            : colors.text,
                        },
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Save"
                  onPress={handleSave}
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.massive,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  scheduleCard: {
    marginBottom: spacing.lg,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  routeSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  routeLine: {
    width: 0,
    height: 16,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    fontSize: typography.body,
    fontWeight: '500',
    flex: 1,
  },
  scheduleDetails: {
    marginBottom: spacing.md,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  scheduleTimeText: {
    fontSize: typography.bodySmall,
  },
  scheduleDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
    marginRight: spacing.xs + 2,
    marginBottom: spacing.xs + 2,
  },
  dayBadgeText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#000',
  },
  scheduleStats: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  scheduleStat: {
    flex: 1,
    alignItems: 'center',
  },
  scheduleStatValue: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: 2,
  },
  scheduleStatLabel: {
    fontSize: typography.caption,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  daysSectionLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xxl,
  },
  dayButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});

export default ScheduleScreen;
