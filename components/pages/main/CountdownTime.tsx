import { View, Text } from 'react-native'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
    const phaze = scenario[step] || 'work'
    const transformedPhaze = phaze === 'work' ? 'focusDuration' : phaze === 'short_break' ? 'shortBreakDuration' : 'longBreakDuration'
    const { settings: settingsObj } = useSettingsStore()

    const [timeLeft, setTimeLeft] = useState<number>(Number(settingsObj[transformedPhaze]))
    const [startTime, setStartTime] = useState<number | null>(null)
    const [pausedTime, setPausedTime] = useState<number>(0)
    const [justFinished, setJustFinished] = useState(false)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pauseStartRef = useRef<number | null>(null)
    const isProcessingRef = useRef<boolean>(false)
    const mountedRef = useRef<boolean>(true)

    const player3 = useAudioPlayer(endSound)

    const duration = useMemo(() => Number(settingsObj[transformedPhaze]), [settingsObj, transformedPhaze])

    const clearAllTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    const safeSetState = useCallback((setter: () => void) => {
        if (mountedRef.current) {
            setter()
        }
    }, [])

    const calculateTimeLeft = useCallback(() => {
        if (!startTime) return timeLeft

        const now = Date.now()
        const elapsed = Math.floor((now - startTime - pausedTime) / 1000)
        const remaining = Math.max(0, duration - elapsed)
        return remaining
    }, [startTime, timeLeft, pausedTime, duration])

    const handleTimerFinish = useCallback(() => {
        if (isProcessingRef.current) return
        isProcessingRef.current = true

        try {
            clearAllTimers()

            if (settingsObj.sound === 'System') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
            if (settingsObj.sound === 'On') {
                try {
                    player3.seekTo(0)
                    player3.play()
                } catch (error) {
                    console.warn('Audio play error:', error)
                }
            }

            safeSetState(() => {
                setStartTime(null)
                setPausedTime(0)
                pauseStartRef.current = null
                setJustFinished(true)
            })

            nextStep()
        } catch (error) {
            console.error('Timer finish error:', error)
        } finally {
            setTimeout(() => {
                isProcessingRef.current = false
            }, 500)
        }
    }, [settingsObj.sound, player3, nextStep, clearAllTimers, safeSetState])

    useEffect(() => {
        if (justFinished && settingsObj.skip === 'Auto') {
            const autoSkipTimeout = setTimeout(() => {
                if (mountedRef.current) {
                    setIsPaused(false)
                    setJustFinished(false)
                }
            }, 1000)

            return () => clearTimeout(autoSkipTimeout)
        } else if (justFinished) {
            setJustFinished(false)
        }
    }, [justFinished, settingsObj.skip])


    useEffect(() => {
        clearAllTimers()

        if (!isPaused && startTime && mountedRef.current) {
            intervalRef.current = setInterval(() => {
                if (!mountedRef.current) return

                const remaining = calculateTimeLeft()
                setTimeLeft(remaining)

                if (remaining <= 0) {
                    handleTimerFinish()
                }
            }, 1000)
        }

        return clearAllTimers
    }, [isPaused, startTime, calculateTimeLeft, handleTimerFinish, clearAllTimers])

    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && !isPaused && startTime && mountedRef.current) {
                const remaining = calculateTimeLeft()
                safeSetState(() => setTimeLeft(remaining))
            }
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)
        return () => subscription?.remove()
    }, [isPaused, startTime, calculateTimeLeft, safeSetState])

    useEffect(() => {
        if (!isPaused && !startTime && mountedRef.current) {
            safeSetState(() => {
                setStartTime(Date.now())
                setPausedTime(0)
                pauseStartRef.current = null
            })
        }
    }, [isPaused, startTime, safeSetState])

    useEffect(() => {
        if (isPaused && startTime && !pauseStartRef.current) {
            pauseStartRef.current = Date.now()
        } else if (!isPaused && pauseStartRef.current && mountedRef.current) {
            const pauseDuration = Date.now() - pauseStartRef.current
            safeSetState(() => {
                setPausedTime(prev => prev + pauseDuration)
            })
            pauseStartRef.current = null
        }
    }, [isPaused, startTime, safeSetState])

    useEffect(() => {
        clearAllTimers()
        isProcessingRef.current = false

        safeSetState(() => {
            setTimeLeft(duration)
            setStartTime(null)
            setPausedTime(0)
            pauseStartRef.current = null
            setIsPaused(true)
        })
    }, [step, phaze, pauseTrigger, duration, clearAllTimers, safeSetState])

    useEffect(() => {
        if (isPaused && !startTime && mountedRef.current) {
            safeSetState(() => setTimeLeft(duration))
        }
    }, [duration, isPaused, startTime, safeSetState])

    useEffect(() => {
        return () => {
            mountedRef.current = false
            clearAllTimers()
            isProcessingRef.current = false
        }
    }, [clearAllTimers])

    const formatTime = useCallback((totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return {
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        }
    }, [])

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