import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { speak, stopSpeaking } from '../services/voiceService';

const ScanScreen = ({ navigation }) => {
    const scanLineY = useSharedValue(-200);
    const opacity = useSharedValue(0.2);

    useEffect(() => {
        // Voice introduction taking a few seconds
        speak("I am scanning your vitals. Please stay still.");

        // Animate the laser line up and down
        scanLineY.value = withRepeat(
            withSequence(
                withTiming(200, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-200, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Flash opacity of the laser
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.4, { duration: 1000 })
            ),
            -1,
            true
        );

        const timer = setTimeout(() => {
            speak("Scan complete. On a scale of 1 to 10, how would you rate your pain today?");
        }, 4000);

        return () => {
            clearTimeout(timer);
            stopSpeaking();
        };
    }, []);

    const animatedLineStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: scanLineY.value }],
            opacity: opacity.value
        };
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.scanArea}>
                <MaterialCommunityIcons name="human" size={300} color={COLORS.surface} />
                <Animated.View style={[styles.laser, animatedLineStyle]} />
            </View>

            <Text style={styles.statusText}>Scanning vitals...</Text>

            <TouchableOpacity
                style={styles.voiceBtn}
                onPress={() => {
                    navigation.replace('Voice', { mode: 'vitals_check' });
                    speak("I am listening. Tell me your pain level.");
                }}
            >
                <Text style={styles.voiceBtnText}>Respond with Voice</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    scanArea: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    laser: {
        position: 'absolute',
        width: 320,
        height: 6,
        backgroundColor: COLORS.success, // Green medical scan
        borderRadius: 3,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
    },
    statusText: {
        marginTop: 60,
        fontSize: 22,
        color: COLORS.text,
        fontWeight: '300',
    },
    voiceBtn: {
        marginTop: 40,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    voiceBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ScanScreen;
