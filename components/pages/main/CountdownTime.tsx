import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { SettingsType } from '@/constants/SettingsConstants'
import * as Haptics from 'expo-haptics'

const endSound = require('../../../assets/audio/time_ended.mp3')

interface CountdownTimeProps {
    settingsObj: SettingsType,
    step: number,
    pauseTrigger: boolean,
    scenario: string[],
    isPaused: boolean,
    setIsPaused: (value: boolean) => void,
    nextStep: () => void,
}

function CountdownTime({ settingsObj, pauseTrigger, step, scenario, isPaused, setIsPaused, nextStep }: CountdownTimeProps) {
    const phaze = scenario[step]
    const transformedPhaze = phaze === 'work' ? 'focusDuration' : phaze === 'short_break' ? 'shortBreakDuration' : 'longBreakDuration'
    const [timeLeft, setTimeLeft] = useState<number>(Number(settingsObj[transformedPhaze]))
    const player3 = useAudioPlayer(endSound)

    useEffect(() => {
        setTimeLeft(Number(settingsObj[transformedPhaze]))
        setIsPaused(true)
    }, [settingsObj.focusDuration, settingsObj.shortBreakDuration, settingsObj.longBreakDuration])

    useEffect(() => {
        let interval: any = null

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
            if (scenario[step] && settingsObj[transformedPhaze] === timeLeft) {
            } else if (timeLeft === 0) {
                if (settingsObj.sound === "System") {
                    Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                    )
                }
                if (settingsObj.sound === 'On') {
                    player3.seekTo(0)
                    player3.play()
                }
                nextStep()
                setTimeout(() => {
                    setIsPaused(false)
                }, 1000)
            }
        }, 1000)

        return () => clearInterval(timeCheckInterval)

    }, [step, scenario, timeLeft])

    useEffect(() => {
        setTimeLeft(settingsObj[transformedPhaze])
        setIsPaused(true)
    }, [step, phaze, pauseTrigger, settingsObj])

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return {
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        }
    }

    const { minutes, seconds } = formatTime(timeLeft)

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

// Export memoized component
export default React.memo(CountdownTime)