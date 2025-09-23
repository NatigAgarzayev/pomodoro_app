import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'

const scenario = ['work', 'short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break'] as const

export default function HomeScreen() {
    const [phaze, setPhaze] = useState<'work' | 'short_break' | 'long_break'>('work')


    return (
        <SafeAreaView className='bg-pink-wall h-full'>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus phaze={phaze} />
            </View>
        </SafeAreaView >
    )
}