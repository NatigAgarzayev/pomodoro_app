import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import clsx from 'clsx';

type SegmentedControlProps = {
    options: string[];
    selectedOption: string;
    onOptionPress?: (option: string) => void;
    phaze?: string
    className?: string;
};

const SegmentedControl: React.FC<SegmentedControlProps> = React.memo(
    ({ options, selectedOption, onOptionPress, phaze = 'work', className }) => {
        const { width: windowWidth } = useWindowDimensions();

        const internalPadding = 20;
        const segmentedControlWidth = windowWidth - 40;

        const itemWidth =
            (segmentedControlWidth - internalPadding) / options.length;

        const rStyle = useAnimatedStyle(() => {
            return {
                left: withTiming(
                    itemWidth * options.indexOf(selectedOption) + internalPadding / 2
                ),
            };
        }, [selectedOption, options, itemWidth]);

        return (
            <View
                className={clsx(
                    'flex-row h-14 rounded-3xl border',
                    {
                        'bg-pink-wall/10 border-pink-wall/30': phaze === 'work',
                        'bg-green-wall/10 border-green-wall/30': phaze === 'short_break',
                        'bg-blue-wall/10 border-blue-wall/30': phaze === 'long_break',
                    },
                    className
                )}
                style={[
                    {
                        width: segmentedControlWidth,
                        paddingLeft: internalPadding / 2,
                    },
                    styles.innerShadow,
                ]}
            >
                <Animated.View
                    className={clsx(
                        'absolute rounded-xl',
                        {
                            'bg-pink-wall': phaze === 'work',
                            'bg-green-wall': phaze === 'short_break',
                            'bg-blue-wall': phaze === 'long_break',
                        }
                    )}
                    style={[
                        {
                            width: itemWidth,
                            height: '80%',
                            top: '10%',
                        },
                        rStyle,
                        styles.activeShadow,
                    ]}
                />
                {options.map((option) => {
                    const isSelected = selectedOption === option;
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                onOptionPress?.(option);
                            }}
                            key={option}
                            className="justify-center items-center"
                            style={[
                                {
                                    width: itemWidth,
                                },
                            ]}
                        >
                            <Text
                                className={clsx(
                                    'text-base font-semibold',
                                    {
                                        'text-gray-950': isSelected,
                                        'text-pink-primary/70': !isSelected && phaze === 'work',
                                        'text-green-primary/70': !isSelected && phaze === 'short_break',
                                        'text-blue-primary/70': !isSelected && phaze === 'long_break',
                                    }
                                )}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    innerShadow: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
        // Inner shadow effect using overlay
        position: 'relative',
    },
    activeShadow: {
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    },
});

export { SegmentedControl };