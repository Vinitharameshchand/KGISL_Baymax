import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.baymaxLogo}>
                    <View style={styles.eye} />
                    <View style={styles.connector} />
                    <View style={styles.eye} />
                </View>
                <Text style={styles.welcomeText}>Hello.</Text>
                <Text style={styles.statusPill}>Health Scanner Active</Text>
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

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daily Checklist</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Medication')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Medication')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialCommunityIcons name="pill" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.tileText}>Meds</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Dashboard')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                            <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.tileText}>Trends</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Breathing')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                            <MaterialCommunityIcons name="leaf-circle-outline" size={24} color={COLORS.success} />
                        </View>
                        <Text style={styles.tileText}>Wellness</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Scan')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
                            <MaterialCommunityIcons name="heart-flash" size={24} color="#8B5CF6" />
                        </View>
                        <Text style={styles.tileText}>Vitals</Text>
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
        marginBottom: 16,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    tile: {
        width: '47%',
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tileText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    }
});

export default HomeScreen;
