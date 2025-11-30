import { View, Text } from 'react-native'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { useSettingsStore } from '@/stores/settingsStore'
import { useStatisticsStore } from '@/stores/statisticsStore'
import { AppState } from 'react-native'
import type { PhaseType } from '@/stores/statisticsStore'

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
    const { startSession, endSession, incrementCycles } = useStatisticsStore()

    const [timeLeft, setTimeLeft] = useState<number>(Number(settingsObj[transformedPhaze]))
    const [startTime, setStartTime] = useState<number | null>(null)
    const [pausedTime, setPausedTime] = useState<number>(0)
    const [justFinished, setJustFinished] = useState(false)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pauseStartRef = useRef<number | null>(null)
    const isProcessingRef = useRef<boolean>(false)
    const mountedRef = useRef<boolean>(true)
    const sessionStartTimeRef = useRef<number | null>(null) // Track session start for statistics

    const player3 = useAudioPlayer(endSound)

    const duration = useMemo(() => Number(settingsObj[transformedPhaze]), [settingsObj, transformedPhaze])

    // Convert phaze to PhaseType
    const getPhaseType = useCallback((): PhaseType => {
        switch (phaze) {
            case 'work': return 'work'
            case 'short_break': return 'short_break'
            case 'long_break': return 'long_break'
            default: return 'work'
        }
    }, [phaze])

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

            // End statistics session and log the completed time
            if (sessionStartTimeRef.current) {
                endSession()
                sessionStartTimeRef.current = null
            }

            // Increment cycle count when full cycle completes (at the end of long break)
            if (phaze === 'long_break') {
                incrementCycles()
            }

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
    }, [settingsObj.sound, player3, nextStep, clearAllTimers, safeSetState, phaze, endSession, incrementCycles])

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

        // End session on reset
        if (sessionStartTimeRef.current) {
            endSession()
            sessionStartTimeRef.current = null
        }

        safeSetState(() => {
            setTimeLeft(duration)
            setStartTime(null)
            setPausedTime(0)
            pauseStartRef.current = null
            setIsPaused(true)
        })
    }, [step, phaze, pauseTrigger, duration, clearAllTimers, safeSetState, endSession])

    useEffect(() => {
        if (isPaused && !startTime && mountedRef.current) {
            safeSetState(() => setTimeLeft(duration))
        }
    }, [duration, isPaused, startTime, safeSetState])

    // Track statistics session - SIMPLIFIED VERSION
    useEffect(() => {
        // Start session when timer starts running
        if (!isPaused && startTime && !sessionStartTimeRef.current) {
            startSession(getPhaseType())
            sessionStartTimeRef.current = Date.now()
        }
    }, [isPaused, startTime, startSession, getPhaseType])

    useEffect(() => {
        return () => {
            mountedRef.current = false
            clearAllTimers()
            isProcessingRef.current = false
            // Clean up session on unmount
            if (sessionStartTimeRef.current) {
                endSession()
                sessionStartTimeRef.current = null
            }
        }
    }, [clearAllTimers, endSession])

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