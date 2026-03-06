import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { getWaterIntake, logWaterDrop } from '../services/waterService';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';

const HomeScreen = ({ navigation }) => {
    const [water, setWater] = useState({ count: 0 });
    const waterGoal = 8;

    const loadWater = async () => {
        const data = await getWaterIntake();
        setWater(data);
    };

    useEffect(() => {
        loadWater();
    }, []);

    const handleLogWater = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newData = await logWaterDrop();
        if (newData) setWater(newData);
    };

    const waterPercent = Math.min((water.count / waterGoal) * 100, 100);

    return (
        <View style={styles.container}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../../images/logoicon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={styles.logoTextGroup}>
                            <Text style={styles.appName}>Neuvix</Text>
                            <Text style={styles.appTagline}>Never Miss a Dose.</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.micBtn}
                        onPress={() => navigation.navigate('Voice')}
                    >
                        <MaterialCommunityIcons name="microphone" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.greeting}>Hello! 👋</Text>
                <Text style={styles.subtitle}>I am Baymax, your personal companion.</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Start Check-up Card ── */}
                <TouchableOpacity
                    style={styles.heroCard}
                    onPress={() => navigation.navigate('Voice')}
                    activeOpacity={0.85}
                >
                    <View style={styles.heroLeft}>
                        <View style={styles.heroIconBg}>
                            <MaterialCommunityIcons name="face-recognition" size={36} color={COLORS.white} />
                        </View>
                        <View style={styles.heroTextGroup}>
                            <Text style={styles.heroTitle}>How are you today?</Text>
                            <Text style={styles.heroSubtitle}>Tap to start a voice check-up</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.white} />
                </TouchableOpacity>

                {/* ── Hydration Card ── */}
                <View style={styles.hydrationCard}>
                    <View style={styles.hydrationHeader}>
                        <View style={styles.hydrationLeft}>
                            <MaterialCommunityIcons name="water" size={24} color={COLORS.secondary} />
                            <Text style={styles.hydrationTitle}>Hydration</Text>
                        </View>
                        <TouchableOpacity style={styles.hydrationAddBtn} onPress={handleLogWater}>
                            <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hydrationCount}>
                        <Text style={styles.hydrationNum}>{water.count}</Text>
                        <Text style={styles.hydrationGoal}> / {waterGoal} glasses</Text>
                    </Text>
                    {/* Progress Bar */}
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${waterPercent}%` }]} />
                    </View>
                    <Text style={styles.hydrationNote}>
                        {water.count >= waterGoal
                            ? '🎉 Daily goal reached!'
                            : `${waterGoal - water.count} more to reach your goal`}
                    </Text>
                </View>

                {/* ── Section Title ── */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MedsTab')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* ── 2×2 Grid ── */}
                <View style={styles.grid}>
                    <TouchableOpacity
                        style={[styles.tile, { backgroundColor: '#FFF1F2' }]}
                        onPress={() => navigation.navigate('MedsTab')}
                    >
                        <View style={[styles.tileIconBg, { backgroundColor: '#FFE4E6' }]}>
                            <MaterialCommunityIcons name="pill" size={28} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.tileLabel, { color: COLORS.primary }]}>Meds</Text>
                        <Text style={styles.tileHint}>Track doses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tile, { backgroundColor: '#EFF6FF' }]}
                        onPress={() => navigation.navigate('TrendsTab')}
                    >
                        <View style={[styles.tileIconBg, { backgroundColor: '#DBEAFE' }]}>
                            <MaterialCommunityIcons name="chart-line" size={28} color={COLORS.secondary} />
                        </View>
                        <Text style={[styles.tileLabel, { color: COLORS.secondary }]}>Trends</Text>
                        <Text style={styles.tileHint}>View progress</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tile, { backgroundColor: '#F0FDF4' }]}
                        onPress={() => navigation.navigate('Breathing')}
                    >
                        <View style={[styles.tileIconBg, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="leaf-circle-outline" size={28} color={COLORS.success} />
                        </View>
                        <Text style={[styles.tileLabel, { color: COLORS.success }]}>Relax</Text>
                        <Text style={styles.tileHint}>Breathe easy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tile, { backgroundColor: '#F5F3FF' }]}
                        onPress={() => navigation.navigate('Scan')}
                    >
                        <View style={[styles.tileIconBg, { backgroundColor: '#EDE9FE' }]}>
                            <MaterialCommunityIcons name="heart-pulse" size={28} color="#7C3AED" />
                        </View>
                        <Text style={[styles.tileLabel, { color: '#7C3AED' }]}>Vitals</Text>
                        <Text style={styles.tileHint}>Check health</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Emergency Card ── */}
                <TouchableOpacity
                    style={styles.emergencyCard}
                    onPress={() => navigation.navigate('Emergency')}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="shield-alert-outline" size={26} color={COLORS.primary} />
                    <View style={styles.emergencyTextGroup}>
                        <Text style={styles.emergencyTitle}>Emergency Support</Text>
                        <Text style={styles.emergencySubtitle}>Get help immediately</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    /* ── Header ── */
    header: {
        paddingTop: 56,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: COLORS.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    logoTextGroup: {
        justifyContent: 'center',
    },
    appName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    appTagline: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        letterSpacing: 0.2,
    },
    micBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginTop: 4,
    },

    /* ── Scroll ── */
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },

    /* ── Hero Check-up Card ── */
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    heroLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    heroIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    heroTextGroup: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.white,
    },
    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
        marginTop: 3,
    },

    /* ── Hydration Card ── */
    hydrationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#E0F2FE',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    hydrationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    hydrationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hydrationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    hydrationAddBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hydrationCount: {
        marginBottom: 10,
    },
    hydrationNum: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    hydrationGoal: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    progressBg: {
        height: 8,
        backgroundColor: '#E0F2FE',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
    },
    hydrationNote: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },

    /* ── Section Row ── */
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    viewAll: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.secondary,
    },

    /* ── Grid ── */
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    tile: {
        width: '48%',
        borderRadius: 24,
        paddingVertical: 22,
        paddingHorizontal: 18,
        marginBottom: 14,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    tileIconBg: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tileLabel: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    tileHint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginTop: 3,
    },

    /* ── Emergency Card ── */
    emergencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F2',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#FECDD3',
    },
    emergencyTextGroup: {
        flex: 1,
        marginLeft: 14,
    },
    emergencyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    emergencySubtitle: {
        fontSize: 12,
        color: '#FB7185',
        fontWeight: '500',
        marginTop: 2,
    },
});

export default HomeScreen;
