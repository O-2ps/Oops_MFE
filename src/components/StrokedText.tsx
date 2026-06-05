import React from 'react';
import { View, Text, TextStyle, ViewStyle, StyleProp, StyleSheet } from 'react-native';

interface StrokedTextProps {
  children: React.ReactNode;
  strokeColor: string;
  strokeWidth: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

// Text 전용 속성 키 목록 — View에 전달하면 안 되는 속성들
const TEXT_ONLY_PROPS: (keyof TextStyle)[] = [
  'color', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight',
  'letterSpacing', 'lineHeight', 'textAlign', 'textDecorationLine',
  'textDecorationStyle', 'textDecorationColor', 'textShadowColor',
  'textShadowOffset', 'textShadowRadius', 'textTransform',
  'includeFontPadding', 'writingDirection',
];

function splitStyle(flatStyle: Record<string, any>): { viewStyle: ViewStyle; textStyle: TextStyle } {
  const viewStyle: Record<string, any> = {};
  const textStyle: Record<string, any> = {};
  for (const key of Object.keys(flatStyle)) {
    if (TEXT_ONLY_PROPS.includes(key as keyof TextStyle)) {
      textStyle[key] = flatStyle[key];
    } else {
      viewStyle[key] = flatStyle[key];
      textStyle[key] = flatStyle[key]; // 공통 속성(margin, padding 등)은 둘 다 허용
    }
  }
  return { viewStyle, textStyle };
}

export default function StrokedText({ children, strokeColor, strokeWidth, style, numberOfLines }: StrokedTextProps) {
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const { viewStyle, textStyle } = splitStyle(flattenedStyle);

  const offsets = [];
  const points = 12;
  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    offsets.push({
      dx: Math.cos(angle) * strokeWidth,
      dy: Math.sin(angle) * strokeWidth,
    });
  }

  return (
    <View style={viewStyle}>
      <View>
        <Text
          style={[textStyle, { opacity: 0 }]}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {children}
        </Text>

        {offsets.map((offset, index) => (
          <Text
            key={index}
            style={[
              textStyle,
              {
                position: 'absolute',
                top: offset.dy,
                left: offset.dx,
                color: strokeColor,
                zIndex: 1,
              },
            ]}
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
          >
            {children}
          </Text>
        ))}

        <Text
          style={[textStyle, { position: 'absolute', top: 0, left: 0, zIndex: 2 }]}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {children}
        </Text>
      </View>
    </View>
  );
}
