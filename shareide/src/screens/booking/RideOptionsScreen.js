import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { ridesAPI } from '../../api/rides';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  inputBackground: '#F5F5F5',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  successLight: '#D1FAE5',
};

// Ride Type Selection Component
const RideTypeOption = ({ type, isSelected, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(type.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.rideTypeOption}
    >
      <View
        style={[
          styles.rideTypeInner,
          isSelected
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.inputBackground || '#F5F5F5' },
        ]}
      >
        <Ionicons name={type.icon} size={24} color={isSelected ? '#000' : colors.textSecondary} />
        <Text style={[styles.rideTypeName, { color: isSelected ? '#000' : colors.text }]}>{type.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Vehicle Type Card Component
const VehicleCard = ({ vehicle, isSelected, onPress, colors, showPrice = true }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(vehicle.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.vehicleCardWrapper}
    >
      <View
        style={[
          styles.vehicleCard,
          { backgroundColor: colors.card },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
          !isSelected && { borderColor: colors.border, borderWidth: 1 },
          shadows.sm,
        ]}
      >
        {/* Popular badge for premium vehicles */}
        {vehicle.popular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.popularBadgeText}>POPULAR</Text>
          </View>
        )}

        <View style={styles.vehicleCardContent}>
          {/* Vehicle Icon */}
          <View
            style={[
              styles.vehicleIconContainer,
              { backgroundColor: isSelected ? colors.primary + '20' : colors.surface },
            ]}
          >
            <Ionicons
              name={vehicle.icon}
              size={32}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
          </View>

          {/* Vehicle Info */}
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicle.name}</Text>
            <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]}>
              {vehicle.description}
            </Text>
            <View style={styles.vehicleFeatures}>
              <View style={styles.vehicleFeature}>
                <Ionicons name="people-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.vehicleFeatureText, { color: colors.textTertiary }]}>
                  {vehicle.seats} {typeof vehicle.seats === 'number' ? (vehicle.seats === 1 ? 'seat' : 'seats') : ''}
                </Text>
                {vehicle.hasDynamicSeats && (
                  <View style={[styles.liveBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.liveBadgeText, { color: colors.success }]}>LIVE</Text>
                  </View>
                )}
              </View>
              <View style={styles.vehicleFeature}>
                <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.vehicleFeatureText, { color: colors.textTertiary }]}>
                  {vehicle.eta} min
                </Text>
              </View>
              {vehicle.driverCount > 0 && (
                <View style={styles.vehicleFeature}>
                  <Ionicons name="car-outline" size={14} color={colors.primary} />
                  <Text style={[styles.vehicleFeatureText, { color: colors.primary }]}>
                    {vehicle.driverCount} available
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Price */}
          {showPrice && (
            <View style={styles.vehiclePriceContainer}>
              <Text style={[styles.vehiclePrice, { color: colors.primary }]}>
                Rs. {vehicle.price}
              </Text>
              {vehicle.originalPrice && (
                <Text style={[styles.vehicleOriginalPrice, { color: colors.textTertiary }]}>
                  Rs. {vehicle.originalPrice}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Selection indicator */}
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={16} color="#000" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Seat Selection Component
const SeatSelector = ({ maxSeats, selectedSeats, onSeatsChange, reserveAll, onReserveAllChange, colors }) => {
  const handleSeatChange = (delta) => {
    const newValue = Math.max(1, Math.min(maxSeats, selectedSeats + delta));
    if (newValue !== selectedSeats) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSeatsChange(newValue);
    }
  };

  return (
    <View style={styles.seatSelectorContainer}>
      <View style={styles.seatSelectorRow}>
        <View style={styles.seatSelectorLeft}>
          <View style={[styles.seatIconBg, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="people" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.seatLabel, { color: colors.text }]}>Seats Required</Text>
            <Text style={[styles.seatSubLabel, { color: colors.textSecondary }]}>
              Max {maxSeats} seats available
            </Text>
          </View>
        </View>

        <View style={styles.seatCounter}>
          <TouchableOpacity
            onPress={() => handleSeatChange(-1)}
            style={[
              styles.seatCounterBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            disabled={selectedSeats <= 1}
          >
            <Ionicons
              name="remove"
              size={20}
              color={selectedSeats <= 1 ? colors.textTertiary : colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.seatCount, { color: colors.text }]}>{selectedSeats}</Text>
          <TouchableOpacity
            onPress={() => handleSeatChange(1)}
            style={[
              styles.seatCounterBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            disabled={selectedSeats >= maxSeats || reserveAll}
          >
            <Ionicons
              name="add"
              size={20}
              color={selectedSeats >= maxSeats || reserveAll ? colors.textTertiary : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reserve entire vehicle */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onReserveAllChange(!reserveAll);
        }}
        activeOpacity={0.7}
        style={[
          styles.reserveAllContainer,
          { backgroundColor: reserveAll ? colors.primary + '15' : colors.surface },
          reserveAll && { borderColor: colors.primary, borderWidth: 1 },
          !reserveAll && { borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <View style={styles.reserveAllLeft}>
          <Ionicons
            name={reserveAll ? 'checkbox' : 'square-outline'}
            size={24}
            color={reserveAll ? colors.primary : colors.textSecondary}
          />
          <View>
            <Text style={[styles.reserveAllTitle, { color: colors.text }]}>
              Reserve Entire Vehicle
            </Text>
            <Text style={[styles.reserveAllDesc, { color: colors.textSecondary }]}>
              Pay for all {maxSeats} seats for private ride
            </Text>
          </View>
        </View>
        <View style={[styles.reserveAllBadge, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.reserveAllBadgeText, { color: colors.success }]}>
            Private
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Additional Options Toggle Component
const OptionToggle = ({ icon, title, subtitle, value, onToggle, colors, badge }) => {
  return (
    <View style={styles.optionToggleContainer}>
      <View style={styles.optionToggleLeft}>
        <View style={[styles.optionIconBg, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.optionTextContainer}>
          <View style={styles.optionTitleRow}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
            {badge && (
              <View style={[styles.optionBadge, { backgroundColor: badge.bgColor }]}>
                <Text style={[styles.optionBadgeText, { color: badge.textColor }]}>
                  {badge.text}
                </Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(val);
        }}
        trackColor={{ false: colors.border, true: colors.primary + '60' }}
        thumbColor={value ? colors.primary : colors.surface}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
};

const RideOptionsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { pickup, dropoff } = params;

  // Ride type state
  const [rideType, setRideType] = useState('one_time');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [packageStartDate, setPackageStartDate] = useState(new Date());
  const [packageEndDate, setPackageEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showPackageStartPicker, setShowPackageStartPicker] = useState(false);
  const [showPackageEndPicker, setShowPackageEndPicker] = useState(false);

  // Vehicle type state
  const [selectedVehicle, setSelectedVehicle] = useState('car_economy');
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingVehicleTypes, setLoadingVehicleTypes] = useState(true);

  // Seat selection state
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [reserveEntireVehicle, setReserveEntireVehicle] = useState(false);

  // Additional options state
  const [acEnabled, setAcEnabled] = useState(true);
  const [femaleDriverPreferred, setFemaleDriverPreferred] = useState(false);
  const [luggageSpace, setLuggageSpace] = useState(false);

  // Animation for fare
  const [fareAnimation] = useState(new Animated.Value(1));

  // Ride types data
  const rideTypes = [
    { id: 'one_time', name: 'One-Time', icon: 'car-outline' },
    { id: 'scheduled', name: 'Scheduled', icon: 'calendar-outline' },
    { id: 'package', name: 'Multi-Day', icon: 'layers-outline' },
  ];

  // Default vehicle types (fallback when API fails)
  const defaultVehicleTypes = [
    {
      id: 'bike',
      name: 'Bike',
      description: 'Quick & affordable',
      icon: 'bicycle',
      seats: 1,
      maxSeats: 1,
      eta: 3,
      price: 80,
      baseFare: 30,
      perKm: 12,
    },
    {
      id: 'car_economy',
      name: 'Car (Economy)',
      description: 'Suzuki, Cultus, Wagon R',
      icon: 'car-outline',
      seats: 4,
      maxSeats: 4,
      eta: 5,
      price: 200,
      baseFare: 100,
      perKm: 22,
      popular: true,
    },
    {
      id: 'car_premium',
      name: 'Car (Premium)',
      description: 'Honda City, Toyota Corolla',
      icon: 'car',
      seats: 4,
      maxSeats: 4,
      eta: 7,
      price: 350,
      originalPrice: 400,
      baseFare: 150,
      perKm: 35,
    },
    {
      id: 'van',
      name: 'Van',
      description: 'For groups (6-8 seats)',
      icon: 'bus-outline',
      seats: '6-8',
      maxSeats: 8,
      eta: 10,
      price: 500,
      baseFare: 200,
      perKm: 45,
    },
  ];

  // Fetch dynamic vehicle types from API
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      setLoadingVehicleTypes(true);
      const pickupLat = pickup?.latitude || null;
      const pickupLng = pickup?.longitude || null;

      const response = await ridesAPI.getVehicleTypes(pickupLat, pickupLng);

      if (response.success && response.data?.vehicleTypes?.length > 0) {
        // Map API response to local format with prices
        const mappedVehicleTypes = response.data.vehicleTypes.map(vt => ({
          id: vt.id,
          name: vt.name,
          description: vt.description,
          icon: vt.icon,
          seats: vt.seats || vt.maxSeats || vt.defaultSeats,
          maxSeats: vt.maxSeats || vt.seats || vt.defaultSeats,
          minSeats: vt.minSeats || 1,
          availableSeats: vt.availableSeats || [],
          eta: vt.eta,
          price: vt.baseFare * 2, // Estimate base price
          baseFare: vt.baseFare,
          perKm: vt.perKm,
          popular: vt.popular || false,
          hasDynamicSeats: vt.hasDynamicSeats || false,
          driverCount: vt.driverCount || 0,
        }));
        setVehicleTypes(mappedVehicleTypes);
      } else {
        // Use default vehicle types if API returns empty
        setVehicleTypes(defaultVehicleTypes);
      }
    } catch (error) {
      console.log('Error fetching vehicle types:', error);
      // Use default vehicle types on error
      setVehicleTypes(defaultVehicleTypes);
    } finally {
      setLoadingVehicleTypes(false);
    }
  };

  // Get selected vehicle data
  const getSelectedVehicle = () => {
    const activeVehicleTypes = vehicleTypes.length > 0 ? vehicleTypes : defaultVehicleTypes;
    return activeVehicleTypes.find((v) => v.id === selectedVehicle) || activeVehicleTypes[1] || activeVehicleTypes[0];
  };

  // Calculate total fare
  const calculateFare = () => {
    const vehicle = getSelectedVehicle();
    let baseFare = vehicle.price;

    // AC surcharge
    if (acEnabled && vehicle.id !== 'bike') {
      baseFare += 50;
    }

    // Female driver - no extra charge

    // Luggage surcharge
    if (luggageSpace) {
      baseFare += 20;
    }

    // Reserved vehicle multiplier
    if (reserveEntireVehicle) {
      const seatMultiplier = typeof vehicle.maxSeats === 'number' ? vehicle.maxSeats : 4;
      baseFare = Math.round(baseFare * (seatMultiplier * 0.8));
    } else {
      // Per-seat calculation for carpooling vehicles
      if (selectedSeats > 1 && (vehicle.id === 'van' || vehicle.id === 'high_roof')) {
        baseFare = Math.round(baseFare * (1 + (selectedSeats - 1) * 0.25));
      }
    }

    // Package discount
    if (rideType === 'package') {
      const days = Math.ceil((packageEndDate - packageStartDate) / (24 * 60 * 60 * 1000)) + 1;
      baseFare = Math.round(baseFare * days * 0.85); // 15% package discount
    }

    return baseFare;
  };

  // Animate fare when it changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fareAnimation, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fareAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedVehicle, acEnabled, femaleDriverPreferred, luggageSpace, reserveEntireVehicle, selectedSeats, rideType]);

  // Date/Time formatting
  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Date picker handlers
  const onScheduledDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      Haptics.selectionAsync();
      setScheduledDate(date);
    }
  };

  const onScheduledTimeChange = (event, time) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      Haptics.selectionAsync();
      setScheduledTime(time);
    }
  };

  const onPackageStartChange = (event, date) => {
    setShowPackageStartPicker(Platform.OS === 'ios');
    if (date) {
      Haptics.selectionAsync();
      setPackageStartDate(date);
      // Ensure end date is after start date
      if (date >= packageEndDate) {
        setPackageEndDate(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000));
      }
    }
  };

  const onPackageEndChange = (event, date) => {
    setShowPackageEndPicker(Platform.OS === 'ios');
    if (date) {
      Haptics.selectionAsync();
      setPackageEndDate(date);
    }
  };

  // Handle find drivers
  const handleFindDrivers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const vehicle = getSelectedVehicle();
    const rideOptions = {
      rideType,
      vehicleType: selectedVehicle,
      vehicleName: vehicle.name,
      seats: reserveEntireVehicle ? vehicle.maxSeats : selectedSeats,
      reserveEntireVehicle,
      acEnabled,
      femaleDriverPreferred,
      luggageSpace,
      estimatedFare: calculateFare(),
    };

    // Add schedule info for scheduled rides
    if (rideType === 'scheduled') {
      rideOptions.scheduledDate = scheduledDate;
      rideOptions.scheduledTime = scheduledTime;
    }

    // Add package info for multi-day rides
    if (rideType === 'package') {
      rideOptions.packageStartDate = packageStartDate;
      rideOptions.packageEndDate = packageEndDate;
      rideOptions.packageDays = Math.ceil((packageEndDate - packageStartDate) / (24 * 60 * 60 * 1000)) + 1;
    }

    // Navigate to search results with all options
    navigation.navigate('SearchResults', {
      pickup,
      dropoff,
      rideOptions,
    });
  };

  const selectedVehicleData = getSelectedVehicle();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ride Options</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Route Summary */}
        <Card style={styles.section} shadow="md">
          <View style={styles.routeContainer}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>FROM</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
                  {pickup?.address || pickup?.name || 'Pickup location'}
                </Text>
              </View>
            </View>
            <View style={[styles.routeConnector, { borderColor: colors.border }]}>
              <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
              <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
              <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>TO</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
                  {dropoff?.address || dropoff?.name || 'Dropoff location'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Ride Type Selection */}
        <Card style={styles.section} shadow="md">
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="options" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ride Type</Text>
          </View>
          <View style={styles.rideTypeGrid}>
            {rideTypes.map((type) => (
              <RideTypeOption
                key={type.id}
                type={type}
                isSelected={rideType === type.id}
                onPress={setRideType}
                colors={colors}
              />
            ))}
          </View>

          {/* Scheduled Ride Date/Time Picker */}
          {rideType === 'scheduled' && (
            <View style={styles.scheduledContainer}>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDatePicker(true);
                  }}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <View>
                    <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Date</Text>
                    <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                      {formatDate(scheduledDate)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowTimePicker(true);
                  }}
                >
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <View>
                    <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Time</Text>
                    <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                      {formatTime(scheduledTime)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                  onChange={onScheduledDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={scheduledTime}
                  mode="time"
                  display="default"
                  onChange={onScheduledTimeChange}
                />
              )}
            </View>
          )}

          {/* Multi-Day Package Date Range Picker */}
          {rideType === 'package' && (
            <View style={styles.packageContainer}>
              <View style={[styles.packageInfoBanner, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="information-circle" size={18} color={colors.info} />
                <Text style={[styles.packageInfoText, { color: colors.info }]}>
                  Book daily rides for multiple days and save 15%
                </Text>
              </View>

              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPackageStartPicker(true);
                  }}
                >
                  <Ionicons name="calendar" size={20} color={colors.success} />
                  <View>
                    <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Start Date</Text>
                    <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                      {formatDate(packageStartDate)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPackageEndPicker(true);
                  }}
                >
                  <Ionicons name="calendar" size={20} color={colors.error} />
                  <View>
                    <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>End Date</Text>
                    <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                      {formatDate(packageEndDate)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {showPackageStartPicker && (
                <DateTimePicker
                  value={packageStartDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  onChange={onPackageStartChange}
                />
              )}

              {showPackageEndPicker && (
                <DateTimePicker
                  value={packageEndDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date(packageStartDate.getTime() + 24 * 60 * 60 * 1000)}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  onChange={onPackageEndChange}
                />
              )}

              <View style={[styles.packageDays, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="layers" size={18} color={colors.primary} />
                <Text style={[styles.packageDaysText, { color: colors.text }]}>
                  {Math.ceil((packageEndDate - packageStartDate) / (24 * 60 * 60 * 1000)) + 1} days package
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Vehicle Type Selection */}
        <Card style={styles.section} shadow="md">
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="car" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Vehicle</Text>
            {loadingVehicleTypes && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: spacing.sm }} />
            )}
          </View>
          <View style={styles.vehicleList}>
            {(vehicleTypes.length > 0 ? vehicleTypes : defaultVehicleTypes).map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicle === vehicle.id}
                onPress={setSelectedVehicle}
                colors={colors}
              />
            ))}
          </View>
          {vehicleTypes.some(v => v.hasDynamicSeats) && (
            <View style={[styles.dynamicSeatsInfo, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="information-circle" size={16} color={colors.info} />
              <Text style={[styles.dynamicSeatsText, { color: colors.info }]}>
                Seat counts are based on available drivers in your area
              </Text>
            </View>
          )}
        </Card>

        {/* Seat Selection */}
        {selectedVehicleData.maxSeats > 1 && (
          <Card style={styles.section} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Seats</Text>
            </View>
            <SeatSelector
              maxSeats={typeof selectedVehicleData.maxSeats === 'number' ? selectedVehicleData.maxSeats : 4}
              selectedSeats={selectedSeats}
              onSeatsChange={setSelectedSeats}
              reserveAll={reserveEntireVehicle}
              onReserveAllChange={setReserveEntireVehicle}
              colors={colors}
            />
          </Card>
        )}

        {/* Additional Options */}
        <Card style={styles.section} shadow="md">
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="settings" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          </View>

          {selectedVehicle !== 'bike' && selectedVehicle !== 'rickshaw' && (
            <OptionToggle
              icon="snow"
              title="Air Conditioning"
              subtitle="Ride in comfort with AC"
              value={acEnabled}
              onToggle={setAcEnabled}
              colors={colors}
              badge={{ text: '+Rs.50', bgColor: colors.infoLight, textColor: colors.info }}
            />
          )}

          <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />

          <OptionToggle
            icon="woman"
            title="Female Driver"
            subtitle="Request a female driver (subject to availability)"
            value={femaleDriverPreferred}
            onToggle={setFemaleDriverPreferred}
            colors={colors}
          />

          <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />

          <OptionToggle
            icon="briefcase"
            title="Extra Luggage Space"
            subtitle="Need space for bags or luggage"
            value={luggageSpace}
            onToggle={setLuggageSpace}
            colors={colors}
            badge={{ text: '+Rs.20', bgColor: colors.successLight, textColor: colors.success }}
          />
        </Card>
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.xl,
        ]}
      >
        <View style={styles.fareContainer}>
          <View style={styles.fareLeft}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Estimated Fare</Text>
            <Animated.Text
              style={[
                styles.fareAmount,
                { color: colors.text, transform: [{ scale: fareAnimation }] },
              ]}
            >
              Rs. {calculateFare()}
            </Animated.Text>
            {rideType === 'package' && (
              <View style={[styles.discountBadge, { backgroundColor: colors.successLight }]}>
                <Ionicons name="pricetag" size={12} color={colors.success} />
                <Text style={[styles.discountText, { color: colors.success }]}>15% Package Discount</Text>
              </View>
            )}
          </View>
          <View style={styles.fareRight}>
            <Text style={[styles.vehicleTypeLabel, { color: colors.textSecondary }]}>
              {selectedVehicleData.name}
            </Text>
            <View style={styles.fareDetails}>
              <Ionicons name="people-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.fareDetailText, { color: colors.textTertiary }]}>
                {reserveEntireVehicle ? 'Private' : `${selectedSeats} seat${selectedSeats > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.findButton, { backgroundColor: colors.primary }]}
          onPress={handleFindDrivers}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#000" />
          <Text style={styles.findButtonText}>Find Drivers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.h5,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },

  // Route styles
  routeContainer: {
    paddingLeft: spacing.xs,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.md,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.tiny,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  routeConnector: {
    marginLeft: 6,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  routeDash: {
    width: 2,
    height: 6,
  },

  // Ride type styles
  rideTypeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rideTypeOption: {
    flex: 1,
  },
  rideTypeInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    minHeight: 80,
  },
  rideTypeName: {
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Scheduled ride styles
  scheduledContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  dateTimeLabel: {
    fontSize: typography.caption,
  },
  dateTimeValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },

  // Package styles
  packageContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: spacing.md,
  },
  packageInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  packageInfoText: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '500',
  },
  packageDays: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  packageDaysText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },

  // Vehicle card styles
  vehicleList: {
    gap: spacing.sm,
  },
  vehicleCardWrapper: {
    marginBottom: spacing.sm,
  },
  vehicleCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  vehicleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  vehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleDesc: {
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  vehicleFeatures: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  vehicleFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleFeatureText: {
    fontSize: typography.caption,
  },
  liveBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  liveBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vehiclePriceContainer: {
    alignItems: 'flex-end',
  },
  vehiclePrice: {
    fontSize: typography.h5,
    fontWeight: '800',
  },
  vehicleOriginalPrice: {
    fontSize: typography.caption,
    textDecorationLine: 'line-through',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: borderRadius.md,
  },
  popularBadgeText: {
    fontSize: typography.tiny,
    fontWeight: '700',
    color: '#000',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Seat selector styles
  seatSelectorContainer: {
    gap: spacing.md,
  },
  seatSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  seatIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatLabel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  seatSubLabel: {
    fontSize: typography.caption,
  },
  seatCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  seatCounterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatCount: {
    fontSize: typography.h4,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  reserveAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reserveAllLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  reserveAllTitle: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  reserveAllDesc: {
    fontSize: typography.caption,
  },
  reserveAllBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  reserveAllBadgeText: {
    fontSize: typography.tiny,
    fontWeight: '600',
  },

  // Option toggle styles
  optionToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  optionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  optionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  optionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  optionBadgeText: {
    fontSize: typography.tiny,
    fontWeight: '600',
  },
  optionDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  fareLeft: {
    flex: 1,
  },
  fareLabel: {
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  fareAmount: {
    fontSize: typography.h2,
    fontWeight: '800',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: typography.tiny,
    fontWeight: '600',
  },
  fareRight: {
    alignItems: 'flex-end',
  },
  vehicleTypeLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fareDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fareDetailText: {
    fontSize: typography.caption,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  findButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#000',
  },

  // Dynamic seats info styles
  dynamicSeatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  dynamicSeatsText: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '500',
  },
});

export default RideOptionsScreen;
