import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { getWaterIntake, logWaterDrop } from '../services/waterService';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';

const HomeScreen = ({ navigation }) => {
    const [water, setWater] = useState({ count: 0 });

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.baymaxLogo}>
                        <View style={styles.eye} />
                        <View style={styles.connector} />
                        <View style={styles.eye} />
                    </View>
                    <TouchableOpacity
                        style={styles.voiceSmallBtn}
                        onPress={() => navigation.navigate('Voice')}
                    >
                        <MaterialCommunityIcons name="microphone" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.welcomeText}>Hello.</Text>
                <Text style={styles.subtitleText}>I am Baymax, your companion.</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                <TouchableOpacity
                    style={styles.heroAction}
                    onPress={() => navigation.navigate('Voice')}
                >
                    <View style={styles.heroContent}>
                        <MaterialCommunityIcons name="face-recognition" size={42} color={COLORS.primary} />
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.heroTitle}>How are you today?</Text>
                            <Text style={styles.heroSubtitle}>Tap to start a quick check-up</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={[styles.heroAction, { marginTop: 16, backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                    <View style={styles.heroContent}>
                        <MaterialCommunityIcons name="water" size={32} color={COLORS.secondary} />
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.heroTitle}>Hydration</Text>
                            <Text style={styles.heroSubtitle}>{water.count} of 8 glasses today</Text>
                        </View>
                        <TouchableOpacity style={styles.waterAddBtn} onPress={handleLogWater}>
                            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daily Checklist</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MedsTab')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity style={[styles.tile, { backgroundColor: '#FEE2E2' }]} onPress={() => navigation.navigate('MedsTab')}>
                        <MaterialCommunityIcons name="pill" size={28} color={COLORS.primary} />
                        <Text style={[styles.tileText, { color: COLORS.primary }]}>Meds</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.tile, { backgroundColor: '#E0F2FE' }]} onPress={() => navigation.navigate('TrendsTab')}>
                        <MaterialCommunityIcons name="chart-line" size={28} color={COLORS.secondary} />
                        <Text style={[styles.tileText, { color: COLORS.secondary }]}>Trends</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.tile, { backgroundColor: '#F0FDF4' }]} onPress={() => navigation.navigate('Breathing')}>
                        <MaterialCommunityIcons name="leaf-circle-outline" size={28} color={COLORS.success} />
                        <Text style={[styles.tileText, { color: COLORS.success }]}>Relax</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.tile, { backgroundColor: '#F5F3FF' }]} onPress={() => navigation.navigate('Scan')}>
                        <MaterialCommunityIcons name="heart-pulse" size={28} color="#8B5CF6" />
                        <Text style={[styles.tileText, { color: '#8B5CF6' }]}>Vitals</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.heroAction, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', marginTop: 24 }]}>
                    <TouchableOpacity
                        style={[styles.heroContent, { justifyContent: 'center' }]}
                        onPress={() => navigation.navigate('Emergency')}
                    >
                        <MaterialCommunityIcons name="shield-alert-outline" size={24} color={COLORS.primary} />
                        <Text style={[styles.heroTitle, { fontSize: 14, color: COLORS.primary, marginLeft: 10 }]}>Emergency Support</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 24,
    },
    header: {
        marginTop: 60,
        marginBottom: 32,
    },
    baymaxLogo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eye: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.text,
    },
    connector: {
        width: 24,
        height: 2,
        backgroundColor: COLORS.text,
        marginHorizontal: 4,
    },
    welcomeText: {
        fontSize: 38,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -1,
    },
    statusPill: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.success,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scroll: {
        flex: 1,
    },
    heroAction: {
        backgroundColor: COLORS.white,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    voiceSmallBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    subtitleText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    tile: {
        width: '47%',
        paddingVertical: 24,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    tileText: {
        fontSize: 15,
        fontWeight: '800',
        marginTop: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});

export default HomeScreen;
