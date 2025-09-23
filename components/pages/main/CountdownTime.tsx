import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

interface CountdownTimeProps {
    step: number,
    pauseTrigger: boolean,
    scenario: string[],
    isPaused: boolean,
    setIsPaused: (value: boolean) => void,
    nextStep: () => void,
}

const timeSettings: {
    [key: string]: number
} = {
    work: 1500,
    short_break: 300,
    long_break: 900,
}

export default function CountdownTime({ pauseTrigger, step, scenario, isPaused, setIsPaused, nextStep }: CountdownTimeProps) {
    const phaze = scenario[step]
    const [timeLeft, setTimeLeft] = useState<number>(Number(timeSettings[phaze]))

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> = null

        if (!isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            clearInterval(interval)
        }

        return () => clearInterval(interval)
    }, [isPaused, timeLeft])

    useEffect(() => {
        const timeCheckInterval = setInterval(() => {
            if (scenario[step] && timeSettings[scenario[step]] === timeLeft) {
            } else if (timeLeft === 0) {
                nextStep()
            }
        }, 1000)

        return () => clearInterval(timeCheckInterval)

    }, [step, scenario, timeLeft])

    useEffect(() => {
        setTimeLeft(timeSettings[phaze])
        setIsPaused(true)
    }, [step, phaze, pauseTrigger])

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return {
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        }
    }

    const { minutes, seconds } = formatTime(timeLeft)

    console.log('Time Left:', timeLeft, 'Seconds:', seconds, 'Minutes:', minutes, 'Phaze:', phaze, 'IsPaused:', isPaused);

    return (
        <View>
            <Text style={{ includeFontPadding: false, lineHeight: 217 }}
                className={clsx(
                    'text-[256px]',
                    {
                        'font-bold': !isPaused,
                        'font-light': isPaused,
                    },
                    {
                        'text-pink-primary': phaze === 'work',
                        'text-green-primary': phaze === 'short_break',
                        'text-blue-primary': phaze === 'long_break',
                    }
                )}>{minutes}</Text>
            <Text style={{ includeFontPadding: false, lineHeight: 217 }}
                className={clsx(
                    'text-[256px]',
                    {
                        'font-bold': !isPaused,
                        'font-light': isPaused,
                    },
                    {
                        'text-pink-primary': phaze === 'work',
                        'text-green-primary': phaze === 'short_break',
                        'text-blue-primary': phaze === 'long_break',
                    }
                )}>{seconds}</Text>
        </View >
    )
}