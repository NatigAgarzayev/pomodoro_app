import { BackHandler, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useEffect, useState } from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'
import clsx from 'clsx'
import StepsCounter from '@/components/pages/main/StepsCounter'
import CountdownTime from '@/components/pages/main/CountdownTime'
import TimerControllers from '@/components/pages/main/TimerControllers'
import Celebration from '@/components/pages/main/Celebration'
import Settings from '@/components/pages/settings/Settings'
import { Appearance } from 'react-native'
import { useAudioPlayer } from 'expo-audio'
import { useColorScheme } from 'nativewind'
import { useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDoubleBackExit } from '@/hooks/useDoubleBackExit'
import Statistics from '@/components/pages/statistics/Statistics'


const btnPressSource = require('../assets/audio/btn_press.mp3')

const scenario = {
    '4 steps': ['work', 'short_break', 'work', 'long_break'],
    '8 steps': ['work', 'short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break']
}

function HomeScreen() {
    const systemTheme = Appearance.getColorScheme()
    const [step, setStep] = useState<number>(1)
    const [isPaused, setIsPaused] = useState<boolean>(true)
    const [pauseTrigger, setPauseTrigger] = useState<boolean>(false)
    const [celebration, setCelebration] = useState<{ visible: boolean, totalFocusSeconds: number }>({ visible: false, totalFocusSeconds: 0 })
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [statisticsOpen, setStatisticsOpen] = useState(false)
    const settingsObj = useSettingsStore(state => state.settings)
    const { colorScheme } = useColorScheme()
    const player1 = useAudioPlayer(btnPressSource)
    const setTheme = useThemeStore(state => state.setTheme)
    const handleDoubleBackExit = useDoubleBackExit()
    const phaze = scenario[settingsObj.stepsMode][step - 1]

    useEffect(() => {
        setIsPaused(true)
        setPauseTrigger(prev => !prev)
    }, [settingsObj.stepsMode])

    const stepChangeHandler = () => {
        if (step < scenario[settingsObj.stepsMode].length) {
            setStep(step + 1)
        }
        else {
            setStep(1)
        }
        if (settingsObj.sound === 'On') {
            player1.seekTo(0)
            player1.play()
        }
    }

    useEffect(() => {
        if (!settingsObj.theme) return
        if (settingsObj.theme === 'System') {
            setTheme(systemTheme || 'light')
        } else {
            setTheme(settingsObj.theme.toLowerCase() as 'light' | 'dark')
        }
    }, [settingsObj.theme, systemTheme])

    const handleCycleComplete = useCallback((totalFocusSeconds: number) => {
        setCelebration({ visible: true, totalFocusSeconds })
    }, [])

    const handleCelebrationClose = useCallback(() => {
        setCelebration(prev => ({ ...prev, visible: false }))
    }, [])

    // Single hardware-back handler for the whole screen. Settings and
    // Statistics used to each register their own, and each unconditionally
    // claimed to have handled the press even when its own panel was closed -
    // whichever registered last silently swallowed every back press for the
    // other, and their separate double-tap-to-exit counters never agreed
    // with each other. Owning the decision here (which panel is open, if
    // any) is the only way to get it right.
    useEffect(() => {
        const backAction = () => {
            if (settingsOpen) {
                setSettingsOpen(false)
                return true
            }
            if (statisticsOpen) {
                setStatisticsOpen(false)
                return true
            }
            handleDoubleBackExit()
            return true
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
        return () => backHandler.remove()
    }, [settingsOpen, statisticsOpen, handleDoubleBackExit])

    return (
        <SafeAreaView key={colorScheme} className={clsx('h-full',
            {
                'bg-pink-wall': scenario[settingsObj.stepsMode][step - 1] === 'work',
                'bg-green-wall': scenario[settingsObj.stepsMode][step - 1] === 'short_break',
                'bg-blue-wall': scenario[settingsObj.stepsMode][step - 1] === 'long_break',
            }
        )}>
            <View>
                <Statistics phaze={phaze} openPanel={statisticsOpen} onOpenChange={setStatisticsOpen} />
            </View>
            <View>
                <Settings phaze={phaze} setStep={setStep} openPanel={settingsOpen} onOpenChange={setSettingsOpen} />
            </View>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus phaze={phaze} />
                <StepsCounter step={step} scenarioLength={scenario[settingsObj.stepsMode].length} />
                <CountdownTime pauseTrigger={pauseTrigger} step={step - 1} scenario={scenario[settingsObj.stepsMode]} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} onCycleComplete={handleCycleComplete} />
                <TimerControllers pauseTrigger={pauseTrigger} setPauseTrigger={setPauseTrigger} phaze={phaze} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
            </View>
            <Celebration
                visible={celebration.visible}
                totalFocusSeconds={celebration.totalFocusSeconds}
                phaze={phaze}
                onClose={handleCelebrationClose}
            />
        </SafeAreaView >
    )
}

export default HomeScreen