import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

const HealthScoreCard = ({ score }) => {
    // Determine color based on score
    const getScoreColor = () => {
        if (score >= 80) return COLORS.success;
        if (score >= 50) return COLORS.warning;
        return COLORS.error;
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="shield-check-outline" size={24} color={getScoreColor()} />
                <Text style={styles.title}>Health Score</Text>
            </View>
            <View style={styles.content}>
                <View style={[styles.circle, { borderColor: getScoreColor() }]}>
                    <Text style={[styles.scoreText, { color: COLORS.text }]}>{score}</Text>
                    <Text style={styles.percentSymbol}>%</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.statusText}>{score >= 80 ? 'Optimal' : score >= 50 ? 'Fair' : 'Critical'}</Text>
                    <Text style={styles.subtitle}>Based on your daily activity and adherence.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 30,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 24,
        flexDirection: 'row',
    },
    scoreText: {
        fontSize: 32,
        fontWeight: '800',
    },
    percentSymbol: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 2,
        marginTop: 8,
    },
    info: {
        flex: 1,
    },
    statusText: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    }
});

export default HealthScoreCard;
