import React, { useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SkinScreen from './src/screens/SkinScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import LastCheckScreen from './src/screens/LastCheckScreen';
import ResultScreen from './src/screens/ResultScreen';
import BG from './assets/icons/BG.svg';
import * as S from './src/screens/style';
import StrokedText from './src/components/StrokedText';
import { RootStackParamList } from './src/types/navigation';
import { COLORS, FONTS } from './src/constants/theme';

const { width, height } = Dimensions.get('window');
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.BACKGROUND,
  },
};

const NAV_ORDER: (keyof RootStackParamList)[] = ['Home', 'Skin', 'MyPage'];

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [currentRoute, setCurrentRoute] = useState<string>('Landing');
  const [animationType, setAnimationType] = useState<'slide_from_right' | 'slide_from_left'>('slide_from_right');

  const [fontsLoaded, fontError] = useFonts({
    [FONTS.PIXEL]: require('./assets/fonts/DOSIyagiBoldface.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleNavigate = (direction: 'next' | 'prev') => {
    const currentIndex = NAV_ORDER.indexOf(currentRoute as any);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % NAV_ORDER.length;
      setAnimationType('slide_from_right');
    } else {
      nextIndex = (currentIndex - 1 + NAV_ORDER.length) % NAV_ORDER.length;
      setAnimationType('slide_from_left');
    }

    const nextRoute = NAV_ORDER[nextIndex];
    // 잠시 대기 후 이동하여 애니메이션 방향이 먼저 반영되도록 함
    setTimeout(() => {
      navigationRef.navigate(nextRoute as any);
    }, 0);
  };

  if (!fontsLoaded && !fontError) {
    return (
      <S.Container style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE }}>
        <ActivityIndicator size="large" color={COLORS.SECONDARY} />
      </S.Container>
    );
  }

  const showArrows = NAV_ORDER.includes(currentRoute as any);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.WHITE }} onLayout={onLayoutRootView}>
      <View style={{ flex: 1 }}>
        <S.GreenBox />
        <View style={{ flex: 1, position: 'relative' }}>
          <NavigationContainer
            ref={navigationRef}
            theme={MyTheme}
            onStateChange={() => {
              const route = navigationRef.getCurrentRoute();
              if (route) setCurrentRoute(route.name);
            }}
          >
            <Stack.Navigator
              initialRouteName="Landing"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.BACKGROUND },
                animation: animationType,
              }}
            >
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Skin" component={SkinScreen} />
              <Stack.Screen name="MyPage" component={MyPageScreen} />
              <Stack.Screen name="LastCheck" component={LastCheckScreen} />
              {/* Result Screen for Analysis Results */}
              <Stack.Screen name="Result" component={ResultScreen} />
            </Stack.Navigator>
          </NavigationContainer>

          {showArrows && (
            <View style={styles.arrowOverlay} pointerEvents="box-none">
              <TouchableOpacity style={styles.arrowButton} onPress={() => handleNavigate('prev')}>
                <StrokedText strokeColor={COLORS.WHITE} strokeWidth={2.5} style={styles.arrowText}>
                  &lt;
                </StrokedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowButton} onPress={() => handleNavigate('next')}>
                <StrokedText strokeColor={COLORS.WHITE} strokeWidth={2.5} style={styles.arrowText}>
                  &gt;
                </StrokedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <S.GreenBox />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  arrowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 100,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 30,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  }
});