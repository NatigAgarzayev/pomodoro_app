import { View, Text } from 'react-native'
import React from 'react'

export default function StepsCounter({ scenarioLength, step }: { scenarioLength: number, step: number }) {
    return (
        <View>
            <Text className='text-xl mt-4 text-black-primary'>{step} / {scenarioLength}</Text>
        </View>
    )
}