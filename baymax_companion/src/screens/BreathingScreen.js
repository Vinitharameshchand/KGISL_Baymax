import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BreathingAnimation from '../components/BreathingAnimation';
import { COLORS } from '../constants/colors';
import { speak, stopSpeaking } from '../services/voiceService';

const BreathingScreen = ({ navigation }) => {
    useEffect(() => {
        speak("Let's do a breathing exercise. Follow the contraction of the circle. Inhale... hold... exhale.");
        return () => stopSpeaking();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.sessionBadge}>
                    <MaterialCommunityIcons name="leaf" size={16} color={COLORS.success} />
                    <Text style={styles.sessionText}>GUIDED SESSION</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <BreathingAnimation />
                <View style={styles.instructionBox}>
                    <Text style={styles.mainInstruction}>Sync your breath.</Text>
                    <Text style={styles.subtitle}>Let the tension leave your body as the circle expands.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.tipCard}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#F59E0B" />
                    <Text style={styles.tipText}>Tip: Try to inhale through your nose and exhale through your mouth.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 60,
    },
    sessionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    sessionText: {
        color: COLORS.success,
        fontSize: 11,
        fontWeight: '800',
        marginLeft: 6,
        letterSpacing: 1,
    },
    closeBtn: {
        backgroundColor: COLORS.white,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionBox: {
        alignItems: 'center',
        marginTop: 60,
    },
    mainInstruction: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
        paddingHorizontal: 30,
        fontWeight: '500',
    },
    footer: {
        marginBottom: 40,
    },
    tipCard: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        flex: 1,
        marginLeft: 16,
        lineHeight: 18,
        fontWeight: '500',
    }
});

export default BreathingScreen;
