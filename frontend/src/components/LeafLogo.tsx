import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { Palette } from "../theme/tokens";

export const LeafLogo = () => (
  <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <Circle
      cx="24"
      cy="24"
      r="23"
      stroke={Palette.taupe}
      strokeWidth="1"
      opacity="0.3"
    />
    <Path
      d="M24 8 C34 10, 40 18, 36 30 C32 38, 22 40, 16 34 C10 28, 12 14, 24 8Z"
      fill={Palette.sand}
      stroke={Palette.taupe}
      strokeWidth="1.2"
    />
    <Path
      d="M24 8 C22 18, 20 26, 18 34"
      stroke={Palette.taupe}
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.6"
    />
    <Path
      d="M24 14 C28 16, 32 18, 33 22"
      stroke={Palette.taupe}
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.45"
    />
    <Path
      d="M23 20 C27 22, 30 24, 30 28"
      stroke={Palette.taupe}
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.35"
    />
    <Path
      d="M21 26 C23 27, 24 30, 22 32"
      stroke={Palette.taupe}
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.3"
    />
    <Path
      d="M18 34 C17 37, 18 40, 20 42"
      stroke={Palette.taupe}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
  </Svg>
);
