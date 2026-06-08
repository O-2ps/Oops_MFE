import React, { useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import BG from './assets/icons/BG.svg';

import LandingScreen from './src/screens/LandingScreen';
import MainCarouselScreen from './src/screens/MainCarouselScreen';
import LastCheckScreen from './src/screens/LastCheckScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
import SkinPhotoScreen from './src/screens/SkinPhotoScreen';
import ResultScreen from './src/screens/ResultScreen';
import SurveyScreen from './src/screens/SurveyScreen';
import ColorMatchScreen from './src/screens/ColorMatchScreen';
import WeatherBeautyScreen from './src/screens/WeatherBeautyScreen';
import * as S from './src/screens/style';
import StrokedText from './src/components/StrokedText';
import { RootStackParamList } from './src/types/navigation';
import { COLORS, FONTS } from './src/constants/theme';
import { carouselRef } from './src/utils/carouselRef';

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

const MAIN_SCREEN_COUNT = 3;

function AppInner({
  onLayout,
  navigationRef,
  animationType,
  currentRoute,
  setCurrentRoute,
  hideArrows,
  setHideArrows,
  handleNavigate,
  showArrows,
}: {
  onLayout: () => void;
  navigationRef: any;
  animationType: 'slide_from_right' | 'slide_from_left' | 'none';
  currentRoute: string;
  setCurrentRoute: (v: string) => void;
  hideArrows: boolean;
  setHideArrows: (v: boolean) => void;
  handleNavigate: (direction: 'next' | 'prev') => void;
  showArrows: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.WHITE }} onLayout={onLayout}>
      <View style={{ flex: 1 }}>
        <S.GreenBox style={{ height: Math.max(insets.top, 20), minHeight: 20 }} />
        <View style={{ flex: 1, position: 'relative' }}>
          {currentRoute === 'MainCarousel' && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
            </View>
          )}
          <NavigationContainer
            ref={navigationRef}
            theme={MyTheme}
            onStateChange={() => {
              const route = navigationRef.getCurrentRoute();
              if (route) {
                setCurrentRoute(route.name);
                setHideArrows((route.params as any)?.hideArrows === true);
              }
            }}
          >
            <Stack.Navigator
              initialRouteName="Landing"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: animationType,
              }}
            >
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="MainCarousel" component={MainCarouselScreen} />
              <Stack.Screen name="LastCheck" component={LastCheckScreen} />
              <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
              <Stack.Screen name="SkinPhoto" component={SkinPhotoScreen} />
              <Stack.Screen name="Result" component={ResultScreen} />
              <Stack.Screen name="Survey" component={SurveyScreen} />
              <Stack.Screen name="ColorMatch" component={ColorMatchScreen} />
              <Stack.Screen name="WeatherBeauty" component={WeatherBeautyScreen} />
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
        <S.GreenBox style={{ height: Math.max(insets.bottom, 20), minHeight: 20 }} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [currentRoute, setCurrentRoute] = useState<string>('Landing');
  const [animationType] = useState<'slide_from_right' | 'slide_from_left' | 'none'>('none');
  const [hideArrows, setHideArrows] = useState(false);
  const [mainIndex, setMainIndex] = useState(0);

  const [fontsLoaded, fontError] = useFonts({
    [FONTS.PIXEL]: require('./assets/fonts/DOSIyagiBoldface.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleNavigate = (direction: 'next' | 'prev') => {
    let nextIdx: number;
    if (direction === 'next') {
      nextIdx = (mainIndex + 1) % MAIN_SCREEN_COUNT;
    } else {
      nextIdx = (mainIndex - 1 + MAIN_SCREEN_COUNT) % MAIN_SCREEN_COUNT;
    }
    setMainIndex(nextIdx);
    carouselRef.navigate?.(nextIdx, direction);
  };

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <S.Container style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE }}>
          <ActivityIndicator size="large" color={COLORS.SECONDARY} />
        </S.Container>
      </SafeAreaProvider>
    );
  }

  const showArrows = currentRoute === 'MainCarousel' && !hideArrows;

  return (
    <SafeAreaProvider>
      <AppInner
        onLayout={onLayoutRootView}
        navigationRef={navigationRef}
        animationType={animationType}
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        hideArrows={hideArrows}
        setHideArrows={setHideArrows}
        handleNavigate={handleNavigate}
        showArrows={showArrows}
      />
    </SafeAreaProvider>
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
