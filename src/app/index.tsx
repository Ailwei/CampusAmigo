import React from "react";
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "@/constants/color";
import { router } from "expo-router";
import { configureGoogle } from "@/utils/authGoogle";
import { scaleSize, verticalScale, moderateScale } from "@/utils/responsive";
import { useAuthBootstrap } from "@/utils/Useauthbootstrap";
import OrbitStage from "./Index/Orbitstatage";


configureGoogle();

export default function WelcomeScreen() {
  const { loading } = useAuthBootstrap();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
        Welcome to{"\n"}
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

      <OrbitStage />

      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(64),
    paddingHorizontal: scaleSize(28),
    paddingBottom: verticalScale(32),
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(0),
  },
  logoImage: {
    width: scaleSize(100),
    height: verticalScale(100),
    resizeMode: "contain",
  },
  logoWord: {
    fontSize: moderateScale(19),
    fontWeight: "700",
    color: COLORS.blue,
    letterSpacing: -0.3,
  },
  logoWordBold: {
    color: COLORS.navy,
    fontWeight: "800",
  },
  headline: {
    marginTop: verticalScale(34),
    fontSize: moderateScale(32),
    fontWeight: "800",
    color: COLORS.navy,
    textAlign: "center",
    lineHeight: verticalScale(38),
  },
  headlineAccent: {
    color: COLORS.blue,
  },
  subtext: {
    marginTop: verticalScale(14),
    fontSize: moderateScale(15),
    fontWeight: "500",
    color: COLORS.navySoft,
    textAlign: "center",
  },
  cta: {
    marginTop: verticalScale(26),
    paddingVertical: verticalScale(15),
    paddingHorizontal: scaleSize(46),
    borderRadius: 999,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(14),
    shadowOffset: { width: 0, height: verticalScale(8) },
    elevation: 6,
    zIndex: 10,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
  dots: {
    flexDirection: "row",
    gap: scaleSize(6),
    marginTop: verticalScale(20),
  },
  dot: {
    width: scaleSize(6),
    height: verticalScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "rgba(21,42,84,0.18)",
  },
  dotActive: {
    width: scaleSize(20),
    borderRadius: moderateScale(4),
    backgroundColor: COLORS.blue,
  },
});