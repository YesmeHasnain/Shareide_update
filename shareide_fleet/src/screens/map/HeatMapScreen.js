import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/colors';
import apiClient from '../../api/client';

const HeatMapScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [location, setLocation] = useState({ latitude: 31.5204, longitude: 74.3587 });

  useEffect(() => {
    getLocation();
    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc.coords);
      }
    } catch (e) { /* silent */ }
  };

  const fetchHeatmap = async () => {
    try {
      const res = await apiClient.get('/drivers/heatmap');
      if (res.data?.success) {
        setZones(res.data.data || []);
        if (webViewRef.current && res.data.data?.length > 0) {
          webViewRef.current.injectJavaScript(
            `if(typeof updateZones==='function'){updateZones(${JSON.stringify(res.data.data)});}true;`
          );
        }
      }
    } catch (e) { /* silent */ }
  };

  const getMapHtml = () => {
    const lat = location.latitude;
    const lng = location.longitude;
    const zonesJson = JSON.stringify(zones);

    return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${lat},${lng}],13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

// Driver location
var driverIcon=L.divIcon({
  html:'<div style="width:16px;height:16px;background:#FCC014;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(252,192,20,0.5)"></div>',
  className:'',iconSize:[16,16],iconAnchor:[8,8]
});
L.marker([${lat},${lng}],{icon:driverIcon}).addTo(map);

var circles=[];
function getColor(demand){
  if(demand>=10) return '#EF4444';
  if(demand>=5) return '#F59E0B';
  if(demand>=3) return '#FCC014';
  return '#10B981';
}
function getRadius(demand){return Math.min(2000,300+demand*150)}

function updateZones(data){
  circles.forEach(function(c){map.removeLayer(c)});
  circles=[];
  data.forEach(function(z){
    var c=L.circle([z.zone_lat,z.zone_lng],{
      radius:getRadius(z.demand),
      color:getColor(z.demand),
      fillColor:getColor(z.demand),
      fillOpacity:0.3,
      weight:2,
      opacity:0.6
    }).addTo(map);
    c.bindPopup('<b>'+z.demand+' requests</b><br>in this area');
    circles.push(c);
  });
}

var initialZones=${zonesJson};
if(initialZones.length>0) updateZones(initialZones);
</script></body></html>`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        ref={webViewRef}
        source={{ html: getMapHtml() }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.titleBadge, { backgroundColor: colors.card }]}>
          <Ionicons name="flame" size={18} color="#EF4444" />
          <Text style={[styles.titleText, { color: colors.text }]}>Demand Heatmap</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.card }]}
          onPress={fetchHeatmap}
        >
          <Ionicons name="refresh" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card, bottom: insets.bottom + 16 }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Demand Level</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FCC014' }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Minimal</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  titleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  titleText: { fontSize: 15, fontWeight: '700' },
  refreshBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  legend: {
    position: 'absolute', left: 16, right: 16,
    padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  legendTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 12, fontWeight: '500' },
});

export default HeatMapScreen;
