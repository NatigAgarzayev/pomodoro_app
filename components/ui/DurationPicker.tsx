import React, { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import clsx from 'clsx'
import { cssInterop } from 'nativewind'

cssInterop(Svg, { className: 'style' })
cssInterop(Path, {
    className: {
        target: true,
        nativeStyleToProp: { fill: true, stroke: true },
    },
})

interface DurationOption {
    label: string
    value: number
}

interface DurationPickerProps {
    label: string
    selectedValue: number
    onValueChange: (value: number) => void
    options: DurationOption[]
    phaze: string
}

export default function DurationPicker({ label, selectedValue, onValueChange, options, phaze }: DurationPickerProps) {
    const [open, setOpen] = useState(false)
    const selectedOption = options.find(o => o.value === selectedValue)

    const handleSelect = (value: number) => {
        onValueChange(value)
        setOpen(false)
    }

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                className={clsx('border rounded-full mt-2 px-5 py-4 flex-row items-center justify-between', {
                    'border-pink-secondary bg-pink-secondary': phaze === 'work',
                    'border-green-secondary bg-green-secondary': phaze === 'short_break',
                    'border-blue-secondary bg-blue-secondary': phaze === 'long_break',
                })}
            >
                <Text className={clsx('text-base font-medium', {
                    'text-pink-primary': phaze === 'work',
                    'text-green-primary': phaze === 'short_break',
                    'text-blue-primary': phaze === 'long_break',
                })}>{selectedOption?.label ?? '-'}</Text>
                <Svg
                    className={clsx({
                        'text-pink-primary': phaze === 'work',
                        'text-green-primary': phaze === 'short_break',
                        'text-blue-primary': phaze === 'long_break',
                    })}
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="m6 9 6 6 6-6" />
                </Svg>
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        className={clsx('rounded-t-3xl pb-8 pt-2', {
                            'bg-pink-wall': phaze === 'work',
                            'bg-green-wall': phaze === 'short_break',
                            'bg-blue-wall': phaze === 'long_break',
                        })}
                    >
                        <Text className={clsx('text-lg font-semibold text-center py-3', {
                            'text-pink-primary': phaze === 'work',
                            'text-green-primary': phaze === 'short_break',
                            'text-blue-primary': phaze === 'long_break',
                        })}>{label}</Text>
                        <ScrollView style={{ maxHeight: 320 }}>
                            {options.map((option) => {
                                const isSelected = option.value === selectedValue
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => handleSelect(option.value)}
                                        className={clsx('px-6 py-4', {
                                            'bg-pink-secondary': isSelected && phaze === 'work',
                                            'bg-green-secondary': isSelected && phaze === 'short_break',
                                            'bg-blue-secondary': isSelected && phaze === 'long_break',
                                        })}
                                    >
                                        <Text className={clsx('text-lg', {
                                            'font-bold': isSelected,
                                            'text-pink-primary': phaze === 'work',
                                            'text-green-primary': phaze === 'short_break',
                                            'text-blue-primary': phaze === 'long_break',
                                        })}>{option.label}</Text>
                                    </Pressable>
                                )
                            })}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    )
}
