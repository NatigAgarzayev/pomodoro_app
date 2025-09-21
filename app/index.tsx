import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'

export default function HomeScreen() {
    return (
        <SafeAreaView className='bg-pink-wall h-full'>
            <View>
                <PhazeStatus />
            </View>
        </SafeAreaView >
    )
}