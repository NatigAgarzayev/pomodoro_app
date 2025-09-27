import React, { createContext, useContext } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import clsx from 'clsx';

type SegmentedControlContextType = {
    selectedValue: string;
    onValueChange?: (value: string) => void;
    phaze: string;
    itemWidth: number;
    children: React.ReactElement[];
};

const SegmentedControlContext = createContext<SegmentedControlContextType | null>(null);

const useSegmentedControl = () => {
    const context = useContext(SegmentedControlContext);
    if (!context) {
        throw new Error('SegmentItem must be used within SegmentedControl');
    }
    return context;
};

// Main SegmentedControl component
type SegmentedControlProps = {
    children: React.ReactElement[];
    selectedValue: string;
    onValueChange?: (value: string) => void;
    phaze?: string;
    className?: string;
};

const SegmentedControl: React.FC<SegmentedControlProps> = ({
    children,
    selectedValue,
    onValueChange,
    phaze = 'work',
    className
}) => {
    const { width: windowWidth } = useWindowDimensions();

    const internalPadding = 20;
    const segmentedControlWidth = windowWidth - 40;
    const itemWidth = (segmentedControlWidth - internalPadding) / children.length;

    const selectedIndex = children.findIndex(child => child.props.value === selectedValue);

    const rStyle = useAnimatedStyle(() => {
        return {
            left: withTiming(
                itemWidth * selectedIndex + internalPadding / 2
            ),
        };
    }, [selectedValue, selectedIndex, itemWidth]);

    const contextValue: SegmentedControlContextType = {
        selectedValue,
        onValueChange,
        phaze,
        itemWidth,
        children
    };

    return (
        <SegmentedControlContext.Provider value={contextValue}>
            <View
                className={clsx(
                    'flex-row h-14 rounded-3xl border',
                    {
                        'bg-pink-secondary border-pink-secondary': phaze === 'work',
                        'bg-green-secondary border-green-secondary': phaze === 'short_break',
                        'bg-blue-secondary border-blue-secondary': phaze === 'long_break',
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
                        'absolute rounded-3xl',
                        {
                            'bg-pink-secondary': phaze === 'work',
                            'bg-green-secondary': phaze === 'short_break',
                            'bg-blue-secondary': phaze === 'long_break',
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
                {children}
            </View>
        </SegmentedControlContext.Provider>
    );
};

type SegmentItemProps = {
    value: string;
    children: React.ReactNode;
    className?: string;
};

const SegmentItem: React.FC<SegmentItemProps> = ({
    value,
    children,
    className
}) => {
    const { selectedValue, onValueChange, phaze, itemWidth } = useSegmentedControl();
    const isSelected = selectedValue === value;

    return (
        <TouchableOpacity
            onPress={() => onValueChange?.(value)}
            className={clsx("justify-center items-center", className)}
            style={[
                {
                    width: itemWidth,
                    zIndex: 10,
                },
            ]}
            activeOpacity={1}
        >
            <View
                className={clsx({
                    'text-black-primary': isSelected,
                    'text-pink-primary': !isSelected && phaze === 'work',
                    'text-green-primary': !isSelected && phaze === 'short_break',
                    'text-blue-primary': !isSelected && phaze === 'long_break',
                })}
            >
                {children}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    innerShadow: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    activeShadow: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
});

export { SegmentedControl, SegmentItem };