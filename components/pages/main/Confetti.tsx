import React, { useMemo } from 'react'
import { Dimensions } from 'react-native'
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const PIECE_COUNT = 40
const COLORS = ['#FF4C4C', '#4DDA6E', '#4CACFF', '#FFD54C', '#B14CFF', '#FF8A4C']

interface PieceConfig {
    id: number
    x: number
    width: number
    height: number
    color: string
    rotation: number
    delay: number
    duration: number
    drift: number
}

function ConfettiPiece({ config, progress }: { config: PieceConfig, progress: SharedValue<number> }) {
    const style = useAnimatedStyle(() => {
        const localProgress = interpolate(
            progress.value,
            [config.delay, Math.min(1, config.delay + config.duration)],
            [0, 1],
            Extrapolation.CLAMP
        )
        const translateY = interpolate(localProgress, [0, 1], [-40, SCREEN_HEIGHT + 40])
        const translateX = config.x + Math.sin(localProgress * Math.PI * 2) * config.drift
        const rotate = `${config.rotation * localProgress}deg`
        const opacity = interpolate(localProgress, [0, 0.05, 0.92, 1], [0, 1, 1, 0])

        return {
            opacity,
            transform: [{ translateX }, { translateY }, { rotate }],
        }
    })

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: config.width,
                    height: config.height,
                    backgroundColor: config.color,
                    borderRadius: 2,
                },
                style,
            ]}
        />
    )
}

export default function Confetti({ progress }: { progress: SharedValue<number> }) {
    const pieces = useMemo<PieceConfig[]>(() => {
        return Array.from({ length: PIECE_COUNT }).map((_, i) => ({
            id: i,
            x: Math.random() * SCREEN_WIDTH,
            width: 6 + Math.random() * 6,
            height: 10 + Math.random() * 8,
            color: COLORS[i % COLORS.length],
            rotation: 360 + Math.random() * 720,
            delay: Math.random() * 0.35,
            duration: 0.55 + Math.random() * 0.45,
            drift: 15 + Math.random() * 35,
        }))
    }, [])

    return (
        <>
            {pieces.map((piece) => (
                <ConfettiPiece key={piece.id} config={piece} progress={progress} />
            ))}
        </>
    )
}
