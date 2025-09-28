import React, { useState } from 'react'
import { Slot } from 'expo-router'
import Theme from '@/components/provider/Theme'
import * as SplashScreen from 'expo-splash-screen'
import * as Sentry from '@sentry/react-native';

Sentry.init({
    dsn: 'https://554c3b4802f3262ed0bc6fd88f5366ad@o4510098384945152.ingest.de.sentry.io/4510098386321488',

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
});
SplashScreen.setOptions({
    duration: 2000,
    fade: true,
})

SplashScreen.preventAutoHideAsync()

export default Sentry.wrap(function RootLayout() {
    return (
        <Theme name="default">
            <Slot />
        </Theme>
    )
});