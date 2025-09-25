import React, { useState } from 'react'
import { Slot } from 'expo-router'
import Theme from '@/components/provider/Theme'
export default function RootLayout() {

    return (
        <Theme name="default">
            <Slot />
        </Theme>
    )
}