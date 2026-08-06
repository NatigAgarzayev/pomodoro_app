import React, { useEffect } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import clsx from 'clsx'
import { useThemeStore } from '@/stores/themeStore'
import Confetti from './Confetti'

interface CelebrationProps {
    visible: boolean
    totalFocusSeconds: number
    phaze: string
    onClose: () => void
}

interface PhazeColors {
    primary: string
    secondary: string
    button: string
}

const LIGHT_PRIMARY: Record<string, string> = {
    work: '#471515',
    short_break: '#14401d',
    long_break: '#153047',
}

const DARK_PRIMARY: Record<string, string> = {
    work: '#fff2f2',
    short_break: '#f2fff5',
    long_break: '#f2f9ff',
}

const SECONDARY: Record<string, string> = {
    work: 'rgba(255,76,76,.25)',
    short_break: 'rgba(77,218,110,.25)',
    long_break: 'rgba(76,172,255,.25)',
}

const BUTTON: Record<string, string> = {
    work: 'rgba(255,76,76,.71)',
    short_break: 'rgba(77,218,110,.62)',
    long_break: 'rgba(76,172,255,.62)',
}

function getPhazeColors(phaze: string, theme: string): PhazeColors {
    const primary = (theme === 'dark' ? DARK_PRIMARY : LIGHT_PRIMARY)[phaze] ?? LIGHT_PRIMARY.work
    return {
        primary,
        secondary: SECONDARY[phaze] ?? SECONDARY.work,
        button: BUTTON[phaze] ?? BUTTON.work,
    }
}

function formatFocusTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function MedalIcon({ colors }: { colors: PhazeColors }) {
    return (
        <Svg width="120" height="140" viewBox="0 0 120 140">
            <Path fill={colors.button} d="M35 8 L55 72 L35 66 L18 18 Z" />
            <Path fill={colors.button} d="M85 8 L65 72 L85 66 L102 18 Z" />
            <Circle cx="60" cy="90" r="38" fill={colors.button} />
            <Circle cx="60" cy="90" r="29" fill={colors.secondary} />
            <Path
                fill={colors.primary}
                d="M60 72 L65.5 84.5 L79 86 L69 95 L72 108.5 L60 101.5 L48 108.5 L51 95 L41 86 L54.5 84.5 Z"
            />
        </Svg>
    )
}

export default function Celebration({ visible, totalFocusSeconds, phaze, onClose }: CelebrationProps) {
    const theme = useThemeStore(state => state.theme)
    const progress = useSharedValue(0)
    const colors = getPhazeColors(phaze, theme)

    useEffect(() => {
        if (visible) {
            progress.value = 0
            progress.value = withTiming(1, { duration: 2800 })
        }
    }, [visible])

    return (
        <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
            <View className={clsx('flex-1 items-center justify-center px-8', {
                'bg-pink-wall': phaze === 'work',
                'bg-green-wall': phaze === 'short_break',
                'bg-blue-wall': phaze === 'long_break',
            })}>
                {visible && <Confetti progress={progress} />}

                <MedalIcon colors={colors} />

                <Text style={{ color: colors.primary }} className="text-3xl font-bold mt-6">
                    Congrats!
                </Text>

                <Text style={{ color: colors.primary, opacity: 0.7 }} className="text-base mt-2 mb-8">
                    You completed a full cycle
                </Text>

                <View
                    style={{ backgroundColor: colors.secondary }}
                    className="rounded-2xl px-10 py-5 items-center mb-10"
                >
                    <Text style={{ color: colors.primary, opacity: 0.7 }} className="text-sm font-medium">
                        Total focus time
                    </Text>
                    <Text style={{ color: colors.primary }} className="text-4xl font-bold mt-1">
                        {formatFocusTime(totalFocusSeconds)}
                    </Text>
                </View>

                <Pressable
                    onPress={onClose}
                    style={{ backgroundColor: colors.button }}
                    className="w-full h-14 rounded-3xl items-center justify-center"
                >
                    <Text style={{ color: colors.primary }} className="text-lg font-semibold">
                        Back to Start
                    </Text>
                </Pressable>
            </View>
        </Modal>
    )
}
