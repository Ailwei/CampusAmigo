import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/color';
import { router } from "expo-router";
import { configureGoogle } from '@/utils/authGoogle';
import { bootstrapAuth } from "@/utils/token";

configureGoogle();

const { width } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(width * 0.72, 280);

const OrbitNode = ({ icon, style, delay, distance = 8 }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -distance,
          duration: 1600,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [translateY, delay, distance]);

  return (
    <Animated.View style={[styles.node, style, { transform: [{ translateY }] }]}>
      {icon}
    </Animated.View>
  );
};

export default function WelcomeScreen() {
  const coreFloat = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(coreFloat, {
          toValue: -7,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(coreFloat, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [coreFloat]);

  useEffect(() => {
    const checkAuth = async () => {
      const { loggedIn, user } = await bootstrapAuth();
      if (loggedIn) {
        if (user.onboardingCompleted) {
          router.replace("/screens/(tabs)/home");
        } else {
          router.replace("/screens/onBoarding/add-classes");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <LinearGradient colors={[COLORS.bgTop, COLORS.bgBottom]} style={styles.screen}>
      <View style={styles.logoRow}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} />
        <Text style={styles.logoWord}>
          <Text style={styles.logoWordBold}>Campus</Text>Amigo
        </Text>
      </View>

      <Text style={styles.headline}>
        Welcome to{'\n'}
        <Text style={styles.headlineAccent}>CampusAmigo!</Text>
      </Text>
      <Text style={styles.subtext}>Your all-in-one student organizer</Text>

      <Pressable
        onPress={() => router.push("/screens/get-started")}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <LinearGradient colors={[COLORS.orangeLight, COLORS.orange]} style={styles.cta}>
          <Text style={styles.ctaText}>Get Started</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.stage}>
        <View style={[styles.ring, { width: ORBIT_SIZE, height: ORBIT_SIZE, borderRadius: ORBIT_SIZE / 2 }]} />
        <View style={[
          styles.ring,
          {
            width: ORBIT_SIZE - 68,
            height: ORBIT_SIZE - 68,
            borderRadius: (ORBIT_SIZE - 68) / 2,
            borderColor: COLORS.ring2,
          },
        ]} />

        <Animated.View style={[styles.core, { transform: [{ translateY: coreFloat }] }]}>
          <LinearGradient colors={[COLORS.blueLight, COLORS.blue]} style={styles.coreGradient}>
            <Ionicons name="school-outline" size={44} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <OrbitNode icon={<Feather name="bell" size={50} color={COLORS.orange} />} style={{ top: 6, left: ORBIT_SIZE * 0.14 }} delay={0} />
        <OrbitNode icon={<Ionicons name="book-outline" size={50} color={COLORS.blue} />} style={{ top: ORBIT_SIZE * 0.38, left: -6 }} delay={300} distance={6} />
        <OrbitNode icon={<Feather name="check-square" size={50} color={COLORS.green} />} style={{ top: 10, right: ORBIT_SIZE * 0.06 }} delay={600} />
        <OrbitNode icon={<Ionicons name="calendar-outline" size={50} color={COLORS.orange} />} style={{ bottom: ORBIT_SIZE * 0.14, right: -8 }} delay={900} />
        <OrbitNode icon={<Feather name="target" size={50} color={COLORS.blue} />} style={{ bottom: 2, left: ORBIT_SIZE * 0.24 }} delay={1200} distance={6} />
      </View>

      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', paddingTop: 64, paddingHorizontal: 28, paddingBottom: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoImage: { width: 90, height: 90, resizeMode: 'contain'},
  logoWord: { fontSize: 19, fontWeight: '700', color: COLORS.blue, letterSpacing: -0.3 },
  logoWordBold: { color: COLORS.navy, fontWeight: '800' },
  headline: { marginTop: 34, fontSize: 32, fontWeight: '800', color: COLORS.navy, textAlign: 'center', lineHeight: 38 },
  headlineAccent: { color: COLORS.blue },
  subtext: { marginTop: 14, fontSize: 15, fontWeight: '500', color: COLORS.navySoft, textAlign: 'center' },
  cta: { marginTop: 26, paddingVertical: 15, paddingHorizontal: 46, borderRadius: 999, shadowColor: COLORS.orange, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  stage: { flex: 1, width: '100%', marginTop: 30, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 5.5, borderColor: COLORS.ring, borderStyle: 'dashed' },
  core: { width: 104, height: 104, borderRadius: 32, shadowColor: COLORS.blue, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  coreGradient: { flex: 1, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  node: { position: 'absolute', width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.navy, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(21,42,84,0.18)' },
  dotActive: { width: 20, borderRadius: 4, backgroundColor: COLORS.blue },
});
