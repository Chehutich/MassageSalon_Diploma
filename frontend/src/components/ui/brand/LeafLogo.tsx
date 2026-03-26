import React from "react";
import Svg, { Path } from "react-native-svg";
import { Palette } from "@/src/theme/tokens";

type Props = { size?: number };

export const LeafLogo: React.FC<Props> = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M24 8C34 10,40 18,36 30C32 38,22 40,16 34C10 28,12 14,24 8Z"
      fill={Palette.sand}
      stroke={Palette.espresso}
      strokeWidth="1.3"
    />
    <Path
      d="M24 8C22 18,20 26,18 34"
      stroke={Palette.espresso}
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.6"
    />
    <Path
      d="M24 14C28 16,32 18,33 22"
      stroke={Palette.espresso}
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.4"
    />
    <Path
      d="M23 18C19 19,16 21,15 24"
      stroke={Palette.espresso}
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.4"
    />
    <Path
      d="M21 26C25 27,28 28,30 30"
      stroke={Palette.espresso}
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.4"
    />
    <Path
      d="M18 34C17 37,18 40,20 42"
      stroke={Palette.espresso}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
  </Svg>
);
