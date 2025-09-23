import { View, Text, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'
import clsx from 'clsx'
import StepsCounter from '@/components/pages/main/StepsCounter'

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
        <SafeAreaView className={clsx('h-full',
            {
                'bg-pink-wall': scenario[step - 1] === 'work',
                'bg-green-wall': scenario[step - 1] === 'short_break',
                'bg-blue-wall': scenario[step - 1] === 'long_break',
            }
        )}>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus step={step - 1} scenario={scenario} />
                <StepsCounter step={step} scenarioLength={scenario.length} />
                <Button title='Next' onPress={stepChangeHandler} />
            </View>
        </SafeAreaView >
    )
}