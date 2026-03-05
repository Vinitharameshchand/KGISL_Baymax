import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const WaveAnimation = ({ active = false }) => {
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (active) {
            opacity.value = withTiming(1, { duration: 500 });
            scale1.value = withRepeat(
                withSequence(
                    withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // Infinite
                true // Reverse
            );
            scale2.value = withRepeat(
                withSequence(
                    withTiming(1.8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            opacity.value = withTiming(0, { duration: 500 });
            scale1.value = withTiming(1);
            scale2.value = withTiming(1);
        }
    }, [active]);

    const animatedStyle1 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale1.value }],
            opacity: opacity.value * 0.4,
        };
    });

    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale2.value }],
            opacity: opacity.value * 0.2,
        };
    });

    return (
        <View style={styles.container}>
            {/* Wave Layers */}
            <Animated.View style={[styles.circle, styles.layer2, animatedStyle2]} />
            <Animated.View style={[styles.circle, styles.layer1, animatedStyle1]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: COLORS.primary,
    },
    layer1: {
        width: 140,
        height: 140,
    },
    layer2: {
        width: 160,
        height: 160,
    },
});

export default WaveAnimation;
