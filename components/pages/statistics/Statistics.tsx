import clsx from 'clsx'
import { cssInterop } from 'nativewind'
import React, { useState, useMemo, useEffect } from 'react'
import { Alert, BackHandler, Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Svg, { Path, Rect } from 'react-native-svg'
import { Bar, CartesianChart, Pie, PolarChart } from 'victory-native'
import { useStatisticsStore } from '@/stores/statisticsStore'
import { useDoubleBackExit } from '@/hooks/useDoubleBackExit'
import inter from "../../../assets/inter-medium.ttf"
import { useFont } from '@shopify/react-native-skia'
import { Text as SkiaText } from '@shopify/react-native-skia'
import CustomBar from './CustomBar'

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
    const handleDoubleBackExit = useDoubleBackExit()
    const font = useFont(inter, 12)

    // Get statistics from store
    const { totalCycles, getWeeklyData, getWeeklyTimeByPhase, resetStatistics } = useStatisticsStore()

    const handleButtonPress = () => {
        if (openPanel) {
            translateX.value = withTiming(100, { duration: 300 })
            setOpenPanel(false)
        } else {
            translateX.value = withTiming(0, { duration: 300 })
            setOpenPanel(true)
        }
    }

    useEffect(() => {
        const backAction = () => {
            if (openPanel) {
                handleButtonPress()
            } else {
                handleDoubleBackExit()
            }
            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        )

        return () => backHandler.remove()
    }, [handleButtonPress, handleDoubleBackExit, openPanel])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: `${translateX.value}%` }],
        }
    })

    // Get weekly data for bar chart
    const WEEKLY_FOCUS_DATA = useMemo(() => {
        const weeklyData = getWeeklyData(currentWeek)
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        return weeklyData.days.map((day, index) => ({
            day: dayNames[index],
            minutes: day.work, // Only show work/focus time
        }))
    }, [currentWeek, getWeeklyData])

    // Get phase breakdown for pie chart
    const PHASE_DATA = useMemo(() => {
        const phaseTime = getWeeklyTimeByPhase(currentWeek)

        return [
            { label: 'Focus', value: phaseTime.work, color: '#EF4444' },
            { label: 'Short Break', value: phaseTime.short_break, color: '#10B981' },
            { label: 'Long Break', value: phaseTime.long_break, color: '#3B82F6' },
        ]
    }, [currentWeek, getWeeklyTimeByPhase])

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

    const handleReset = () => {
        Alert.alert(
            "Reset Statistics",
            "Are you sure you want to delete all statistics? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => resetStatistics()
                }
            ]
        )
    }

    // Calculate total time for the week
    const totalWeekTime = useMemo(() => {
        return PHASE_DATA.reduce((sum, phase) => sum + phase.value, 0)
    }, [PHASE_DATA])

    // Format minutes to hours and minutes
    const formatTime = (minutes: number) => {
        if (minutes === 0) return '0m'
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours === 0) return `${mins}m`
        if (mins === 0) return `${hours}h`
        return `${hours}h ${mins}m`
    }

    // console.log("WEEKLY_FOCUS_DATA", WEEKLY_FOCUS_DATA)

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
                    'shadow-lg px-4 w-full h-screen absolute top-0 z-50 right-0',
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
                        'flex-row items-center gap-2 justify-start pt-6 pb-3',
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
                <View>
                    <Text className={clsx(
                        'text-lg font-semibold',
                        {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }
                    )}>Total Cycles Completed</Text>
                    <View
                        className={clsx('mt-2 mb-6 p-6 rounded-2xl',
                            {
                                'bg-pink-secondary': phaze === 'work',
                                'bg-green-secondary': phaze === 'short_break',
                                'bg-blue-secondary': phaze === 'long_break',
                            }
                        )}
                    >
                        <Text className={clsx(
                            'text-5xl font-bold',
                            {
                                'text-pink-primary': phaze === 'work',
                                'text-green-primary': phaze === 'short_break',
                                'text-blue-primary': phaze === 'long_break',
                            }
                        )}>{totalCycles}</Text>
                    </View>
                </View>

                {/* Weekly Focus Time Chart with Navigation */}
                <View className='mb-6'>
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

                            <Text
                                className={clsx(
                                    'text-sm min-w-24 text-center',
                                    {
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    }
                                )}
                            >
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

                    <View
                        className={clsx(
                            'rounded-',
                            {
                                'bg-pink-secondary': phaze === 'work',
                                'bg-green-secondary': phaze === 'short_break',
                                'bg-blue-secondary': phaze === 'long_break',
                            }
                        )}
                        style={{ height: 280 }}>
                        {WEEKLY_FOCUS_DATA.some(d => d.minutes > 0) ? (
                            <>
                                <CartesianChart
                                    data={WEEKLY_FOCUS_DATA}
                                    xKey="day"
                                    yKeys={["minutes"]}
                                    padding={{ left: 20, right: 20, top: 20, bottom: 30 }}
                                    domainPadding={{ left: 20, right: 20, top: 20 }}
                                    axisOptions={{ font, labelColor: getPhaseColor() }}
                                >
                                    {({ points, chartBounds }) => (
                                        <>
                                            <CustomBar points={points.minutes} chartBounds={chartBounds} color={getPhaseColor()} />
                                            {/* Labels on top of bars */}
                                            {points.minutes.map((point, index) => {
                                                const value = WEEKLY_FOCUS_DATA[index].minutes
                                                if (value === 0) return null

                                                const text = String(value)
                                                const textWidth = font?.measureText(text).width || 0

                                                return (
                                                    <SkiaText
                                                        key={index}
                                                        x={point.x - textWidth / 2}
                                                        y={point.y - 4}
                                                        text={text}
                                                        font={font}
                                                        color={getPhaseColor()}
                                                    />
                                                )
                                            })}
                                        </>
                                    )}
                                </CartesianChart>
                            </>
                        ) : (
                            <View className='flex-1 items-center justify-center'>
                                <Text className='text-gray-400 text-center'>No data for this week</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Phase Breakdown Pie Chart */}
                <View className='mb-8'>
                    <Text className={clsx(
                        'text-lg font-semibold mb-3',
                        {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }
                    )}>Weekly Time Breakdown</Text>
                    <View
                        className={clsx(
                            'rounded-2xl p-4 pt-6',
                            {
                                'bg-pink-secondary': phaze === 'work',
                                'bg-green-secondary': phaze === 'short_break',
                                'bg-blue-secondary': phaze === 'long_break',
                            }
                        )}
                        style={{ height: 320 }}>
                        {totalWeekTime > 0 ? (
                            <>
                                <View style={{ height: 200, width: '100%' }}>
                                    <PolarChart
                                        data={PHASE_DATA.filter(d => d.value > 0)}
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
                                                <Text
                                                    className={clsx(
                                                        'text-sm',
                                                        {
                                                            'text-pink-primary': phaze === 'work',
                                                            'text-green-primary': phaze === 'short_break',
                                                            'text-blue-primary': phaze === 'long_break',
                                                        }
                                                    )}
                                                >{item.label}</Text>
                                            </View>
                                            <Text
                                                className={clsx(
                                                    'text-sm font-medium',
                                                    {
                                                        'text-pink-primary': phaze === 'work',
                                                        'text-green-primary': phaze === 'short_break',
                                                        'text-blue-primary': phaze === 'long_break',
                                                    }
                                                )}>
                                                {formatTime(item.value)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : (
                            <View className='flex-1 items-center justify-center'>
                                <Text className='text-gray-400 text-center'>No data for this week</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Pressable onPress={handleReset} className={clsx('w-full h-12 flex justify-center items-center rounded-3xl mb-6',
                    {
                        'bg-pink-button': phaze === 'work',
                        'bg-green-button': phaze === 'short_break',
                        'bg-blue-button': phaze === 'long_break',
                    }
                )}>
                    <Text className={clsx(
                        'text-lg font-semibold',
                        {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }
                    )}>Reset All Statistics</Text>
                </Pressable>
            </Animated.ScrollView >
        </>
    )
}