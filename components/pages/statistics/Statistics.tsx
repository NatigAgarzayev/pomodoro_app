import clsx from 'clsx'
import { cssInterop } from 'nativewind'
import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Svg, { Path, Rect } from 'react-native-svg'
import { Bar, CartesianChart, Pie, PolarChart } from 'victory-native'

cssInterop(Svg, { className: 'style' })
cssInterop(Path, {
    className: {
        target: true,
        nativeStyleToProp: { fill: true, stroke: true },
    },
})

export default function Statistics({ phaze }: { phaze: string }) {
    const [openPanel, setOpenPanel] = useState(false)
    const [currentWeek, setCurrentWeek] = useState(0) // 0 = current week, -1 = last week, etc.
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

    // Function to get weekly data based on week offset
    const getWeeklyFocusData = (weekOffset: number) => {
        // Replace this with actual data fetching logic
        return Array.from({ length: 7 }, (_, i) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            minutes: Math.floor(Math.random() * 180) + 30,
        }))
    }

    const WEEKLY_FOCUS_DATA = getWeeklyFocusData(currentWeek)

    // Phase breakdown data (in minutes)
    const PHASE_DATA = [
        { label: 'Focus', value: 450, color: '#EF4444' },
        { label: 'Short Break', value: 180, color: '#10B981' },
        { label: 'Long Break', value: 90, color: '#3B82F6' },
    ]

    // Total cycles completed
    const totalCycles = 42

    // Get color based on phase
    const getPhaseColor = () => {
        switch (phaze) {
            case 'work': return '#EF4444'
            case 'short_break': return '#10B981'
            case 'long_break': return '#3B82F6'
            default: return '#EF4444'
        }
    }

    // Get week label
    const getWeekLabel = () => {
        if (currentWeek === 0) return 'This Week'
        if (currentWeek === -1) return 'Last Week'
        return `${Math.abs(currentWeek)} Weeks Ago`
    }

    const handlePreviousWeek = () => {
        setCurrentWeek(prev => prev - 1)
    }

    const handleNextWeek = () => {
        if (currentWeek < 0) {
            setCurrentWeek(prev => prev + 1)
        }
    }

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
                {/* Header */}
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

                {/* Total Cycles Card */}
                <View className='mx-6 mt-4 mb-6 p-6 bg-white rounded-2xl shadow-sm'>
                    <Text className='text-gray-500 text-sm mb-1'>Total Cycles Completed</Text>
                    <Text className={clsx(
                        'text-5xl font-bold',
                        {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }
                    )}>{totalCycles}</Text>
                    <Text className='text-gray-400 text-xs mt-1'>All time</Text>
                </View>

                {/* Weekly Focus Time Chart with Navigation */}
                <View className='mx-6 mb-6'>
                    <View className='flex-row items-center justify-between mb-3'>
                        <Text className={clsx(
                            'text-lg font-semibold',
                            {
                                'text-pink-primary': phaze === 'work',
                                'text-green-primary': phaze === 'short_break',
                                'text-blue-primary': phaze === 'long_break',
                            }
                        )}>Weekly Focus Time</Text>

                        {/* Week Navigation */}
                        <View className='flex-row items-center gap-3'>
                            <Pressable onPress={handlePreviousWeek} className='p-1'>
                                <Svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                >
                                    <Path d="m15 18-6-6 6-6" />
                                </Svg>
                            </Pressable>

                            <Text className='text-sm text-gray-600 min-w-24 text-center'>
                                {getWeekLabel()}
                            </Text>

                            <Pressable
                                onPress={handleNextWeek}
                                className='p-1'
                                disabled={currentWeek === 0}
                            >
                                <Svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work' && currentWeek < 0,
                                        'text-green-primary': phaze === 'short_break' && currentWeek < 0,
                                        'text-blue-primary': phaze === 'long_break' && currentWeek < 0,
                                        'text-gray-300': currentWeek === 0,
                                    })}
                                >
                                    <Path d="m9 18 6-6-6-6" />
                                </Svg>
                            </Pressable>
                        </View>
                    </View>

                    <View className='bg-white rounded-2xl p-4 shadow-sm' style={{ height: 280 }}>
                        <CartesianChart
                            data={WEEKLY_FOCUS_DATA}
                            xKey="day"
                            yKeys={["minutes"]}
                            padding={{ left: 10, right: 10, top: 10, bottom: 10 }}
                        >
                            {({ points, chartBounds }) => (
                                <Bar
                                    points={points.minutes}
                                    chartBounds={chartBounds}
                                    color={getPhaseColor()}
                                    roundedCorners={{ topLeft: 8, topRight: 8 }}
                                    barWidth={32}
                                />
                            )}
                        </CartesianChart>
                        <Text className='text-center text-gray-400 text-xs mt-2'>Minutes per day</Text>
                    </View>
                </View>

                {/* Phase Breakdown Pie Chart */}
                <View className='mx-6 mb-8'>
                    <Text className={clsx(
                        'text-lg font-semibold mb-3',
                        {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }
                    )}>Weekly Time Breakdown</Text>
                    <View className='bg-white rounded-2xl p-4 shadow-sm' style={{ height: 320 }}>
                        <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                            <PolarChart
                                data={PHASE_DATA}
                                labelKey="label"
                                valueKey="value"
                                colorKey="color"
                            >
                                <Pie.Chart innerRadius={50} />
                            </PolarChart>
                        </View>

                        {/* Legend */}
                        <View className='mt-4 space-y-2'>
                            {PHASE_DATA.map((item, index) => (
                                <View key={index} className='flex-row items-center justify-between'>
                                    <View className='flex-row items-center gap-2'>
                                        <View
                                            style={{ backgroundColor: item.color }}
                                            className='w-3 h-3 rounded-full'
                                        />
                                        <Text className='text-gray-700 text-sm'>{item.label}</Text>
                                    </View>
                                    <Text className='text-gray-500 text-sm font-medium'>
                                        {item.value} min
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

            </Animated.ScrollView>
        </>
    )
}