import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import HealthScoreCard from '../components/HealthScoreCard';
import { COLORS } from '../constants/colors';
import { getMedications } from '../services/medicationService';
import { calculateHealthScore } from '../utils/healthScore';

const DashboardScreen = () => {
    const [adherence, setAdherence] = useState(0);
    const [missed, setMissed] = useState(0);
    const [healthScore, setHealthScore] = useState(0);
    const [pendingMeds, setPendingMeds] = useState([]);
    const [moodText, setMoodText] = useState('Neutral');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const meds = await getMedications();
        const moodsStr = await AsyncStorage.getItem('@moods');
        const moods = moodsStr ? JSON.parse(moodsStr) : [];
        const logsStr = await AsyncStorage.getItem('@adherence_logs');
        const logs = logsStr ? JSON.parse(logsStr) : [];

        let takenToday = 0;
        meds.forEach(m => {
            if (m.takenToday) takenToday += 1;
        });

        // Historical missed doses
        const historicalMissed = logs.filter(l => l.status === 'missed' || l.status === 'skipped').length;

        const percent = meds.length > 0 ? (takenToday / meds.length) * 100 : 0;
        setAdherence(Math.round(percent));
        setMissed(historicalMissed);
        setPendingMeds(meds.filter(m => !m.takenToday));

        // Use real mood average from stored moods
        const moodScore = moods.length > 0
            ? moods.reduce((acc, curr) => acc + curr.score, 0) / moods.length
            : 70; // fallback to neutral-high if no data yet

        let dynamicMood = 'Neutral';
        if (moodScore >= 80) dynamicMood = 'Very Positive';
        else if (moodScore >= 60) dynamicMood = 'Generally Positive';
        else if (moodScore >= 40) dynamicMood = 'Neutral';
        else dynamicMood = 'Needs Attention';

        setMoodText(dynamicMood);

        const score = calculateHealthScore(percent, moodScore);
        setHealthScore(score);
    };

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Report</Text>
                <View style={styles.dateChip}>
                    <Text style={styles.dateChipText}>{today}</Text>
                </View>
            </View>

            <View style={{ marginTop: 10 }}>
                <HealthScoreCard score={healthScore} />
            </View>

            <View style={styles.row}>
                <View style={[styles.statBox, { borderLeftWidth: 4, borderLeftColor: COLORS.secondary }]}>
                    <View style={styles.statHeader}>
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.secondary} />
                        <Text style={styles.statLabel}>Adherence</Text>
                    </View>
                    <Text style={styles.statValue}>{adherence}%</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 4, borderLeftColor: COLORS.primary }]}>
                    <View style={styles.statHeader}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.statLabel}>Missed</Text>
                    </View>
                    <Text style={[styles.statValue, { color: COLORS.primary }]}>{missed}</Text>
                </View>
            </View>

            <View style={styles.insightCard}>
                <View style={styles.insightIcon}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F59E0B" />
                </View>
                <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Medication Consistency</Text>
                    <Text style={styles.insightText}>
                        {adherence > 80
                            ? "Excellent stability. Your patterns indicate strong medication adherence."
                            : "Developing consistency is key for optimal recovery."}
                    </Text>
                </View>
            </View>

            <View style={styles.moodSection}>
                <Text style={styles.sectionTitle}>Emotional Wellness</Text>
                <View style={styles.moodCard}>
                    <MaterialCommunityIcons name="face-recognition" size={28} color={COLORS.secondary} />
                    <View style={{ marginLeft: 16 }}>
                        <Text style={styles.moodLabel}>Mood Trend</Text>
                        <Text style={styles.moodValue}>{moodText}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Queue for Today</Text>
            {pendingMeds.length === 0 ? (
                <View style={styles.emptyBox}>
                    <MaterialCommunityIcons name="shield-check" size={48} color={COLORS.success} />
                    <Text style={styles.emptyText}>All schedules completed for today.</Text>
                </View>
            ) : (
                pendingMeds.map(med => (
                    <View key={med.id} style={styles.pendingItem}>
                        <View>
                            <Text style={styles.pendingName}>{med.name}</Text>
                            <Text style={styles.pendingTime}>{med.time}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.pendingStatus}>UPCOMING</Text>
                        </View>
                    </View>
                ))
            )}
            <View style={{ height: 60 }} />
        </ScrollView>
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
        marginTop: 40,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    dateChip: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateChipText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        flex: 0.48,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    statBoxFull: {
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.medBlue,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '800',
    },
    statText: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    insightCard: {
        backgroundColor: '#FFFBEB',
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 4,
    },
    insightText: {
        fontSize: 13,
        color: '#B45309',
        lineHeight: 18,
        fontWeight: '500',
    },
    moodSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    moodCard: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    moodLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    moodValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    pendingItem: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pendingName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
    },
    pendingTime: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: COLORS.medBlue,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    pendingStatus: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.white,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
    }
});

export default DashboardScreen;
