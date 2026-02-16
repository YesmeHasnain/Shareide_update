import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Avatar } from '../../components/common';
import { spacing, borderRadius, typography } from '../../theme/colors';
import { pusherService } from '../../utils/pusherService';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', surface: '#FFFFFF',
  text: '#1A1A2E', textSecondary: '#6B7280', textTertiary: '#9CA3AF',
  border: '#E5E7EB', success: '#10B981', error: '#EF4444',
  info: '#3B82F6', star: '#FFD700', card: '#FFFFFF',
};

const RideTrackingScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { ride, driver, pickup, dropoff, fare } = params;

  const [status, setStatus] = useState(ride?.status || 'arriving');
  const [eta, setEta] = useState(driver?.eta || 5);
  const [driverLocation, setDriverLocation] = useState({
    latitude: driver?.latitude || pickup?.latitude || 31.5204,
    longitude: driver?.longitude || pickup?.longitude || 74.3587,
  });
  const [userLocation, setUserLocation] = useState({
    latitude: pickup?.latitude || 31.5204,
    longitude: pickup?.longitude || 74.3587,
  });
  const [showCancelReasons, setShowCancelReasons] = useState(false);
  const [stops, setStops] = useState(ride?.stops || []);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);

  // Animate bottom sheet in
  useEffect(() => {
    Animated.spring(bottomSheetAnim, {
      toValue: 1, friction: 8, tension: 40, useNativeDriver: true,
    }).start();
  }, []);

  // Pulse animation for status dot
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Get user current location
  useEffect(() => {
    (async () => {
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (e) { /* silent */ }
    })();
  }, []);

  // Fetch multi-stops if ride has them
  useEffect(() => {
    if (!ride?.id) return;
    (async () => {
      try {
        const response = await ridesAPI.getRideStops(ride.id);
        if (response.data && Array.isArray(response.data)) {
          setStops(response.data);
        }
      } catch (e) { /* no stops */ }
    })();
  }, [ride?.id]);

  // Real-time Pusher subscription for ride updates
  useEffect(() => {
    let rideChannel = null;
    const setupRealTime = async () => {
      if (!ride?.id) return;
      try {
        rideChannel = await pusherService.subscribe(`ride.${ride.id}`);
        if (rideChannel) {
          rideChannel.bind('ride.status.changed', (data) => {
            if (data.status) {
              setStatus(data.status);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (data.status === 'completed') {
                setTimeout(() => handleCompleteRide(), 1500);
              }
              if (data.eta) setEta(data.eta);
            }
          });
          rideChannel.bind('driver.location.updated', (data) => {
            if (data.lat && data.lng) {
              setDriverLocation({ latitude: parseFloat(data.lat), longitude: parseFloat(data.lng) });
              if (data.eta) setEta(data.eta);
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(
                  `if(typeof updateDriverLocation==='function'){updateDriverLocation(${data.lat},${data.lng});}true;`
                );
              }
            }
          });
        }
      } catch (error) {
        console.log('Real-time setup failed:', error.message);
      }
    };
    setupRealTime();
    return () => {
      if (rideChannel) rideChannel.unbind_all();
      if (ride?.id) pusherService.unsubscribe(`ride.${ride.id}`);
    };
  }, [ride?.id]);

  // Fallback polling for driver location every 10s
  useEffect(() => {
    if (!ride?.id || status === 'completed' || status === 'cancelled') return;
    const interval = setInterval(async () => {
      try {
        const response = await ridesAPI.getDriverLocation(ride.id);
        if (response.success && response.data) {
          const { latitude, longitude, eta: newEta } = response.data;
          if (latitude && longitude) {
            setDriverLocation({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
            if (newEta) setEta(newEta);
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(
                `if(typeof updateDriverLocation==='function'){updateDriverLocation(${latitude},${longitude});}true;`
              );
            }
          }
        }
      } catch (e) { /* silent */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [ride?.id, status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'arriving': case 'driver_assigned': case 'accepted':
        return { color: colors.primary, title: 'Driver is on the way', subtitle: `Arriving in ~${eta} min` };
      case 'arrived':
        return { color: colors.success, title: 'Driver has arrived', subtitle: 'Your driver is waiting at pickup' };
      case 'started':
        return { color: colors.info, title: 'Ride in progress', subtitle: 'Heading to your destination' };
      case 'completed':
        return { color: colors.success, title: 'Ride completed!', subtitle: 'Thank you for riding with Shareide' };
      case 'cancelled':
        return { color: colors.error, title: 'Ride cancelled', subtitle: 'This ride has been cancelled' };
      default:
        return { color: colors.primary, title: 'Processing...', subtitle: 'Please wait' };
    }
  };
  const statusConfig = getStatusConfig();

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phone = driver?.phone || ride?.driver?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert('Error', 'Driver phone number not available');
  };

  const handleChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (ride?.id) navigation.navigate('RideChat', { rideId: ride.id, driverName: driver?.name });
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      let shareUrl = '';
      try {
        const res = await ridesAPI.shareTrip(ride.id);
        if (res.data?.share_url) shareUrl = `\nTrack live: ${res.data.share_url}`;
      } catch (e) { /* continue without link */ }
      await Share.share({
        message: `I'm on a Shareide ride!\nDriver: ${driver?.name || 'N/A'}\nVehicle: ${driver?.vehicle?.model || 'N/A'} - ${driver?.vehicle?.plate || 'N/A'}\nFrom: ${pickup?.address || 'Pickup'}\nTo: ${dropoff?.address || 'Dropoff'}\nETA: ~${eta} min${shareUrl}`,
      });
    } catch (e) { /* cancelled */ }
  };

  const handleSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Emergency SOS',
      'This will alert your emergency contacts and authorities with your live location.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SOS', style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            try {
              const apiClient = (await import('../../api/client')).default;
              await apiClient.post('/emergency/sos', {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                type: 'emergency',
                ride_id: ride?.id,
              });
            } catch (e) { /* continue */ }
            Alert.alert('SOS Sent', 'Emergency contacts and admin have been notified with your location.');
          },
        },
      ]
    );
  };

  const cancelReasons = [
    'Driver is taking too long',
    'Changed my plans',
    'Found another ride',
    'Booked by mistake',
    'Other',
  ];

  const handleCancel = (reason) => {
    Alert.alert('Cancel Ride', 'A cancellation fee may apply. Proceed?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try { await ridesAPI.cancelRide(ride.id, reason); } catch (e) { /* continue */ }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setShowCancelReasons(false);
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        },
      },
    ]);
  };

  const handleCompleteRide = () => {
    navigation.navigate('RideReceipt', { ride, driver, fare, pickup, dropoff });
  };

  // Live map HTML with driver, pickup, dropoff, and multi-stop markers
  const getMapHtml = () => {
    const dLat = driverLocation.latitude;
    const dLng = driverLocation.longitude;
    const pLat = pickup?.latitude || userLocation.latitude;
    const pLng = pickup?.longitude || userLocation.longitude;
    const doLat = dropoff?.latitude || pLat + 0.01;
    const doLng = dropoff?.longitude || pLng + 0.01;

    // Build waypoints for OSRM routing
    const waypoints = [[pLng, pLat]];
    const stopMarkers = stops.map((s, i) => {
      waypoints.push([parseFloat(s.lng), parseFloat(s.lat)]);
      return `var stopIcon${i}=L.divIcon({html:'<div class="stop-marker">${i+1}</div>',className:'',iconSize:[22,22],iconAnchor:[11,11]});L.marker([${s.lat},${s.lng}],{icon:stopIcon${i}}).addTo(map);`;
    }).join('\n');
    waypoints.push([doLng, doLat]);
    const osrmCoords = waypoints.map(w => `${w[0]},${w[1]}`).join(';');

    return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0}html,body,#map{width:100%;height:100%}
