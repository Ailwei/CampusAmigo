import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import COLORS from "@/constants/color";
import {
  moderateScale,
  scaleSize,
  verticalScale,
} from "@/utils/responsive";

interface AddMenuBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  background: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuItem({
  icon,
  iconColor,
  background,
  title,
  subtitle,
  onPress,
}: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        pressed && styles.actionPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#B0B7C3"
      />
    </Pressable>
  );
}

export default function AddMenuBottomSheet({
  visible,
  onClose,
}: AddMenuBottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>
            Manage Timetable
          </Text>

          <Text style={styles.subtitle}>
            Add subjects, schedule classes and
            manage your timetable.
          </Text>

          <MenuItem
            icon="book-outline"
            iconColor={COLORS.blue}
            background={`${COLORS.blue}15`}
            title="Add Subject"
            subtitle="Create a new subject."
            onPress={() => {
              onClose();
              router.push(
                "/screens/timetable/add-subject"
              );
            }}
          />

          <MenuItem
            icon="calendar-outline"
            iconColor={COLORS.green}
            background={`${COLORS.green}15`}
            title="Add Class"
            subtitle="Schedule a lecture."
            onPress={() => {
              onClose();
              router.push(
                "/screens/timetable/add-timetable"
              );
            }}
          />
            <MenuItem
            icon="library-outline"
            iconColor={COLORS.orange}
            background={`${COLORS.orange}15`}
            title="Manage Class"
            subtitle="Edit or delete subjects."
            onPress={() => {
              onClose();
              router.push(
                "/screens/timetable/edit-Class"
              );
            }}
          />

          <MenuItem
            icon="library-outline"
            iconColor={COLORS.orange}
            background={`${COLORS.orange}15`}
            title="Manage Subjects"
            subtitle="Edit or delete subjects."
            onPress={() => {
              onClose();
              router.push(
                "/screens/timetable/manage-subjects"
              );
            }}
          />

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scaleSize(28),
    borderTopRightRadius: scaleSize(28),
    paddingHorizontal: scaleSize(22),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(30),
  },

  handle: {
    alignSelf: "center",
    width: scaleSize(52),
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D6D6D6",
    marginBottom: verticalScale(18),
  },

  title: {
    fontSize: moderateScale(23),
    fontWeight: "800",
    color: COLORS.navy,
  },

  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(22),
    color: "#6B7280",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: scaleSize(18),
    borderWidth: 1,
    borderColor: "#EEF2F7",
    padding: scaleSize(15),
    marginBottom: verticalScale(14),
  },

  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: scaleSize(54),
    height: scaleSize(54),
    borderRadius: scaleSize(16),
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginLeft: scaleSize(15),
  },

  actionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: COLORS.navy,
  },

  actionSubtitle: {
    marginTop: verticalScale(3),
    fontSize: moderateScale(13),
    color: "#6B7280",
  },

  cancelButton: {
    marginTop: verticalScale(8),
    paddingVertical: verticalScale(15),
    borderRadius: scaleSize(16),
    backgroundColor: "#EEF2F7",
    alignItems: "center",
  },

  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: COLORS.navy,
  },
});