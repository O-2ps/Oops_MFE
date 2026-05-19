import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Line } from 'react-native-svg';
import StrokedText from './StrokedText';
import { COLORS, FONTS } from '../constants/theme';

interface FaceGuideProps {
  width: number;
  height: number;
}

export default function FaceGuide({ width: w, height: h }: FaceGuideProps) {
  const cx = w / 2;
  const cy = h * 0.42;
  const rx = w * 0.30;
  const ry = h * 0.34;

  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        {/* 얼굴 윤곽 */}
        <Ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke={COLORS.PRIMARY}
          strokeWidth={2.5}
          strokeDasharray="10,5"
          fill="rgba(255,140,182,0.06)"
        />
        {/* 왼쪽 눈 */}
        <Ellipse
          cx={cx - rx * 0.40}
          cy={cy - ry * 0.22}
          rx={rx * 0.17}
          ry={ry * 0.09}
          stroke={COLORS.PRIMARY}
          strokeWidth={1.5}
          fill="none"
          opacity={0.55}
        />
        {/* 오른쪽 눈 */}
        <Ellipse
          cx={cx + rx * 0.40}
          cy={cy - ry * 0.22}
          rx={rx * 0.17}
          ry={ry * 0.09}
          stroke={COLORS.PRIMARY}
          strokeWidth={1.5}
          fill="none"
          opacity={0.55}
        />
        {/* 코 중심선 */}
        <Line
          x1={cx}
          y1={cy - ry * 0.65}
          x2={cx}
          y2={cy + ry * 0.65}
          stroke={COLORS.PRIMARY}
          strokeWidth={1}
          strokeDasharray="5,5"
          opacity={0.25}
        />
      </Svg>

      <View style={{ position: 'absolute', bottom: h * 0.09, width: '100%', alignItems: 'center' }}>
        <StrokedText
          strokeColor="#fafafa"
          strokeWidth={1}
          style={{ fontSize: 12, color: COLORS.PRIMARY, fontFamily: FONTS.PIXEL, opacity: 0.85 }}
        >
          얼굴을 타원에 맞춰주세요
        </StrokedText>
      </View>
    </View>
  );
}
