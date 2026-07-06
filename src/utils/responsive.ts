import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const baseWidth = 375;
const baseHeight = 812;

export const scaleSize = (size: number, width = screenWidth) => (width / baseWidth) * size;
export const verticalScale = (size: number, height = screenHeight) => (height / baseHeight) * size;
export const moderateScale = (size: number, factor = 0.5, width = screenWidth) =>
  size + (scaleSize(size, width) - size) * factor;
