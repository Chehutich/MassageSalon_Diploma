import React from "react";
import Svg, { Path } from "react-native-svg";
import { Palette } from "@/src/theme/tokens";

type Props = { size?: number };

export function LeafLogo({ size = 32 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M24 8C34 10,40 18,36 30C32 38,22 40,16 34C10 28,12 14,24 8Z"
        fill={Palette.sand}
        stroke={Palette.taupe}
        strokeWidth="1.3"
      />
      <Path
        d="M24 8C22 18,20 26,18 34"
        stroke={Palette.taupe}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      <Path
        d="M24 14C28 16,32 18,33 22"
        stroke={Palette.taupe}
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />
      <Path
        d="M18 34C17 37,18 40,20 42"
        stroke={Palette.taupe}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </Svg>
  );
}
