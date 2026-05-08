import React, { useCallback } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, Dimensions } from 'react-native';
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SkinScreen from './src/screens/SkinScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import LastCheckScreen from './src/screens/LastCheckScreen';
import { StatusBar } from 'expo-status-bar';
import BG from './assets/icons/BG.svg';
import * as S from './src/screens/style';

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

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'DOSIyagiBoldface': require('./assets/fonts/DOSIyagiBoldface.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#C6EB8D" />
      </View>
    );
  }

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
        <NavigationContainer theme={MyTheme}>
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
        <S.GreenBox />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
