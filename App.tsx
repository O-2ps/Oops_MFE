import React, { useCallback, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SkinScreen from './src/screens/SkinScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import LastCheckScreen from './src/screens/LastCheckScreen';
import { StatusBar } from 'expo-status-bar';
import BG from './assets/icons/BG.svg';
import * as S from './src/screens/style';
import StrokedText from './src/components/StrokedText';

const { width, height } = Dimensions.get('window');
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

type RootStackParamList = {
  Landing: undefined;
  Home: undefined;
  Skin: undefined;
  MyPage: undefined;
  LastCheck: { from: string };
};

const NAV_ORDER = ['Home', 'Skin', 'MyPage'];

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [currentRoute, setCurrentRoute] = useState('Landing');

  const [fontsLoaded, fontError] = useFonts({
    'DOSIyagiBoldface': require('./assets/fonts/DOSIyagiBoldface.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleNavigate = (direction: 'next' | 'prev') => {
    const currentIndex = NAV_ORDER.indexOf(currentRoute);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % NAV_ORDER.length;
    } else {
      nextIndex = (currentIndex - 1 + NAV_ORDER.length) % NAV_ORDER.length;
    }

    const nextRoute = NAV_ORDER[nextIndex];
    navigationRef.navigate(nextRoute as any);
  };

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#C6EB8D" />
      </View>
    );
  }

  const showArrows = NAV_ORDER.includes(currentRoute);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }} onLayout={onLayoutRootView}>
      <BG
        width={width}
        height={height}
        style={{ position: 'absolute' }}
        preserveAspectRatio="xMidYMid slice"
      />
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
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Skin" component={SkinScreen} />
              <Stack.Screen name="MyPage" component={MyPageScreen} />
              <Stack.Screen name="LastCheck" component={LastCheckScreen} />
            </Stack.Navigator>
          </NavigationContainer>

          {showArrows && (
            <View style={styles.arrowOverlay} pointerEvents="box-none">
              <TouchableOpacity style={styles.arrowButton} onPress={() => handleNavigate('prev')}>
                <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.arrowText}>
                  &lt;
                </StrokedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowButton} onPress={() => handleNavigate('next')}>
                <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.arrowText}>
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
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  }
});