import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH * 0.85;
const FRAME_HEIGHT = FRAME_WIDTH * 0.63; // ~credit card ratio
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

const DOC_CONFIG = {
  nic_front: { title: 'NIC Front', instruction: 'Place the front of your NIC card within the frame' },
  nic_back: { title: 'NIC Back', instruction: 'Flip your NIC and place the back within the frame' },
  license_front: { title: 'License Front', instruction: 'Place the front of your driving license' },
  license_back: { title: 'License Back', instruction: 'Place the back of your driving license' },
  vehicle_registration: { title: 'Registration', instruction: 'Place your vehicle registration document' },
  vehicle_front: { title: 'Front View', instruction: 'Take a photo of the front of your vehicle' },
  vehicle_back: { title: 'Back View', instruction: 'Take a photo of the back of your vehicle' },
  vehicle_interior: { title: 'Interior', instruction: 'Take a photo of the inside of your vehicle' },
  vehicle_with_plate: { title: 'Number Plate', instruction: 'Take a clear photo of your number plate' },
  selfie_with_nic: { title: 'Selfie with NIC', instruction: 'Hold your NIC next to your face' },
  live_selfie: { title: 'Live Selfie', instruction: 'Look straight at the camera' },
};

const CornerMarker = ({ position }) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');

  return (
    <View
      style={[
        styles.corner,
        {
          top: isTop ? -CORNER_THICKNESS / 2 : undefined,
          bottom: !isTop ? -CORNER_THICKNESS / 2 : undefined,
          left: isLeft ? -CORNER_THICKNESS / 2 : undefined,
          right: !isLeft ? -CORNER_THICKNESS / 2 : undefined,
          borderTopWidth: isTop ? CORNER_THICKNESS : 0,
          borderBottomWidth: !isTop ? CORNER_THICKNESS : 0,
          borderLeftWidth: isLeft ? CORNER_THICKNESS : 0,
          borderRightWidth: !isLeft ? CORNER_THICKNESS : 0,
        },
      ]}
    />
  );
};

const DocumentCaptureScreen = ({ navigation, route }) => {
  const { docType, cameraFacing: facingParam, onCapture } = route?.params || {};
  const config = DOC_CONFIG[docType] || { title: 'Document', instruction: 'Position the document within the frame' };
  const facing = facingParam || 'back';
  const isSelfie = docType === 'selfie_with_nic' || docType === 'live_selfie';

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturing, setCapturing] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.permTitle, { color: colors.text }]}>Camera Access Needed</Text>
        <Text style={[styles.permDesc, { color: colors.textSecondary }]}>
          We need camera access to capture your documents
        </Text>
        <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permBackBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.permBackText, { color: colors.textSecondary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedImage(photo);
    } catch (e) {
      console.log('Capture error:', e);
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isSelfie ? [3, 4] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0]);
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage && route?.params?.returnScreen) {
      // Pass image back via route params
      navigation.navigate({
        name: route.params.returnScreen,
        params: { capturedImage: capturedImage, docType },
        merge: true,
      });
    } else {
      navigation.goBack();
    }
  };

  // Preview mode
  if (capturedImage) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />

        {/* Top bar */}
        <View style={[styles.previewTopBar, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.previewTitle}>{config.title}</Text>
        </View>

        {/* Bottom actions */}
        <View style={[styles.previewBottomBar, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => setCapturedImage(null)}
          >
            <Ionicons name="refresh" size={22} color="#FFF" />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.usePhotoBtn, { backgroundColor: colors.primary }]}
            onPress={handleUsePhoto}
          >
            <Ionicons name="checkmark" size={22} color="#000" />
            <Text style={styles.usePhotoBtnText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera mode
  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top section */}
          <View style={[styles.overlayTop, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.overlayTitle}>{config.title}</Text>
              <Text style={styles.overlayInstruction}>{config.instruction}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Frame area */}
          {!isSelfie ? (
            <View style={styles.frameContainer}>
              <View style={styles.frame}>
                <CornerMarker position="top-left" />
                <CornerMarker position="top-right" />
                <CornerMarker position="bottom-left" />
                <CornerMarker position="bottom-right" />
              </View>
            </View>
          ) : (
            <View style={styles.faceFrameContainer}>
              <View style={styles.faceFrame} />
            </View>
          )}

          {/* Bottom controls */}
          <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={styles.galleryLink} onPress={handleGallery}>
              <Ionicons name="images-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.galleryLinkText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              activeOpacity={0.7}
              disabled={capturing}
            >
              <View style={styles.captureOuter}>
                {capturing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </View>
            </TouchableOpacity>

            <View style={{ width: 60 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  permDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 27,
  },
  permBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  permBackBtn: {
    marginTop: 16,
    padding: 12,
  },
  permBackText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Camera
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Top
  overlayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  overlayTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  overlayInstruction: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Document frame
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FCC014',
  },

  // Face frame (selfie)
  faceFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.325,
    borderWidth: 3,
    borderColor: '#FCC014',
    borderStyle: 'dashed',
  },

  // Bottom controls
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  galleryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  galleryLinkText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  captureButton: {
    alignItems: 'center',
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },

  // Preview
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  previewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingTop: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  usePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 27,
  },
  usePhotoBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentCaptureScreen;
