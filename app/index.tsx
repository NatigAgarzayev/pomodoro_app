import { View, Text, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { use, useEffect, useState } from 'react'
import "../global.css"
import PhazeStatus from '@/components/pages/main/PhazeStatus'
import clsx from 'clsx'
import StepsCounter from '@/components/pages/main/StepsCounter'
import CountdownTime from '@/components/pages/main/CountdownTime'
import TimerControllers from '@/components/pages/main/TimerControllers'
import Settings from '@/components/pages/main/Settings'
import { Appearance } from 'react-native'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { defaultSettings, SETTINGS_KEY, SettingsType } from '@/constants/SettingsConstants'
import { useColorScheme } from 'nativewind'
import * as Haptics from 'expo-haptics'
import { useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'


const btnPressSource = require('../assets/audio/btn_press.mp3')
const lofiMusicSource = require('../assets/audio/lofi.mp3')

const scenario = ['work', 'short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break']

export default function HomeScreen() {
    const systemTheme = Appearance.getColorScheme()
    const [step, setStep] = useState<number>(1)
    const [isPaused, setIsPaused] = useState<boolean>(true)
    const [pauseTrigger, setPauseTrigger] = useState<boolean>(false)
    const { settings: settingsObj } = useSettingsStore()
    const [musicHasStarted, setMusicHasStarted] = useState(false)
    const phaze = scenario[step - 1]
    const { colorScheme, setColorScheme } = useColorScheme()
    const player1 = useAudioPlayer(btnPressSource)
    const player2 = useAudioPlayer(lofiMusicSource)
    const { didJustFinish, playing } = useAudioPlayerStatus(player2)
    const { setTheme } = useThemeStore(state => state)

    const stepChangeHandler = () => {
        if (step < scenario.length) {
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
                'bg-pink-wall': scenario[step - 1] === 'work',
                'bg-green-wall': scenario[step - 1] === 'short_break',
                'bg-blue-wall': scenario[step - 1] === 'long_break',
            }
        )}>
            <View>
                <Settings sound2={player2} phaze={phaze} />
            </View>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus phaze={phaze} />
                <StepsCounter step={step} scenarioLength={scenario.length} />
                <CountdownTime pauseTrigger={pauseTrigger} step={step - 1} scenario={scenario} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
                <TimerControllers pauseTrigger={pauseTrigger} setPauseTrigger={setPauseTrigger} phaze={phaze} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
            </View>
        </SafeAreaView >
    )
}