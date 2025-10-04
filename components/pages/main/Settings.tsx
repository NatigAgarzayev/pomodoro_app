import React, { useState, useRef, useEffect, useCallback } from 'react'
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import clsx from 'clsx'
import { cssInterop, useColorScheme } from 'nativewind'
import { ColorSchemeName, Pressable, Text, View } from 'react-native'
import { SegmentedControl, SegmentItem } from '@/components/ui/segment-control/SegmentControl'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance } from 'react-native'
import { QUICK_TIMES } from '@/constants/DurationConstants'
import { Picker } from '@react-native-picker/picker'
import { Platform } from 'react-native'
import { defaultSettings, SETTINGS_KEY, SettingsType } from '@/constants/SettingsConstants'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'

cssInterop(Svg, { className: 'style' })
cssInterop(Path, {
    className: {
        target: true,
        nativeStyleToProp: { fill: true, stroke: true },
    },
})

function Settings({ sound2, phaze }: { sound2: any, phaze: string }) {
    const [openPanel, setOpenPanel] = useState(false)
    const translateX = useSharedValue(100)
    const { theme } = useThemeStore(state => state)
    const { settings, updateSetting } = useSettingsStore()

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: `${translateX.value}%` }],
        };
    });

    const handleThemeChange = (theme: string) => {
        updateSetting('theme', theme as SettingsType['theme'])
    }

    const handleLofiChange = (lofi: string) => {
        if (lofi === 'Off') {
            sound2.pause()
        }
        updateSetting('lofi', lofi as SettingsType['lofi'])
    }

    const handleSoundChange = (sound: string) => {
        if (sound === 'System') {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            )
        }
        updateSetting('sound', sound as SettingsType['sound'])
    }

    const handleFocusDurationChange = (duration: number) => {
        updateSetting('focusDuration', duration)
    }

    const handleShortBreakDurationChange = (duration: number) => {
        updateSetting('shortBreakDuration', duration)
    }

    const handleLongBreakDurationChange = (duration: number) => {
        updateSetting('longBreakDuration', duration)
    }

    const handleSkipHandler = (skip: string) => {
        updateSetting('skip', skip as SettingsType['skip'])
    }

    const handleButtonPress = () => {
        if (openPanel) {
            translateX.value = withTiming(100, { duration: 300 });
            setOpenPanel(false);
        } else {
            translateX.value = withTiming(0, { duration: 300 });
            setOpenPanel(true);
        }
    }

    // Use settings from the store instead of props
    const currentSettings = settings

    return (
        <>
            <Pressable
                onPress={handleButtonPress}
                className='absolute right-2 top-0 p-4 rounded-full'
            >
                <Svg
                    className={clsx({
                        'text-pink-primary': phaze === 'work',
                        'text-green-primary': phaze === 'short_break',
                        'text-blue-primary': phaze === 'long_break',
                    })}
                    width="30px"
                    height="28px"
                    viewBox="0 0 30 28"
                >
                    <Path fill="currentColor" d="M28.6876 11.0375C28.6565 10.8977 28.5958 10.7662 28.5095 10.6519C28.4233 10.5376 28.3135 10.4432 28.1876 10.375L25.2126 8.72498C25.0531 8.4016 24.8736 8.08849 24.6751 7.78748L24.7376 4.38748C24.7387 4.24487 24.7104 4.10356 24.6545 3.97236C24.5986 3.84117 24.5162 3.72291 24.4126 3.62498C22.9313 2.28193 21.1795 1.27177 19.2751 0.662477C19.1383 0.619833 18.994 0.606696 18.8518 0.623934C18.7096 0.641173 18.5727 0.688393 18.4501 0.762477L15.5376 2.51248C15.1751 2.49998 14.8251 2.49998 14.4626 2.51248L11.5501 0.762477C11.4274 0.688393 11.2905 0.641173 11.1483 0.623934C11.0061 0.606696 10.8618 0.619833 10.7251 0.662477C8.81814 1.27224 7.0656 2.28709 5.58756 3.63748C5.48298 3.73204 5.39987 3.84791 5.34381 3.97727C5.28775 4.10664 5.26005 4.24651 5.26256 4.38748L5.32506 7.78748C5.12506 8.08748 4.95006 8.39998 4.77506 8.72498L1.80005 10.375C1.67596 10.4439 1.56817 10.5387 1.48404 10.6531C1.39992 10.7674 1.34142 10.8985 1.31255 11.0375C0.887514 12.9896 0.887514 15.0103 1.31255 16.9625C1.3436 17.1023 1.40431 17.2338 1.49057 17.3481C1.57684 17.4623 1.68664 17.5568 1.81255 17.625L4.78756 19.275C4.94704 19.5984 5.12655 19.9115 5.32506 20.2125L5.26256 23.6125C5.26141 23.7551 5.28968 23.8964 5.3456 24.0276C5.40152 24.1588 5.48389 24.277 5.58756 24.375C7.06885 25.718 8.82065 26.7282 10.7251 27.3375C10.8618 27.3801 11.0061 27.3933 11.1483 27.376C11.2905 27.3588 11.4274 27.3116 11.5501 27.2375L14.4626 25.4875H15.5376L18.4626 27.2375C18.6146 27.3375 18.7931 27.3897 18.9751 27.3875C19.0767 27.3831 19.1775 27.3663 19.2751 27.3375C21.182 26.7277 22.9345 25.7129 24.4126 24.3625C24.5171 24.2679 24.6002 24.1521 24.6563 24.0227C24.7124 23.8933 24.7401 23.7534 24.7376 23.6125L24.6751 20.2125C24.8751 19.9125 25.0501 19.6 25.2251 19.275L28.2001 17.625C28.3242 17.5561 28.4319 17.4612 28.5161 17.3469C28.6002 17.2326 28.6587 17.1015 28.6876 16.9625C29.1126 15.0103 29.1126 12.9896 28.6876 11.0375ZM15.0001 19.5C13.9123 19.5 12.8489 19.1774 11.9444 18.5731C11.04 17.9687 10.335 17.1097 9.91872 16.1047C9.50244 15.0997 9.39352 13.9939 9.60574 12.927C9.81796 11.8601 10.3418 10.8801 11.111 10.1109C11.8802 9.3417 12.8602 8.81788 13.9271 8.60566C14.994 8.39344 16.0998 8.50236 17.1048 8.91864C18.1098 9.33492 18.9688 10.0399 19.5731 10.9443C20.1775 11.8488 20.5001 12.9122 20.5001 14C20.5001 15.4587 19.9206 16.8576 18.8891 17.8891C17.8577 18.9205 16.4587 19.5 15.0001 19.5Z" />
                </Svg>
            </Pressable>

            <Animated.View
                style={[animatedStyle]}
                className={clsx(
                    'shadow-lg w-full h-screen absolute top-0 z-50 right-0',
                    {
                        'bg-pink-wall': phaze === 'work',
                        'bg-green-wall': phaze === 'short_break',
                        'bg-blue-wall': phaze === 'long_break',
                    }
                )}
            >
                <View className='flex-row items-center gap-2 justify-start px-6 pt-6'>
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
                    )}>Settings</Text>
                </View>

                <View className='p-6'>
                    <View>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Theme:</Text>
                        <SegmentedControl
                            selectedValue={currentSettings.theme}
                            onValueChange={handleThemeChange}
                            phaze={phaze}
                            className="mt-2"
                        >
                            <SegmentItem value="System">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Rect stroke="currentColor" width="14" height="20" x="5" y="2" rx="2" ry="2" /><Path stroke="currentColor" d="M12 18h.01" />
                                </Svg>
                            </SegmentItem>
                            <SegmentItem value="Light">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Circle stroke="currentColor" cx="12" cy="12" r="4" /><Path stroke="currentColor" d="M12 2v2" /><Path stroke="currentColor" d="M12 20v2" /><Path stroke="currentColor" d="m4.93 4.93 1.41 1.41" /><Path stroke="currentColor" d="m17.66 17.66 1.41 1.41" /><Path stroke="currentColor" d="M2 12h2" /><Path stroke="currentColor" d="M20 12h2" /><Path stroke="currentColor" d="m6.34 17.66-1.41 1.41" /><Path stroke="currentColor" d="m19.07 4.93-1.41 1.41" />
                                </Svg>
                            </SegmentItem>
                            <SegmentItem value="Dark">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary dark:text-white': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Path stroke="currentColor" d="M18 5h4" /><Path stroke="currentColor" d="M20 3v4" /><Path stroke="currentColor" d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                                </Svg>
                            </SegmentItem>
                        </SegmentedControl>
                    </View>

                    <View className='mt-4'>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Lo-Fi:</Text>
                        <SegmentedControl
                            selectedValue={currentSettings.lofi}
                            onValueChange={handleLofiChange}
                            phaze={phaze}
                            className="mt-2"
                        >
                            <SegmentItem value="Off">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Path stroke="currentColor" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><Line stroke="currentColor" x1="22" x2="16" y1="9" y2="15" /><Line stroke="currentColor" x1="16" x2="22" y1="9" y2="15" />
                                </Svg>
                            </SegmentItem>
                            <SegmentItem value="On">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Path stroke="currentColor" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><Path stroke="currentColor" d="M16 9a5 5 0 0 1 0 6" /><Path stroke="currentColor" d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                                </Svg>
                            </SegmentItem>
                        </SegmentedControl>
                    </View>

                    <View className='mt-4'>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Sound:</Text>
                        <SegmentedControl
                            selectedValue={currentSettings.sound}
                            onValueChange={handleSoundChange}
                            phaze={phaze}
                            className="mt-2"
                        >
                            <SegmentItem value="System">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Path stroke="currentColor" d="m2 8 2 2-2 2 2 2-2 2" /><Path stroke="currentColor" d="m22 8-2 2 2 2-2 2 2 2" /><Rect stroke="currentColor" width="8" height="14" x="8" y="5" rx="1" />
                                </Svg>
                            </SegmentItem>
                            <SegmentItem value="Off">
                                <Svg
                                    className={clsx({
                                        'text-pink-primary': phaze === 'work',
                                        'text-green-primary': phaze === 'short_break',
                                        'text-blue-primary': phaze === 'long_break',
                                    })}
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Path stroke="currentColor" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><Line stroke="currentColor" x1="22" x2="16" y1="9" y2="15" /><Line stroke="currentColor" x1="16" x2="22" y1="9" y2="15" />
                                </Svg>
                            </SegmentItem>
                            {/*  <SegmentItem value="On">
                                    <Svg
                                        className={clsx({
                                            'text-pink-primary': phaze === 'work',
                                            'text-green-primary': phaze === 'short_break',
                                            'text-blue-primary': phaze === 'long_break',
                                        })}
                                        width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <Path stroke="currentColor" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><Path stroke="currentColor" d="M16 9a5 5 0 0 1 0 6" /><Path stroke="currentColor" d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                                    </Svg>
                                </SegmentItem> */}
                        </SegmentedControl>
                    </View>
                    <View className='mt-4'>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Skip steps:</Text>
                        <SegmentedControl
                            selectedValue={currentSettings.skip}
                            onValueChange={handleSkipHandler}
                            phaze={phaze}
                            className="mt-2"
                        >
                            <SegmentItem value="Manual">
                                <Text
                                    className={clsx(
                                        'text-lg font-bold',
                                        {
                                            'text-pink-primary': phaze === 'work',
                                            'text-green-primary': phaze === 'short_break',
                                            'text-blue-primary': phaze === 'long_break',
                                        })}>
                                    Manual
                                </Text>
                            </SegmentItem>
                            <SegmentItem value="Auto">
                                <Text
                                    className={clsx(
                                        'text-lg font-bold',
                                        {
                                            'text-pink-primary': phaze === 'work',
                                            'text-green-primary': phaze === 'short_break',
                                            'text-blue-primary': phaze === 'long_break',
                                        })}>
                                    Auto
                                </Text>
                            </SegmentItem>
                        </SegmentedControl>
                    </View>
                    <View className='mt-4'>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Focust time:</Text>
                        <View className={clsx(
                            'border rounded-full mt-2 overflow-hidden',
                            {
                                'border-pink-secondary bg-pink-secondary': phaze === 'work',
                                'border-green-secondary bg-green-secondary': phaze === 'short_break',
                                'border-blue-secondary bg-blue-secondary': phaze === 'long_break',
                            }
                        )}>

                            <Picker
                                selectedValue={currentSettings.focusDuration}
                                onValueChange={(itemValue) => handleFocusDurationChange(itemValue)}
                                style={{
                                    marginLeft: 7,
                                    color: theme === 'dark' ? '#ffffff' : (
                                        phaze === 'work'
                                            ? '#471515'
                                            : phaze === 'short_break'
                                                ? '#14401d'
                                                : '#153047'
                                    )
                                }}
                                itemStyle={Platform.OS === 'ios' ? {
                                    marginLeft: 7,
                                    color: theme === 'dark' ? '#ffffff' : (
                                        phaze === 'work'
                                            ? '#471515'
                                            : phaze === 'short_break'
                                                ? '#14401d'
                                                : '#153047'
                                    )
                                } : undefined}
                            >
                                {QUICK_TIMES.map((time) => (
                                    <Picker.Item
                                        key={time.value}
                                        label={time.label}
                                        value={time.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View className='mt-4'>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Short break time:</Text>
                        <View className={clsx(
                            'border rounded-full mt-2 overflow-hidden',
                            {
                                'border-pink-secondary bg-pink-secondary': phaze === 'work',
                                'border-green-secondary bg-green-secondary': phaze === 'short_break',
                                'border-blue-secondary bg-blue-secondary': phaze === 'long_break',
                            }
                        )}>

                            <Picker
                                selectedValue={currentSettings.shortBreakDuration}
                                onValueChange={(itemValue) => handleShortBreakDurationChange(itemValue)}
                                style={{
                                    marginLeft: 7,
                                    color: theme === 'dark' ? '#ffffff' : (
                                        phaze === 'work'
                                            ? '#471515'
                                            : phaze === 'short_break'
                                                ? '#14401d'
                                                : '#153047'
                                    )
                                }}
                                itemStyle={Platform.OS === 'ios' ? {
                                    marginLeft: 7,
                                    color: theme === 'dark' ? '#ffffff' : (
                                        phaze === 'work'
                                            ? '#471515'
                                            : phaze === 'short_break'
                                                ? '#14401d'
                                                : '#153047'
                                    )
                                } : undefined}
                            >
                                {QUICK_TIMES.map((time) => (
                                    <Picker.Item
                                        key={time.value}
                                        label={time.label}
                                        value={time.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View className='mt-4'>
                        <Text className={clsx(
                            'text-xl font-medium', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        }

                        )}>Long break time:</Text>
                        <View className={clsx(
                            'border rounded-full mt-2 overflow-hidden',
                            {
                                'border-pink-secondary bg-pink-secondary': phaze === 'work',
                                'border-green-secondary bg-green-secondary': phaze === 'short_break',
                                'border-blue-secondary bg-blue-secondary': phaze === 'long_break',
                            }
                        )}>

                            <Picker
                                selectedValue={currentSettings.longBreakDuration}
                                onValueChange={(itemValue) => handleLongBreakDurationChange(itemValue)}
                                style={{
                                    marginLeft: 7,
                                    color: theme === 'dark' ? '#ffffff' : (
                                        phaze === 'work'
                                            ? '#471515'
                                            : phaze === 'short_break'
                                                ? '#14401d'
                                                : '#153047'
                                    )
                                }}
                                itemStyle={Platform.OS === 'ios' ? {
                                    marginLeft: 7,
                                    color: theme === 'dark' ? '#ffffff' : (
                                        phaze === 'work'
                                            ? '#471515'
                                            : phaze === 'short_break'
                                                ? '#14401d'
                                                : '#153047'
                                    )
                                } : undefined}
                            >
                                {QUICK_TIMES.map((time) => (
                                    <Picker.Item
                                        key={time.value}
                                        label={time.label}
                                        value={time.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>
            </Animated.View >
        </>
    )
}

export default React.memo(Settings)