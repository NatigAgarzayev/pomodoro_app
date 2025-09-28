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
import { Appearance, useColorScheme } from 'react-native'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { defaultSettings, SETTINGS_KEY, SettingsType } from '@/constants/SettingsConstants'
import * as Haptics from 'expo-haptics'
import * as SplashScreen from 'expo-splash-screen'

const btnPressSource = require('../assets/audio/btn_press_compressed.mp3')
const lofiMusicSource = require('../assets/audio/lofi.mp3')

const scenario = ['work', 'short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break']

export default function HomeScreen() {
    const [step, setStep] = useState<number>(1)
    const [isPaused, setIsPaused] = useState<boolean>(true)
    const [pauseTrigger, setPauseTrigger] = useState<boolean>(false)
    const [settingsObj, setSettingsObj] = useState<SettingsType>(defaultSettings)
    const [musicHasStarted, setMusicHasStarted] = useState(false)
    const phaze = scenario[step - 1]
    const colorScheme = useColorScheme()
    const player1 = useAudioPlayer(btnPressSource)
    const player2 = useAudioPlayer(lofiMusicSource)
    const { isLoaded } = useAudioPlayerStatus(player1)
    const { didJustFinish, playing, isLoaded: isLoaded2 } = useAudioPlayerStatus(player2)

    useEffect(() => {
        loadSettings()
        SplashScreen.hide()
    }, [])

    useEffect(() => {
        Appearance.setColorScheme(colorScheme)
    }, [colorScheme])

    useEffect(() => {
        if (settingsObj.sound === "System") {
            Haptics.selectionAsync()
        }
        if (settingsObj.sound === 'On') {
            player1.seekTo(0)
            player1.play()
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

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY)

            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings)
                setSettingsObj({ ...defaultSettings, ...parsedSettings })
            }
        } catch (error) {
            console.error('Error loading settings:', error)
            setSettingsObj(defaultSettings)
        }
    }

    const stepChangeHandler = () => {
        if (settingsObj.sound === "System") {
            Haptics.selectionAsync()
        }
        if (settingsObj.sound === 'On') {
            player1.seekTo(0)
            player1.play()
        }
        if (step < scenario.length) {
            setStep(step + 1)
        }
        else {
            setStep(1)
        }
    }

    return (
        <SafeAreaView className={clsx('h-full',
            {
                'bg-pink-wall': scenario[step - 1] === 'work',
                'bg-green-wall': scenario[step - 1] === 'short_break',
                'bg-blue-wall': scenario[step - 1] === 'long_break',
            }
        )}>
            <View>
                <Settings sound2={player2} settingsObj={settingsObj} setSettingsObj={setSettingsObj} phaze={phaze} />
            </View>
            <View className='flex-1 justify-center items-center'>
                <PhazeStatus phaze={phaze} />
                <StepsCounter step={step} scenarioLength={scenario.length} />
                <CountdownTime settingsObj={settingsObj} pauseTrigger={pauseTrigger} step={step - 1} scenario={scenario} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
                <TimerControllers pauseTrigger={pauseTrigger} setPauseTrigger={setPauseTrigger} phaze={phaze} isPaused={isPaused} setIsPaused={setIsPaused} nextStep={stepChangeHandler} />
            </View>
        </SafeAreaView >
    )
}