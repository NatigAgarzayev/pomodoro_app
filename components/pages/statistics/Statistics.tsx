import clsx from 'clsx'
import { cssInterop } from 'nativewind'
import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Svg, { Path, Rect } from 'react-native-svg'
// import { CartesianChart, Line } from 'victory-native'
cssInterop(Svg, { className: 'style' })
cssInterop(Path, {
    className: {
        target: true,
        nativeStyleToProp: { fill: true, stroke: true },
    },
})

export default function Statistics({ phaze }: { phaze: string }) {
    const [openPanel, setOpenPanel] = useState(false)
    const translateX = useSharedValue(100)
    const handleButtonPress = () => {
        if (openPanel) {
            translateX.value = withTiming(100, { duration: 300 })
            setOpenPanel(false)
        } else {
            translateX.value = withTiming(0, { duration: 300 })
            setOpenPanel(true)
        }
    }
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: `${translateX.value}%` }],
        }
    })

    const DATA = Array.from({ length: 31 }, (_, i) => ({
        day: i,
        highTmp: 40 + 30 * Math.random(),
    }));

    return (
        <>
            <Pressable
                onPress={handleButtonPress}
                className='absolute left-2 top-0 p-4 rounded-full'
            >
                <Svg
                    className={clsx({
                        'text-pink-primary': phaze === 'work',
                        'text-green-primary': phaze === 'short_break',
                        'text-blue-primary': phaze === 'long_break',
                    })}
                    width="30px"
                    height="28px"
                    viewBox="0 0 24 24"
                >
                    <Rect fill="currentColor" x="4" y="15" width="5" height="6" rx="2" />
                    <Rect fill="currentColor" x="10" y="9" width="5" height="12" rx="2" />
                    <Rect fill="currentColor" x="16" y="3" width="5" height="18" rx="2" />
                </Svg>
            </Pressable>
            <Animated.ScrollView
                style={[animatedStyle]}
                className={clsx(
                    'shadow-lg w-full h-screen absolute top-0 z-50 right-0',
                    {
                        'bg-pink-wall': phaze === 'work',
                        'bg-green-wall': phaze === 'short_break',
                        'bg-blue-wall': phaze === 'long_break',
                    }
                )}
                stickyHeaderIndices={[0]}
            >
                <View
                    className={clsx(
                        'flex-row items-center gap-2 justify-start px-6 pt-6 pb-3',
                        {
                            'bg-pink-wall': phaze === 'work',
                            'bg-green-wall': phaze === 'short_break',
                            'bg-blue-wall': phaze === 'long_break',
                        }
                    )}>
                    <Pressable className='w-8' onPress={handleButtonPress}>
                        <Svg className={clsx({
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        })} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <Path d="m15 18-6-6 6-6" />
                        </Svg>
                    </Pressable>
                    <Text className={clsx(
                        'text-2xl font-bold',
                        {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }
                    )}>Statistics</Text>
                </View>
                <View style={{ height: 300 }}>
                    {/* <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]}>
                        {({ points }) => (
                            <Line points={points.highTmp} color="red" strokeWidth={3} />
                        )}
                    </CartesianChart> */}
                </View>

            </Animated.ScrollView>
        </>
    )
}
