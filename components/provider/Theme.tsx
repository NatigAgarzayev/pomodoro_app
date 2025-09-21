import { View } from 'react-native'
import React from 'react'
import { useColorScheme, vars } from 'nativewind'

const themes: any = {
    default: {
        light: vars({
            '--color-pink-wall': '#fff2f2',
            '--color-pink-primary': '#471515',
            '--color-pink-secondary': 'rgba(255,76,76,.15)',
            '--color-pink-button': 'rgba(255,76,76,.71)',

            '--color-green-wall': '#f2fff5',
            '--color-green-primary': '#14401d',
            '--color-green-secondary': 'rgba(255,76,76,.15)',
            '--color-green-button': 'rgba(77,218,110,.62)',

            '--color-blue-wall': '#f2f9ff',
            '--color-blue-primary': '#153047',
            '--color-blue-secondary': 'rgba(76,172,255,.15)',
            '--color-blue-button': 'rgba(76,172,255,.62)',
        }),
        dark: vars({
            '--color-pink-wall': '#0d0404',
            '--color-pink-primary': '#fff2f2',
            '--color-pink-secondary': 'rgba(77,218,110,.15)',
            '--color-pink-button': 'rgba(255,76,76,.71)',

            '--color-green-wall': '#0d0404',
            '--color-green-primary': '#fff2f2',
            '--color-green-secondary': 'rgba(255,76,76,.15)',
            '--color-green-button': 'rgba(77,218,110,.62)',

            '--color-blue-wall': '#0d0404',
            '--color-blue-primary': '#fff2f2',
            '--color-blue-secondary': 'rgba(76,172,255,.15)',
            '--color-blue-button': 'rgba(76,172,255,.62)',
        })
    },
}

export default function Theme({ name, children }: { name: string, children: React.ReactNode }) {
    const { colorScheme } = useColorScheme()
    return (
        <View style={themes[name][colorScheme ?? "light"]}>
            {children}
        </View>
    )
}