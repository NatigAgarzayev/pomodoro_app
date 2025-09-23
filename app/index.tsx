import { View, Text, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'

const scenario = ['work', 'short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break']

export default function HomeScreen() {
    const [step, setStep] = useState<number>(1)

    const stepChangeHandler = () => {
        if (step < scenario.length) {
            setStep(step + 1)
        }
        else {
            setStep(1)
        }
    }

    return (
        <SafeAreaView className='bg-pink-wall h-full'>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus step={step - 1} scenario={scenario} />
                <Text className='text-black'>{step}/{scenario.length}</Text>
                <Button title='Next' onPress={stepChangeHandler} />
            </View>
        </SafeAreaView >
    )
}