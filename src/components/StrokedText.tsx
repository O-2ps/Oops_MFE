import React from 'react';
import { View, Text, TextStyle, StyleProp, StyleSheet } from 'react-native';

interface StrokedTextProps {
  children: React.ReactNode;
  strokeColor: string;
  strokeWidth: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export default function StrokedText({ children, strokeColor, strokeWidth, style, numberOfLines }: StrokedTextProps) {
  const flattenedStyle = StyleSheet.flatten(style) || {};
  
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
    <View style={style}>
      <View>
        {/* Base text to reserve space */}
        <Text 
          style={[flattenedStyle, { opacity: 0 }]} 
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {children}
        </Text>
        
        {/* Stroke layers */}
        {offsets.map((offset, index) => (
          <Text 
            key={index} 
            style={[
              flattenedStyle, 
              { 
                position: 'absolute', 
                top: offset.dy, 
                left: offset.dx, 
                color: strokeColor,
                zIndex: 1
              }
            ]}
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
          >
            {children}
          </Text>
        ))}
        
        {/* Main text layer */}
        <Text 
          style={[flattenedStyle, { position: 'absolute', top: 0, left: 0, zIndex: 2 }]} 
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {children}
        </Text>
      </View>
    </View>
  );
}
