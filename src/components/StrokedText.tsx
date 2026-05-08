import React from 'react';
import { View, Text, TextStyle, StyleProp } from 'react-native';

interface StrokedTextProps {
  children: React.ReactNode;
  strokeColor: string;
  strokeWidth: number;
  style?: StyleProp<TextStyle>;
}

import { StyleSheet } from 'react-native';

export default function StrokedText({ children, strokeColor, strokeWidth, style }: StrokedTextProps) {
  const flattenedStyle = StyleSheet.flatten(style) || {};

  const {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    margin,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    width,
    height,
    flex,
    ...textStyle
  } = flattenedStyle as any;

  const containerStyle = {
    marginTop, marginBottom, marginLeft, marginRight, margin,
    position, top, bottom, left, right, zIndex, width, height, flex,
    justifyContent: 'center', alignItems: 'center',
  } as any;

  const createShadow = (dx: number, dy: number): TextStyle => ({
    position: 'absolute',
    transform: [{ translateX: dx }, { translateY: dy }],
    color: strokeColor,
  });

  return (
    <View style={containerStyle}>
      <Text style={[textStyle, createShadow(strokeWidth, 0)]}>{children}</Text>
      <Text style={[textStyle, createShadow(-strokeWidth, 0)]}>{children}</Text>
      <Text style={[textStyle, createShadow(0, strokeWidth)]}>{children}</Text>
      <Text style={[textStyle, createShadow(0, -strokeWidth)]}>{children}</Text>
      <Text style={[textStyle, createShadow(strokeWidth, strokeWidth)]}>{children}</Text>
      <Text style={[textStyle, createShadow(-strokeWidth, -strokeWidth)]}>{children}</Text>
      <Text style={[textStyle, createShadow(strokeWidth, -strokeWidth)]}>{children}</Text>
      <Text style={[textStyle, createShadow(-strokeWidth, strokeWidth)]}>{children}</Text>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}