.driver-marker{width:48px;height:48px;background:linear-gradient(135deg,#FCC014,#FF9500);border-radius:50%;border:3px solid #fff;box-shadow:0 4px 15px rgba(252,192,20,0.5);display:flex;align-items:center;justify-content:center}
.driver-marker::after{content:'';width:22px;height:22px;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>') center/contain no-repeat}
.pulse-ring{position:absolute;width:70px;height:70px;top:-11px;left:-11px;border-radius:50%;border:2px solid rgba(252,192,20,0.3);animation:pulseRing 2s ease-out infinite}
.pulse-fill{position:absolute;width:70px;height:70px;top:-11px;left:-11px;background:rgba(252,192,20,0.12);border-radius:50%;animation:pulseFill 2s ease-out infinite}
@keyframes pulseRing{0%{transform:scale(0.5);opacity:1}100%{transform:scale(1.6);opacity:0}}
@keyframes pulseFill{0%{transform:scale(0.5);opacity:0.3}100%{transform:scale(1.4);opacity:0}}
.pickup-marker{width:14px;height:14px;background:#10B981;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(16,185,129,0.4)}
.dropoff-marker{width:14px;height:14px;background:#EF4444;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(239,68,68,0.4)}
.stop-marker{width:22px;height:22px;background:#F59E0B;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(245,158,11,0.4);color:#000;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:22px;text-align:center}
</style></head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
var driverIcon=L.divIcon({html:'<div style="position:relative"><div class="pulse-fill"></div><div class="pulse-ring"></div><div class="driver-marker"></div></div>',className:'',iconSize:[48,48],iconAnchor:[24,24]});
var driverMarker=L.marker([${dLat},${dLng}],{icon:driverIcon}).addTo(map);
var pickupIcon=L.divIcon({html:'<div class="pickup-marker"></div>',className:'',iconSize:[14,14],iconAnchor:[7,7]});
L.marker([${pLat},${pLng}],{icon:pickupIcon}).addTo(map);
var dropoffIcon=L.divIcon({html:'<div class="dropoff-marker"></div>',className:'',iconSize:[14,14],iconAnchor:[7,7]});
L.marker([${doLat},${doLng}],{icon:dropoffIcon}).addTo(map);
${stopMarkers}
var routeLine=L.polyline([[${pLat},${pLng}],[${doLat},${doLng}]],{color:'#3B82F6',weight:5,opacity:0.8}).addTo(map);
map.fitBounds([[${dLat},${dLng}],[${pLat},${pLng}],[${doLat},${doLng}]],{padding:[50,50]});
fetch('https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson')
.then(function(r){return r.json()})
.then(function(data){
  if(data.routes&&data.routes[0]){
    var coords=data.routes[0].geometry.coordinates.map(function(c){return[c[1],c[0]]});
    map.removeLayer(routeLine);
    routeLine=L.polyline(coords,{color:'#3B82F6',weight:5,opacity:0.85,lineCap:'round',lineJoin:'round'}).addTo(map);
    var allPts=coords.concat([[${dLat},${dLng}]]);
    map.fitBounds(allPts,{padding:[50,50]});
  }
}).catch(function(){});
function updateDriverLocation(lat,lng){driverMarker.setLatLng([lat,lng]);if(!map.getBounds().contains([lat,lng])){map.panTo([lat,lng],{animate:true,duration:1})}}
</script></body></html>`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: getMapHtml() }}
          style={styles.map}
          scrollEnabled={false}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />

        {/* Back Button */}
        <TouchableOpacity style={[styles.backButton, { top: insets.top + 10, backgroundColor: colors.card || '#FFF' }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* SOS Button */}
        <TouchableOpacity style={[styles.sosFloating, { top: insets.top + 10 }]} onPress={handleSOS}>
          <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.sosGradient}>
            <Ionicons name="warning" size={18} color="#FFF" />
            <Text style={styles.sosFloatingText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ETA Badge */}
        {status !== 'completed' && status !== 'cancelled' && (
          <View style={[styles.etaOverlay, { top: insets.top + 10 }]}>
            <LinearGradient colors={['#1A1A2E', '#2D2D44']} style={styles.etaGradient}>
              <Text style={styles.etaOverlayValue}>{eta}</Text>
              <Text style={styles.etaOverlayLabel}>min</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[
        styles.bottomSheet,
        { backgroundColor: colors.card, paddingBottom: insets.bottom + 16,
          transform: [{ translateY: bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }],
        },
      ]}>
        {/* Status */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.color + '12' }]}>
          <Animated.View style={[styles.statusDot, { backgroundColor: statusConfig.color, transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>{statusConfig.title}</Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>{statusConfig.subtitle}</Text>
          </View>
          {status !== 'completed' && status !== 'cancelled' && (
            <View style={[styles.etaBadge, { backgroundColor: statusConfig.color }]}>
              <Text style={styles.etaBadgeText}>{eta} min</Text>
            </View>
          )}
        </View>

        {/* Driver Info */}
        <View style={styles.driverRow}>
          <Avatar source={driver?.avatar} name={driver?.name} size="large" showBadge badgeType="verified" />
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>{driver?.name || 'Driver'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}> {driver?.rating || '4.8'}</Text>
              <Text style={[styles.ridesCount, { color: colors.textTertiary }]}> · {driver?.total_rides || 0} rides</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.vehicleText, { color: colors.textSecondary }]}> {driver?.vehicle?.model || 'Vehicle'} · {driver?.vehicle?.plate || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.fareBox}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Fare</Text>
            <Text style={[styles.fareAmount, { color: colors.primary }]}>Rs. {fare || ride?.estimated_price || '0'}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + '12' }]} onPress={handleCall}>
            <Ionicons name="call" size={20} color={colors.success} />
            <Text style={[styles.actionLabel, { color: colors.success }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.info + '12' }]} onPress={handleChat}>
            <Ionicons name="chatbubble" size={20} color={colors.info} />
            <Text style={[styles.actionLabel, { color: colors.info }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + '12' }]} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.primary }]}>Share</Text>
          </TouchableOpacity>
          {status !== 'completed' && status !== 'cancelled' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error + '12' }]} onPress={() => setShowCancelReasons(true)}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
              <Text style={[styles.actionLabel, { color: colors.error }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Route */}
        <View style={[styles.routeCard, { backgroundColor: colors.background }]}>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{pickup?.address || 'Pickup'}</Text>
          </View>
          {stops.map((stop, i) => (
            <React.Fragment key={stop.id || i}>
              <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
                  Stop {i + 1}: {stop.address || 'Stop'}
                </Text>
              </View>
            </React.Fragment>
          ))}
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{dropoff?.address || 'Dropoff'}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Cancel Reasons */}
      {showCancelReasons && (
        <View style={styles.cancelOverlay}>
          <TouchableOpacity style={styles.cancelBackdrop} onPress={() => setShowCancelReasons(false)} />
          <View style={[styles.cancelSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.cancelHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.cancelTitle, { color: colors.text }]}>Why are you cancelling?</Text>
            {cancelReasons.map((reason, i) => (
              <TouchableOpacity key={i} style={[styles.cancelReasonBtn, { borderColor: colors.border }]} onPress={() => handleCancel(reason)}>
                <Text style={[styles.cancelReasonText, { color: colors.text }]}>{reason}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  backButton: {
    position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  sosFloating: {
    position: 'absolute', right: 16, borderRadius: 22, overflow: 'hidden',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sosGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  sosFloatingText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  etaOverlay: {
    position: 'absolute', alignSelf: 'center', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  etaGradient: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  etaOverlayValue: { color: '#FCC014', fontSize: 22, fontWeight: '800' },
  etaOverlayLabel: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  bottomSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 12,
  },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  statusSubtitle: { fontSize: 12 },
  etaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  etaBadgeText: { color: '#000', fontSize: 12, fontWeight: '700' },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  ratingText: { fontSize: 13, fontWeight: '600' },
  ridesCount: { fontSize: 12 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleText: { fontSize: 12 },
  fareBox: { alignItems: 'flex-end' },
  fareLabel: { fontSize: 11, marginBottom: 2 },
  fareAmount: { fontSize: 18, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, gap: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600' },
  routeCard: { padding: 14, borderRadius: 14 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  routeLine: { width: 2, height: 16, marginLeft: 4, marginVertical: 4 },
  routeText: { flex: 1, fontSize: 13 },
  cancelOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  cancelBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  cancelSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  cancelHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  cancelTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  cancelReasonBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  cancelReasonText: { fontSize: 15 },
});

export default RideTrackingScreen;
