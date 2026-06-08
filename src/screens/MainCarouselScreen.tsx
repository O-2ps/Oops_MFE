import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View, Easing } from 'react-native';
import { carouselRef } from '../utils/carouselRef';
import HomeScreen from './HomeScreen';
import SkinScreen from './SkinScreen';
import MyPageScreen from './MyPageScreen';

const { width } = Dimensions.get('window');

const SCREENS = [HomeScreen, SkinScreen, MyPageScreen];

export default function MainCarouselScreen() {
  const currentIndexRef = useRef(0);
  const isAnimating = useRef(false);

  const positions = useRef([
    new Animated.Value(0),          // Home: visible
    new Animated.Value(width),      // Skin: off right
    new Animated.Value(width * 2),  // MyPage: off far right
  ]).current;

  useEffect(() => {
    carouselRef.navigate = (targetIndex: number, _direction: 'next' | 'prev') => {
      if (isAnimating.current) return;
      if (targetIndex === currentIndexRef.current) return;

      isAnimating.current = true;

      const animations = positions.map((pos, i) =>
        Animated.timing(pos, {
          toValue: (i - targetIndex) * width,
          duration: 280,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );

      Animated.parallel(animations).start(() => {
        currentIndexRef.current = targetIndex;
        isAnimating.current = false;
      });
    };

    return () => {
      carouselRef.navigate = null;
    };
  }, [positions]);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      {SCREENS.map((ScreenComponent, i) => (
        <Animated.View
          key={i}
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateX: positions[i] }] },
          ]}
        >
          <ScreenComponent />
        </Animated.View>
      ))}
    </View>
  );
}
