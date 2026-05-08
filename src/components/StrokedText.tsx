import React from 'react';
import { View, Text, TextStyle, StyleProp } from 'react-native';

interface StrokedTextProps {
  children: React.ReactNode;
  strokeColor: string;
  strokeWidth: number;
  style?: StyleProp<TextStyle>;
}

export default function StrokedText({ children, strokeColor, strokeWidth, style }: StrokedTextProps) {
  const createShadow = (dx: number, dy: number): TextStyle => ({
    position: 'absolute',
    top: dy,
    left: dx,
    color: strokeColor,
  });

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[style, createShadow(strokeWidth, 0)]}>{children}</Text>
      <Text style={[style, createShadow(-strokeWidth, 0)]}>{children}</Text>
      <Text style={[style, createShadow(0, strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(0, -strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(strokeWidth, strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(-strokeWidth, -strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(strokeWidth, -strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(-strokeWidth, strokeWidth)]}>{children}</Text>
      <Text style={style}>{children}</Text>
    </View>
  );
}
