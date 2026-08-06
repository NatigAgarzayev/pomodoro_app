import { View, Text } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useSettingsStore } from '@/stores/settingsStore'
import { useStatisticsStore } from '@/stores/statisticsStore'
import { AppState, Vibration } from 'react-native'
import type { PhaseType } from '@/stores/statisticsStore'

const endSound = require('../../../assets/audio/time_ended.mp3')
const KEEP_AWAKE_TAG = 'pomodoro-timer-running'

// A real countdown holds each number on screen for the full second it
// represents, only advancing once that full second has actually elapsed -
// ceil (not round) is what gives that behavior.
function displaySeconds(remainingMs: number): number {
    return Math.max(0, Math.ceil(remainingMs / 1000))
}

interface CountdownTimeProps {
    step: number,
    pauseTrigger: boolean,
    scenario: string[],
    isPaused: boolean,
    setIsPaused: (value: boolean) => void,
    nextStep: () => void,
    onCycleComplete?: (totalFocusSeconds: number) => void,
}

function CountdownTime({ pauseTrigger, step, scenario, isPaused, setIsPaused, nextStep, onCycleComplete }: CountdownTimeProps) {
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
    // Kept in precise milliseconds (not rounded whole seconds) so repeated
    // pause/resume cycles never lose precision - only the display rounds,
    // via displaySeconds() below.
    const remainingMsRef = useRef<number>(duration * 1000)
    const sessionStartedRef = useRef(false)
    const finishingRef = useRef(false)
    const settingsRef = useRef(settingsObj)
    const phazeRef = useRef(phaze)
    const nextStepRef = useRef(nextStep)
    const playerRef = useRef(player3)
    const onCycleCompleteRef = useRef(onCycleComplete)
    const cycleFocusSecondsRef = useRef(0)
    // Track what the phase/step/duration were as of the last processed
    // reset, so the reset effect can tell "step actually advanced" (natural
    // finish or manual skip - both should credit elapsed focus time) apart
    // from "same phase restarted in place" (reload button / duration edit -
    // should not credit anything).
    const lastStepRef = useRef(step)
    const lastPhazeRef = useRef(phaze)
    const lastDurationRef = useRef(duration)
    // Steps mode (4/8) can force a step reset (see Settings.tsx) that looks
    // just like a step advance but isn't one - guard against crediting/
    // completing a cycle from that. scenario is a stable reference per
    // steps mode, so a reference change means the mode itself switched.
    const lastScenarioRef = useRef(scenario)

    settingsRef.current = settingsObj
    phazeRef.current = phaze
    nextStepRef.current = nextStep
    playerRef.current = player3
    onCycleCompleteRef.current = onCycleComplete

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
        // The phase ran its full course, so nothing is left. The reset
        // effect (triggered by nextStepRef() below advancing the step)
        // computes the elapsed-time credit from this value.
        remainingMsRef.current = 0

        if (sessionStartedRef.current) {
            endSession()
            sessionStartedRef.current = false
        }

        // Cycle-completion (incrementing the counter, firing the celebration,
        // and the stronger vibration) is handled generically in the reset
        // effect below, since it needs to fire whether the phase finished
        // naturally or was manually skipped - this callback only runs on
        // natural finish, so it just does the regular per-phase tap.
        const wasFullCycleEnd = phazeRef.current === 'long_break'

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
    }, [endSession, setIsPaused])

    // Reset the clock whenever the phase changes or an explicit reset
    // (pauseTrigger) is requested.
    useEffect(() => {
        // Both of these only apply when the step genuinely advanced (natural
        // finish or a manual skip) - not when the same phase is just being
        // restarted in place (reload button, editing a duration mid-run), and
        // not when switching steps mode forced a step reset (Settings.tsx
        // resets to step 1 if the current step doesn't exist in the new mode).
        const isGenuineTransition = step !== lastStepRef.current && scenario === lastScenarioRef.current

        // Switching steps mode always starts a fresh cycle attempt (step 1),
        // so any focus time accumulated toward the abandoned cycle shouldn't
        // carry over into the next celebration total.
        if (scenario !== lastScenarioRef.current) {
            cycleFocusSecondsRef.current = 0
        }

        // Credit elapsed focus time for the phase being left.
        if (isGenuineTransition && lastPhazeRef.current === 'work') {
            const remainingMsAtTransition = endAtRef.current !== null
                ? Math.max(0, endAtRef.current - Date.now())
                : remainingMsRef.current
            const elapsed = Math.max(0, Math.round(lastDurationRef.current - remainingMsAtTransition / 1000))
            cycleFocusSecondsRef.current += elapsed
        }

        // long_break is always the last phase in every scenario (4-step or
        // 8-step), so leaving it via a step advance always means a full
        // cycle just completed - whether it finished naturally or was
        // skipped. This is the one place that reliably sees every
        // transition, regardless of cause or which steps mode is active.
        if (isGenuineTransition && lastPhazeRef.current === 'long_break') {
            incrementCycles()
            if (settingsRef.current.sound === 'System') {
                // A full cycle finishing deserves something you can't miss -
                // a sustained, rhythmic buzz closer to an incoming phone call
                // (~2.5s) rather than a brief tap. Fires here (not
                // finishPhase) so it also triggers when the last step is
                // skipped, not just when it finishes naturally.
                Vibration.cancel()
                Vibration.vibrate([0, 500, 150, 500, 150, 500, 150, 500])
            }
            onCycleCompleteRef.current?.(cycleFocusSecondsRef.current)
            cycleFocusSecondsRef.current = 0
        }

        endAtRef.current = null
        remainingMsRef.current = duration * 1000
        finishingRef.current = false

        if (sessionStartedRef.current) {
            endSession()
            sessionStartedRef.current = false
        }

        setTimeLeft(duration)
        setIsPaused(true)

        lastStepRef.current = step
        lastPhazeRef.current = phaze
        lastDurationRef.current = duration
        lastScenarioRef.current = scenario
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, pauseTrigger, duration])

    // Start/stop the ticking interval. This effect only depends on
    // isPaused, so it runs once per play/pause toggle - not every second.
    useEffect(() => {
        if (isPaused) {
            if (endAtRef.current !== null) {
                remainingMsRef.current = Math.max(0, endAtRef.current - Date.now())
                endAtRef.current = null
                // Sync the displayed time to the precise value now, not just
                // internally - otherwise the display stays frozen on a
                // slightly stale last-tick number, and resuming (which
                // restarts the countdown from the precise value) makes it
                // look like a second got skipped.
                setTimeLeft(displaySeconds(remainingMsRef.current))
            }
            deactivateKeepAwake(KEEP_AWAKE_TAG)
            return
        }

        endAtRef.current = Date.now() + remainingMsRef.current
        activateKeepAwakeAsync(KEEP_AWAKE_TAG)

        if (!sessionStartedRef.current) {
            startSession(getPhaseType())
            sessionStartedRef.current = true
        }

        const interval = setInterval(() => {
            if (endAtRef.current === null) return
            const remainingMs = Math.max(0, endAtRef.current - Date.now())
            const remaining = displaySeconds(remainingMs)
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
                const remaining = displaySeconds(Math.max(0, endAtRef.current - Date.now()))
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
            Vibration.cancel()
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
