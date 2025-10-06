import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useEffect, useState } from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'
import clsx from 'clsx'
import StepsCounter from '@/components/pages/main/StepsCounter'
import CountdownTime from '@/components/pages/main/CountdownTime'
import TimerControllers from '@/components/pages/main/TimerControllers'
import Settings from '@/components/pages/main/Settings'
import { Appearance } from 'react-native'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useColorScheme } from 'nativewind'
import * as Haptics from 'expo-haptics'
import { useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'


const btnPressSource = require('../assets/audio/btn_press.mp3')
const lofiMusicSource = require('../assets/audio/lofi.mp3')

const scenario = {
    '4 steps': ['work', 'short_break', 'work', 'long_break'],
    '8 steps': ['work', 'short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break']
}

export default function HomeScreen() {
    const systemTheme = Appearance.getColorScheme()
    const [step, setStep] = useState<number>(1)
    const [isPaused, setIsPaused] = useState<boolean>(true)
    const [pauseTrigger, setPauseTrigger] = useState<boolean>(false)
    const { settings: settingsObj } = useSettingsStore()
    const [musicHasStarted, setMusicHasStarted] = useState(false)
    const { colorScheme } = useColorScheme()
    const player1 = useAudioPlayer(btnPressSource)
    const player2 = useAudioPlayer(lofiMusicSource)
    const { didJustFinish, playing } = useAudioPlayerStatus(player2)
    const { setTheme } = useThemeStore(state => state)
    const phaze = scenario[settingsObj.stepsMode][step - 1]


    useEffect(() => {
        setIsPaused(true)
        setPauseTrigger(prev => !prev)
    }, [settingsObj.stepsMode])

    useEffect(() => {
        if (settingsObj.lofi === "Off") {
            player2.pause()
        }
    }, [settingsObj.lofi])

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
        if (!settingsObj) return
        if (settingsObj.theme === 'System') {
            setTheme(systemTheme || 'light')
        } else {
            setTheme(settingsObj.theme.toLowerCase() as 'light' | 'dark')
        }
    }, [settingsObj, systemTheme])

    useEffect(() => {
        if (settingsObj.sound === 'System') {
            Haptics.selectionAsync()
        }
        if (settingsObj.lofi === 'Off') return
        if (!isPaused) {
            if (!musicHasStarted) {
                player2.play()
                setMusicHasStarted(true)
            } else if (!playing) {
                player2.play()
            }
        } else if (isPaused && playing) {
            player2.pause()
        }

    }, [isPaused])

    useEffect(() => {
        if (settingsObj.lofi === 'Off') return
        if (didJustFinish) {
            player2.seekTo(0)
            player2.play()
        }
    }, [didJustFinish])

    return (
        <SafeAreaView key={colorScheme} className={clsx('h-full',
            {
                'bg-pink-wall': scenario[settingsObj.stepsMode][step - 1] === 'work',
                'bg-green-wall': scenario[settingsObj.stepsMode][step - 1] === 'short_break',
                'bg-blue-wall': scenario[settingsObj.stepsMode][step - 1] === 'long_break',
            }
        )}>
            <View>
                <Settings phaze={phaze} step={step} setStep={setStep} />
            </View>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus phaze={phaze} />
                <StepsCounter step={step} scenarioLength={scenario[settingsObj.stepsMode].length} />
                <CountdownTime pauseTrigger={pauseTrigger} step={step - 1} scenario={scenario[settingsObj.stepsMode]} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
                <TimerControllers pauseTrigger={pauseTrigger} setPauseTrigger={setPauseTrigger} phaze={phaze} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
            </View>
        </SafeAreaView >
    )
}