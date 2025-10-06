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
    const phaze = scenario[step] || 'work' // Safe fallback
    const transformedPhaze = phaze === 'work' ? 'focusDuration' : phaze === 'short_break' ? 'shortBreakDuration' : 'longBreakDuration'
    const { settings: settingsObj } = useSettingsStore()

    const [timeLeft, setTimeLeft] = useState<number>(Number(settingsObj[transformedPhaze]))
    const [startTime, setStartTime] = useState<number | null>(null)
    const [pausedTime, setPausedTime] = useState<number>(0)

    // Refs for cleanup
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pauseStartRef = useRef<number | null>(null)
    const isProcessingRef = useRef<boolean>(false)
    const mountedRef = useRef<boolean>(true)

    const player3 = useAudioPlayer(endSound)

    // Memoize duration to prevent unnecessary recalculations
    const duration = useMemo(() => Number(settingsObj[transformedPhaze]), [settingsObj, transformedPhaze])

    // Clear all timers helper
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

    // Safe state updates only if component is mounted
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

    // Debounced timer finish handler
    const handleTimerFinish = useCallback(() => {
        if (isProcessingRef.current) return // Prevent multiple calls
        isProcessingRef.current = true

        try {
            clearAllTimers()

            // Play sound/haptic feedback
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

            // Reset timer state
            safeSetState(() => {
                setStartTime(null)
                setPausedTime(0)
                pauseStartRef.current = null
            })

            // Call nextStep
            nextStep()

            // Auto-start next timer if enabled
            if (settingsObj.skip === 'Auto') {
                timeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                        setIsPaused(false)
                    }
                }, 1000)
            }
        } catch (error) {
            console.error('Timer finish error:', error)
        } finally {
            // Reset processing flag after a delay
            setTimeout(() => {
                isProcessingRef.current = false
            }, 500)
        }
    }, [settingsObj.sound, settingsObj.skip, player3, nextStep, clearAllTimers, safeSetState])

    // Main timer interval effect
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
            }, 1000) // Reduced to 1 second for better performance
        }

        return clearAllTimers
    }, [isPaused, startTime, calculateTimeLeft, handleTimerFinish, clearAllTimers])

    // App state change handler
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

    // Start/pause timer effect
    useEffect(() => {
        if (!isPaused && !startTime && mountedRef.current) {
            // Starting timer
            safeSetState(() => {
                setStartTime(Date.now())
                setPausedTime(0)
                pauseStartRef.current = null
            })
        }
    }, [isPaused, startTime, safeSetState])

    // Pause duration tracking
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

    // Reset timer on step/phase change
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

    // Update duration when settings change (only if paused)
    useEffect(() => {
        if (isPaused && !startTime && mountedRef.current) {
            safeSetState(() => setTimeLeft(duration))
        }
    }, [duration, isPaused, startTime, safeSetState])

    // Cleanup on unmount
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