import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || {
    primary: '#FFD700',
    background: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
  };

  // Using React Native's Animated API instead of Reanimated
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.8)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.8)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Logo rotate
    Animated.sequence([
      Animated.timing(logoRotate, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(logoRotate, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Ring 1 animation
    const ring1Animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 1.8,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ring1Opacity, {
              toValue: 0.6,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(ring1Opacity, {
              toValue: 0,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(ring1Scale, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Ring 2 animation (delayed)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring2Scale, {
              toValue: 1.8,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(ring2Opacity, {
                toValue: 0.6,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(ring2Opacity, {
                toValue: 0,
                duration: 1400,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(ring2Scale, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 500);

    ring1Animation.start();

    // Title animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Tagline animation
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Progress animation
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Navigate
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#000000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background circles */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.decorCircle, styles.decorCircle1, { borderColor: colors.primary + '10' }]} />
        <View style={[styles.decorCircle, styles.decorCircle2, { borderColor: colors.primary + '08' }]} />
        <View style={[styles.decorCircle, styles.decorCircle3, { borderColor: colors.primary + '05' }]} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          {/* Animated rings */}
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: colors.primary,
                transform: [{ scale: ring1Scale }],
                opacity: ring1Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: colors.primary,
                transform: [{ scale: ring2Scale }],
                opacity: ring2Opacity,
              },
            ]}
          />

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoInner}>
                <Text style={styles.logoIcon}>S</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>SHARE</Text>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.titleGradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.titleGradient}>IDE</Text>
          </LinearGradient>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Ride Together, Save Together
        </Animated.Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: '#333' }]}>
            <Animated.View style={[styles.progressBar, { width: progressInterpolate }]}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Pakistan's Ride-Sharing Platform</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 1000,
  },
  decorCircle1: {
    width: width * 1.5,
    height: width * 1.5,
  },
  decorCircle2: {
    width: width * 2,
    height: width * 2,
  },
  decorCircle3: {
    width: width * 2.5,
    height: width * 2.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  logoInner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFD700',
    fontStyle: 'italic',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  titleGradientContainer: {
    paddingHorizontal: 2,
  },
  titleGradient: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    letterSpacing: 2,
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: '#555',
    letterSpacing: 1,
  },
});

export default SplashScreen;
