import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { scheduleAPI } from '../../api/schedule';

const ScheduleScreen = () => {
  const { colors } = useTheme();
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Schedules 📅</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Schedules List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No schedules yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your daily routes to start receiving ride requests
            </Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <View
              key={schedule.id}
              style={[styles.scheduleCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleRoute, { color: colors.text }]}>
                    📍 {schedule.from_location}
                  </Text>
                  <Text style={[styles.scheduleRoute, { color: colors.text }]}>
                    🎯 {schedule.to_location}
                  </Text>
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
                  <Text style={styles.scheduleTimeIcon}>🕐</Text>
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
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>
                    ✏️ Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.error }]}
                  onPress={() => handleDelete(schedule.id)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>
                    🗑️ Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
              </Text>

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
                        borderColor: colors.border,
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleRoute: {
    fontSize: 16,
    marginBottom: 4,
  },
  scheduleDetails: {
    marginBottom: 12,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTimeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  scheduleTimeText: {
    fontSize: 14,
  },
  scheduleDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  scheduleStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  scheduleStat: {
    flex: 1,
    alignItems: 'center',
  },
  scheduleStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scheduleStatLabel: {
    fontSize: 12,
  },
  scheduleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  daysSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ScheduleScreen;