import { Button, Pressable, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColorScheme, vars } from 'nativewind'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SETTINGS_KEY } from '@/constants/SettingsConstants'
import { useThemeStore } from '@/stores/themeStore'

const themes: any = {
    default: {
        light: vars({
            '--color-black-primary': '#000000',

            '--color-pink-wall': '#fff2f2',
            '--color-pink-primary': '#471515',
            '--color-pink-secondary': 'rgba(255,76,76,.15)',
            '--color-pink-button': 'rgba(255,76,76,.71)',

            '--color-green-wall': '#f2fff5',
            '--color-green-primary': '#14401d',
            '--color-green-secondary': 'rgba(77,218,110,.15)',
            '--color-green-button': 'rgba(77,218,110,.62)',

            '--color-blue-wall': '#f2f9ff',
            '--color-blue-primary': '#153047',
            '--color-blue-secondary': 'rgba(76,172,255,.15)',
            '--color-blue-button': 'rgba(76,172,255,.62)',
        }),
        dark: vars({
            '--color-black-primary': '#ffffff',

            '--color-pink-wall': '#0d0404',
            '--color-pink-primary': '#fff2f2',
            '--color-pink-secondary': 'rgba(255,76,76,.15)',
            '--color-pink-button': 'rgba(255,76,76,.71)',

            '--color-green-wall': '#0d0404',
            '--color-green-primary': '#f2fff5',
            '--color-green-secondary': 'rgba(77,218,110,.15)',
            '--color-green-button': 'rgba(77,218,110,.62)',

            '--color-blue-wall': '#0d0404',
            '--color-blue-primary': '#f2f9ff',
            '--color-blue-secondary': 'rgba(76,172,255,.15)',
            '--color-blue-button': 'rgba(76,172,255,.62)',
        })
    },
}

export default function Theme({ name, children }: { name: string, children: React.ReactNode }) {
    const { setColorScheme } = useColorScheme()
    const [themeLoaded, setThemeLoaded] = useState(false)
    const { theme, setTheme } = useThemeStore(state => state)

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY)
                let selectedTheme: 'light' | 'dark' = 'light'

                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings)
                    if (parsed.theme) {
                        selectedTheme = parsed.theme.toLowerCase() === 'dark' ? 'dark' : 'light'
                    }
                }
                setTheme(selectedTheme)
            } catch (e) {
                console.error(e)
            } finally {
                setThemeLoaded(true)
            }
        }

        loadTheme()
    }, [])

    if (!themeLoaded) return null
    return (
        <View style={themes[name][theme ?? 'light']}>
            {children}
        </View>
    )
}