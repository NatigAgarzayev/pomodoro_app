import { View, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Svg, { Rect, Path, G } from 'react-native-svg'
import clsx from 'clsx'
import { cssInterop } from 'nativewind'
import * as Haptics from 'expo-haptics'
import { useSettingsStore } from '@/stores/settingsStore'
import { useLofiPlayer } from '@/hooks/useLofiPlayer'

cssInterop(Svg, { className: 'style' })
cssInterop(Path, {
    className: {
        target: true,
        nativeStyleToProp: { fill: true, stroke: true },
    },
})

interface TimerControllersProps {
    pauseTrigger: boolean,
    setPauseTrigger: (value: boolean) => void,
    isPaused: boolean,
    setIsPaused: (value: boolean) => void,
    nextStep: () => void,
    phaze: string,
}

export default function TimerControllers({ pauseTrigger, setPauseTrigger, phaze, isPaused, setIsPaused, nextStep }: TimerControllersProps) {
    const [isDisabled, setIsDisabled] = useState(false)
    const { settings } = useSettingsStore()
    const [musicHasStarted, setMusicHasStarted] = useState(false)
    const { player: player2, didJustFinish, playing } = useLofiPlayer()

    useEffect(() => {
        if (settings.sound === 'System') {
            Haptics.selectionAsync()
        }
        if (settings.lofi === 'Off') return
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
        if (settings.lofi === 'Off') return
        if (didJustFinish) {
            player2.seekTo(0)
            player2.play()
        }
    }, [didJustFinish])

    useEffect(() => {
        if (settings.lofi === "Off") {
            player2.pause()
        }
    }, [settings.lofi])

    const handleNextStep = () => {
        nextStep()
        setIsDisabled(true)
        if (settings.sound === "System") {
            Haptics.selectionAsync()
        }
        setTimeout(() => setIsDisabled(false), 1000)
    }

    return (
        <View className='flex-row items-center gap-4 mt-8'>
            <Pressable onPress={() => setPauseTrigger(!pauseTrigger)} className={clsx('w-20 h-20 flex justify-center items-center rounded-3xl',
                {
                    'bg-pink-secondary': phaze === 'work',
                    'bg-green-secondary': phaze === 'short_break',
                    'bg-blue-secondary': phaze === 'long_break',
                }
            )}>
                <Svg className={clsx({
                    'text-pink-primary': phaze === 'work',
                    'text-green-primary': phaze === 'short_break',
                    'text-blue-primary': phaze === 'long_break',
                })} width="35px" height="35px" viewBox="0 0 24 24">
                    <G stroke="none" id="Page-1" fill="none" fillRule="evenodd">
                        <G id="Reload">
                            <Rect id="Rectangle" fillRule="nonzero" x="0" y="0" width="24" height="24"></Rect>
                            <Path stroke="currentColor" d="M4,13 C4,17.4183 7.58172,21 12,21 C16.4183,21 20,17.4183 20,13 C20,8.58172 16.4183,5 12,5 C10.4407,5 8.98566,5.44609 7.75543,6.21762" id="Path" strokeWidth="2" strokeLinecap="round"></Path>
                            <Path stroke="currentColor" d="M9.2384,1.89795 L7.49856,5.83917 C7.27552,6.34441 7.50429,6.9348 8.00954,7.15784 L11.9508,8.89768" id="Path" strokeWidth="2" strokeLinecap="round"></Path>
                        </G>
                    </G>
                </Svg>
            </Pressable>
            <Pressable onPress={() => setIsPaused(!isPaused)} className={clsx('w-24 h-24 flex justify-center items-center rounded-3xl',
                {
                    'bg-pink-button': phaze === 'work',
                    'bg-green-button': phaze === 'short_break',
                    'bg-blue-button': phaze === 'long_break',
                }
            )}>
                {
                    isPaused ?
                        <Svg className={clsx({
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        })} width="22px" height="26px" viewBox="0 0 22 26">
                            <Path fill="currentColor" d="M22 13C21.9992 13.3439 21.9104 13.6818 21.7419 13.9816C21.5734 14.2814 21.3309 14.533 21.0375 14.7125L3.03749 25.7C2.73766 25.89 2.3914 25.9939 2.0365 26.0006C1.68159 26.0072 1.33169 25.9162 1.02499 25.7375C0.713758 25.5667 0.454302 25.3152 0.273924 25.0095C0.093547 24.7037 -0.00108208 24.355 -6.18584e-06 24V1.99996C-0.00108208 1.64496 0.093547 1.29623 0.273924 0.990471C0.454302 0.684709 0.713758 0.433218 1.02499 0.26246C1.33169 0.0837584 1.68159 -0.00725329 2.0365 -0.000640198C2.3914 0.00597289 2.73766 0.109956 3.03749 0.29996L21.0375 11.2875C21.3309 11.4669 21.5734 11.7185 21.7419 12.0183C21.9104 12.3181 21.9992 12.6561 22 13Z" />
                        </Svg> :
                        <Svg className={clsx({
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        })} width="22px" height="26px" viewBox="0 0 22 26">
                            <Path fill="currentColor" d="M22 2V22C22 22.5304 21.7893 23.0391 21.4142 23.4142C21.0391 23.7893 20.5304 24 20 24H15.5C14.9696 24 14.4609 23.7893 14.0858 23.4142C13.7107 23.0391 13.5 22.5304 13.5 22V2C13.5 1.46957 13.7107 0.960859 14.0858 0.585786C14.4609 0.210714 14.9696 0 15.5 0H20C20.5304 0 21.0391 0.210714 21.4142 0.585786C21.7893 0.960859 22 1.46957 22 2ZM6.5 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V22C0 22.5304 0.210714 23.0391 0.585786 23.4142C0.960859 23.7893 1.46957 24 2 24H6.5C7.03043 24 7.53914 23.7893 7.91421 23.4142C8.28929 23.0391 8.5 22.5304 8.5 22V2C8.5 1.46957 8.28929 0.960859 7.91421 0.585786C7.53914 0.210714 7.03043 0 6.5 0Z" />
                        </Svg>
                }
            </Pressable>
            <Pressable
                disabled={isDisabled}
                onPress={handleNextStep}
                className={clsx('w-20 h-20 flex justify-center items-center rounded-3xl',
                    {
                        'bg-pink-secondary': phaze === 'work',
                        'bg-green-secondary': phaze === 'short_break',
                        'bg-blue-secondary': phaze === 'long_break',
                    }
                )}>
                <Svg className={clsx({
                    'text-pink-primary': phaze === 'work',
                    'text-green-primary': phaze === 'short_break',
                    'text-blue-primary': phaze === 'long_break',
                })} width="30px" height="20px" viewBox="0 0 24 24">
                    <Path fill="currentColor" d="M29.65 10.0001C29.6515 10.3353 29.5687 10.6656 29.4093 10.9604C29.2498 11.2553 29.0188 11.5054 28.7375 11.6876L17.5875 18.8501C17.2849 19.0462 16.935 19.1568 16.5747 19.1703C16.2144 19.1837 15.8571 19.0995 15.5408 18.9266C15.2244 18.7537 14.9607 18.4985 14.7774 18.188C14.5942 17.8774 14.4984 17.5232 14.5 17.1626V11.8376L3.58749 18.8501C3.28491 19.0462 2.93496 19.1568 2.57467 19.1703C2.21438 19.1837 1.85714 19.0995 1.54077 18.9266C1.2244 18.7537 0.960655 18.4985 0.777442 18.188C0.594229 17.8774 0.498364 17.5232 0.49999 17.1626V2.83763C0.498364 2.47709 0.594229 2.12282 0.777442 1.8123C0.960655 1.50177 1.2244 1.24655 1.54077 1.07364C1.85714 0.900722 2.21438 0.816543 2.57467 0.830009C2.93496 0.843475 3.28491 0.954083 3.58749 1.15013L14.5 8.16263V2.83763C14.4984 2.47709 14.5942 2.12282 14.7774 1.8123C14.9607 1.50177 15.2244 1.24655 15.5408 1.07364C15.8571 0.900722 16.2144 0.816543 16.5747 0.830009C16.935 0.843475 17.2849 0.954083 17.5875 1.15013L28.7375 8.31263C29.0188 8.4949 29.2498 8.74496 29.4093 9.03983C29.5687 9.3347 29.6515 9.66492 29.65 10.0001Z" />
                </Svg>
            </Pressable>
        </View>
    )
}