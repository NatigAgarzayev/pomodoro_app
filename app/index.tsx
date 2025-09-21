import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import "../global.css"

export default function HomeScreen() {
    return (
        <SafeAreaView className='bg-red-300 h-full'>
            <View>
                <Text className='text-4xl text-center'>
                    Pomodoro app
                </Text>
            </View>
        </SafeAreaView>
    )
}