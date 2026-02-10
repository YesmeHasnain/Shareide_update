import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CalendarPicker = ({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  markedDates = [],
  style,
}) => {
  const { colors } = useTheme();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate).getMonth() : today.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    selectedDate ? new Date(selectedDate).getFullYear() : today.getFullYear()
  );

  const selectedDateStr = selectedDate
    ? new Date(selectedDate).toISOString().split('T')[0]
    : null;
  const todayStr = today.toISOString().split('T')[0];
  const minDateObj = minDate ? new Date(minDate) : null;
  const maxDateObj = maxDate ? new Date(maxDate) : null;

  const getDaysInMonth = useCallback((month, year) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((month, year) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday-based
  }, []);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }

    // Days in month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDateStr;
      const isDisabled =
        (minDateObj && date < minDateObj) ||
        (maxDateObj && date > maxDateObj);
      const isMarked = markedDates.includes(dateStr);

      days.push({
        day: d,
        key: dateStr,
        dateStr,
        date,
        isToday,
        isSelected,
        isDisabled,
        isMarked,
      });
    }

    return days;
  }, [currentMonth, currentYear, selectedDateStr, todayStr, markedDates]);

  const goToPrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayPress = (dayInfo) => {
    if (dayInfo.isDisabled || !dayInfo.day) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate?.(dayInfo.date);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, { color: colors.textTertiary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarDays.map((dayInfo) => (
          <TouchableOpacity
            key={dayInfo.key}
            onPress={() => handleDayPress(dayInfo)}
            disabled={!dayInfo.day || dayInfo.isDisabled}
            style={styles.dayCell}
            activeOpacity={0.7}
          >
            {dayInfo.day && (
              <View
                style={[
                  styles.dayInner,
                  dayInfo.isSelected && {
                    backgroundColor: colors.primary,
                  },
                  dayInfo.isToday &&
                    !dayInfo.isSelected && {
                      borderWidth: 2,
                      borderColor: colors.primary,
                    },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text },
                    dayInfo.isSelected && { color: '#000000', fontWeight: '700' },
                    dayInfo.isDisabled && { color: colors.textTertiary, opacity: 0.4 },
                  ]}
                >
                  {dayInfo.day}
                </Text>
                {dayInfo.isMarked && !dayInfo.isSelected && (
                  <View style={[styles.markerDot, { backgroundColor: colors.primary }]} />
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  markerDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default CalendarPicker;
