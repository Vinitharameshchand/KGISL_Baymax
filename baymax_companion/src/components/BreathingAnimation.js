import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const BreathingAnimation = () => {
    const scale = useSharedValue(1);
    const [instruction, setInstruction] = useState('Inhale...');

    useEffect(() => {
        // 4-2-4-2 breathing logic (Inhale, Hold, Exhale, Hold)
        const runCycle = () => {
            setInstruction('Inhale...');
            scale.value = withTiming(1.8, { duration: 4000, easing: Easing.inOut(Easing.ease) });

            setTimeout(() => {
                setInstruction('Hold...');
                setTimeout(() => {
                    setInstruction('Exhale...');
                    scale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) });
                    setTimeout(() => {
                        setInstruction('Hold...');
                        setTimeout(runCycle, 2000);
                    }, 4000);
                }, 2000);
            }, 4000);
        };

        runCycle();

        return () => {
            // Cleanup if needed
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.circle, animatedStyle]} />
            <Text style={styles.text}>{instruction}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
    },
    circle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.secondary + '33',
        position: 'absolute',
    },
    text: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
        zIndex: 1,
    }
});

export default BreathingAnimation;
