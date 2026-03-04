import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor="#050505" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050505' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz-play" options={{ presentation: 'modal' }} />
        <Stack.Screen name="pair-programming" options={{ presentation: 'modal' }} />
        <Stack.Screen name="dual-coding" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bug-hunt" options={{ presentation: 'modal' }} />
        <Stack.Screen name="interview" options={{ presentation: 'modal' }} />
        <Stack.Screen name="pomodoro" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
