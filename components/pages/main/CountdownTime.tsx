import { View, Text } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import clsx from 'clsx'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { useSettingsStore } from '@/stores/settingsStore'
import { AppState } from 'react-native'

const endSound = require('../../../assets/audio/time_ended.mp3')

interface CountdownTimeProps {
    step: number,
    pauseTrigger: boolean,
    scenario: string[],
    isPaused: boolean,
    setIsPaused: (value: boolean) => void,
    nextStep: () => void,
}

function CountdownTime({ pauseTrigger, step, scenario, isPaused, setIsPaused, nextStep }: CountdownTimeProps) {
    const phaze = scenario[step]
    const transformedPhaze = phaze === 'work' ? 'focusDuration' : phaze === 'short_break' ? 'shortBreakDuration' : 'longBreakDuration'
    const { settings: settingsObj } = useSettingsStore()

    const [timeLeft, setTimeLeft] = useState<number>(Number(settingsObj[transformedPhaze]))
    const [startTime, setStartTime] = useState<number | null>(null)
    const [pausedTime, setPausedTime] = useState<number>(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const player3 = useAudioPlayer(endSound)

    const calculateTimeLeft = () => {
        if (!startTime) return timeLeft

        const now = Date.now()
        const elapsed = Math.floor((now - startTime - pausedTime) / 1000)
        const remaining = Math.max(0, Number(settingsObj[transformedPhaze]) - elapsed)
        return remaining
    }

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        if (!isPaused && startTime) {
            intervalRef.current = setInterval(() => {
                const remaining = calculateTimeLeft()
                setTimeLeft(remaining)

                if (remaining <= 0) {
                    if (settingsObj.sound === 'System') {
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                        )
                    }
                    if (settingsObj.sound === 'On') {
                        player3.seekTo(0)
                        player3.play()
                    }

                    setStartTime(null)
                    setPausedTime(0)

                    nextStep()

                    if (settingsObj.skip === 'Auto') {
                        setTimeout(() => {
                            setIsPaused(false)
                        }, 1000)
                    }
                }
            }, 100)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isPaused, startTime, pausedTime, settingsObj.sound, settingsObj.skip])

    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && !isPaused && startTime) {
                const remaining = calculateTimeLeft()
                setTimeLeft(remaining)
            }
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)
        return () => subscription?.remove()
    }, [isPaused, startTime, pausedTime])

    useEffect(() => {
        if (!isPaused) {
            if (!startTime) {
                setStartTime(Date.now())
                setPausedTime(0)
            }
        } else {
            if (startTime) {
                const currentTime = Date.now()
                const currentPauseDuration = currentTime - (startTime + pausedTime + (Number(settingsObj[transformedPhaze]) - timeLeft) * 1000)
            }
        }
    }, [isPaused])

    const pauseStartRef = useRef<number | null>(null)

    useEffect(() => {
        if (isPaused && startTime) {
            pauseStartRef.current = Date.now()
        } else if (!isPaused && pauseStartRef.current) {
            const pauseDuration = Date.now() - pauseStartRef.current
            setPausedTime(prev => prev + pauseDuration)
            pauseStartRef.current = null
        }
    }, [isPaused, startTime])

    useEffect(() => {
        setTimeLeft(settingsObj[transformedPhaze])
        setStartTime(null)
        setPausedTime(0)
        pauseStartRef.current = null
        setIsPaused(true)
    }, [step, phaze, pauseTrigger])

    useEffect(() => {
        if (isPaused && !startTime) {
            setTimeLeft(Number(settingsObj[transformedPhaze]))
        }
    }, [settingsObj.focusDuration, settingsObj.shortBreakDuration, settingsObj.longBreakDuration, transformedPhaze, isPaused, startTime])

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
        </View>
    )
}

export default React.memo(CountdownTime)