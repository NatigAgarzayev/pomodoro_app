import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';

type SlidingTabProps = {
    children: React.ReactNode;
    onPress?: () => void;
};

type SlidingTabsProps = {
    children: React.ReactElement<SlidingTabProps>[];
};

// SlidingTab component
export function SlidingTab({ children, onPress }: SlidingTabProps) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.tab}>
            {children}
        </TouchableOpacity>
    );
}

// SlidingTabs component
export default function SlidingTabs({ children }: SlidingTabsProps) {
    const [activeTab, setActiveTab] = useState(0);
    const animation = useRef(new Animated.Value(0)).current;
    const tabWidth = Dimensions.get('window').width / children.length; // Dynamic width based on number of tabs

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        Animated.spring(animation, {
            toValue: index * tabWidth,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                {React.Children.map(children, (child, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleTabPress(index)}
                        style={[styles.tab, { width: tabWidth }]}
                    >
                        {React.cloneElement(child, {
                            onPress: () => handleTabPress(index),
                        })}
                    </TouchableOpacity>
                ))}
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: tabWidth,
                            transform: [{ translateX: animation }],
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        position: 'relative',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: '#007AFF',
    },
});