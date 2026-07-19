import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/color";
import { scaleSize, verticalScale, moderateScale } from "@/utils/responsive";

const { width } = Dimensions.get("window");
const ORBIT_SIZE = Math.min(width * 0.72, 280);

interface OrbitNodeProps {
  icon: React.ReactNode;
  style: object;
  delay: number;
  distance?: number;
}

function OrbitNode({ icon, style, delay, distance = 8 }: OrbitNodeProps) {
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
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateY, delay, distance]);

  return (
    <Animated.View style={[styles.node, style, { transform: [{ translateY }] }]}>
      {icon}
    </Animated.View>
  );
}

export default function OrbitStage() {
  const coreFloat = useRef(new Animated.Value(0)).current;

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
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [coreFloat]);

  return (
    <View style={styles.stage}>
      <View style={[styles.ring, { width: ORBIT_SIZE, height: ORBIT_SIZE, borderRadius: ORBIT_SIZE / 2 }]} />
      <View
        style={[
          styles.ring,
          {
            width: ORBIT_SIZE - 68,
            height: ORBIT_SIZE - 68,
            borderRadius: (ORBIT_SIZE - 68) / 2,
            borderColor: COLORS.ring2,
          },
        ]}
      />

      <Animated.View style={[styles.core, { transform: [{ translateY: coreFloat }] }]}>
        <LinearGradient colors={[COLORS.blueLight, COLORS.blue]} style={styles.coreGradient}>
          <Ionicons name="school-outline" size={moderateScale(44)} color="#fff" />
        </LinearGradient>
      </Animated.View>

      <OrbitNode
        icon={<Feather name="bell" size={moderateScale(50)} color={COLORS.orange} />}
        style={{ top: verticalScale(10), left: scaleSize(ORBIT_SIZE * 0.18) }}
        delay={0}
      />

      <OrbitNode
        icon={<Ionicons name="book-outline" size={moderateScale(50)} color={COLORS.blue} />}
        style={{ top: verticalScale(ORBIT_SIZE * 0.44), left: -scaleSize(12) }}
        delay={300}
        distance={verticalScale(6)}
      />

      <OrbitNode
        icon={<Feather name="check-square" size={moderateScale(50)} color={COLORS.green} />}
        style={{ top: verticalScale(12), right: scaleSize(ORBIT_SIZE * 0.08) }}
        delay={600}
      />

      <OrbitNode
        icon={<Ionicons name="calendar-outline" size={moderateScale(50)} color={COLORS.orange} />}
        style={{ bottom: verticalScale(ORBIT_SIZE * 0.16), right: -scaleSize(10) }}
        delay={900}
      />

      <OrbitNode
        icon={<Feather name="target" size={moderateScale(50)} color={COLORS.blue} />}
        style={{ bottom: verticalScale(4), left: scaleSize(ORBIT_SIZE * 0.26) }}
        delay={1200}
        distance={verticalScale(6)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: "100%",
    marginTop: verticalScale(30),
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  ring: {
    position: "absolute",
    borderWidth: scaleSize(5.5),
    borderColor: COLORS.ring,
    borderStyle: "dashed",
  },
  core: {
    width: scaleSize(104),
    height: verticalScale(104),
    borderRadius: moderateScale(32),
    shadowColor: COLORS.blue,
    shadowOpacity: 0.45,
    shadowRadius: moderateScale(18),
    shadowOffset: { width: 0, height: verticalScale(10) },
    elevation: 8,
  },
  coreGradient: {
    flex: 1,
    borderRadius: moderateScale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  node: {
    position: "absolute",
    width: scaleSize(56),
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.18,
    shadowRadius: moderateScale(10),
    shadowOffset: { width: 0, height: verticalScale(6) },
    elevation: 5,
    pointerEvents: "none",
  },
});