import { View, Text } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useSettingsStore } from '@/stores/settingsStore'
import { useStatisticsStore } from '@/stores/statisticsStore'
import { AppState } from 'react-native'
import type { PhaseType } from '@/stores/statisticsStore'

const endSound = require('../../../assets/audio/time_ended.mp3')
const KEEP_AWAKE_TAG = 'pomodoro-timer-running'

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
    const settingsObj = useSettingsStore(state => state.settings)
    const startSession = useStatisticsStore(state => state.startSession)
    const endSession = useStatisticsStore(state => state.endSession)
    const incrementCycles = useStatisticsStore(state => state.incrementCycles)
    const duration = Number(settingsObj[transformedPhaze])

    const [timeLeft, setTimeLeft] = useState<number>(duration)
    const player3 = useAudioPlayer(endSound)

    // The interval only ever reads these through refs, so changing them
    // never needs to tear down and recreate the interval or the AppState
    // subscription - that churn (previously happening every single tick)
    // was the source of the long-running-session instability.
    const endAtRef = useRef<number | null>(null)
    const remainingRef = useRef<number>(duration)
    const sessionStartedRef = useRef(false)
    const finishingRef = useRef(false)
    const settingsRef = useRef(settingsObj)
    const phazeRef = useRef(phaze)
    const nextStepRef = useRef(nextStep)
    const playerRef = useRef(player3)

    settingsRef.current = settingsObj
    phazeRef.current = phaze
    nextStepRef.current = nextStep
    playerRef.current = player3

    const getPhaseType = useCallback((): PhaseType => {
        switch (phazeRef.current) {
            case 'work': return 'work'
            case 'short_break': return 'short_break'
            case 'long_break': return 'long_break'
            default: return 'work'
        }
    }, [])

    const finishPhase = useCallback(() => {
        if (finishingRef.current) return
        finishingRef.current = true
        endAtRef.current = null

        if (sessionStartedRef.current) {
            endSession()
            sessionStartedRef.current = false
        }

        const wasFullCycleEnd = phazeRef.current === 'long_break'
        if (wasFullCycleEnd) {
            incrementCycles()
        }

        const currentSettings = settingsRef.current
        if (currentSettings.sound === 'System') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
        if (currentSettings.sound === 'On') {
            try {
                playerRef.current.seekTo(0)
                playerRef.current.play()
            } catch (error) {
                console.warn('Audio play error:', error)
            }
        }

        setTimeLeft(0)
        nextStepRef.current()

        // Auto-skip only carries into the next step within the same cycle.
        // A full cycle ending (long_break finishing, wrapping back to step 1)
        // always requires a manual start for the next cycle.
        if (currentSettings.skip === 'Auto' && !wasFullCycleEnd) {
            setTimeout(() => {
                finishingRef.current = false
                setIsPaused(false)
            }, 1000)
        } else {
            finishingRef.current = false
        }
    }, [endSession, incrementCycles, setIsPaused])

    // Reset the clock whenever the phase changes or an explicit reset
    // (pauseTrigger) is requested.
    useEffect(() => {
        endAtRef.current = null
        remainingRef.current = duration
        finishingRef.current = false

        if (sessionStartedRef.current) {
            endSession()
            sessionStartedRef.current = false
        }

        setTimeLeft(duration)
        setIsPaused(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, pauseTrigger, duration])

    // Start/stop the ticking interval. This effect only depends on
    // isPaused, so it runs once per play/pause toggle - not every second.
    useEffect(() => {
        if (isPaused) {
            if (endAtRef.current !== null) {
                remainingRef.current = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
                endAtRef.current = null
            }
            deactivateKeepAwake(KEEP_AWAKE_TAG)
            return
        }

        endAtRef.current = Date.now() + remainingRef.current * 1000
        activateKeepAwakeAsync(KEEP_AWAKE_TAG)

        if (!sessionStartedRef.current) {
            startSession(getPhaseType())
            sessionStartedRef.current = true
        }

        const interval = setInterval(() => {
            if (endAtRef.current === null) return
            const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
            setTimeLeft(remaining)
            if (remaining <= 0) {
                finishPhase()
            }
        }, 1000)

        return () => {
            clearInterval(interval)
            deactivateKeepAwake(KEEP_AWAKE_TAG)
        }
    }, [isPaused, finishPhase, startSession, getPhaseType])

    // Re-sync the displayed time when the app returns to the foreground.
    // Registered once for the component's lifetime instead of every tick.
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && endAtRef.current !== null) {
                const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
                setTimeLeft(remaining)
                if (remaining <= 0) {
                    finishPhase()
                }
            }
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)
        return () => subscription.remove()
    }, [finishPhase])

    useEffect(() => {
        return () => {
            if (sessionStartedRef.current) {
                endSession()
                sessionStartedRef.current = false
            }
        }
    }, [endSession])

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
