import React, { useState } from 'react'
import { Slot } from 'expo-router'
import Theme from '@/components/provider/Theme'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.setOptions({
    duration: 3000,
    fade: true,
})

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    return (
        <Theme name="default">
            <Slot />
        </Theme>
    )
}