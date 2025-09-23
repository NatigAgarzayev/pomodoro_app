import { View, Text } from 'react-native'
import React from 'react'

export default function StepsCounter({ scenarioLength, step }: { scenarioLength: number, step: number }) {
    return (
        <View>
            <Text className='text-xl my-5'>{step} / {scenarioLength}</Text>
        </View>
    )
}