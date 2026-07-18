import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";

interface AddButtonProps {
  onPress: () => void;
}

export const AddButton: React.FC<AddButtonProps> = ({ onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name="add"
        size={moderateScale(30)}
        color="#fff"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: verticalScale(24),
    right: scaleSize(20),

    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),

    backgroundColor: COLORS.blue,

    justifyContent: "center",
    alignItems: "center",

    elevation: 6,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});