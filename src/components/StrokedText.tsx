import React from 'react';
import { View, Text, TextStyle, StyleProp } from 'react-native';

interface StrokedTextProps {
  children: React.ReactNode;
  strokeColor: string;
  strokeWidth: number;
  style?: StyleProp<TextStyle>;
}

export default function StrokedText({ children, strokeColor, strokeWidth, style }: StrokedTextProps) {
  const shadowStyle = (dx: number, dy: number): TextStyle => ({
    position: 'absolute',
    top: dy,
    left: dx,
    color: strokeColor,
  });

  const offsets = [
    { dx: strokeWidth, dy: 0 },
    { dx: -strokeWidth, dy: 0 },
    { dx: 0, dy: strokeWidth },
    { dx: 0, dy: -strokeWidth },
    { dx: strokeWidth, dy: strokeWidth },
    { dx: -strokeWidth, dy: -strokeWidth },
    { dx: strokeWidth, dy: -strokeWidth },
    { dx: -strokeWidth, dy: strokeWidth },
  ];

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      {offsets.map((offset, index) => (
        <Text key={index} style={[style, shadowStyle(offset.dx, offset.dy)]}>
          {children}
        </Text>
      ))}
      <Text style={style}>{children}</Text>
    </View>
  );
}
