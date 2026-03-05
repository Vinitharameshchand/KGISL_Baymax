import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

const ReminderCard = ({ medication, onTake, onDelete, onSnooze }) => {
    return (
        <View style={[styles.card, medication.takenToday && styles.cardTaken]}>
            <View style={styles.content}>
                <View style={styles.mainInfo}>
                    <Text style={[styles.name, medication.takenToday && styles.textMuted]}>
                        {medication.name}
                    </Text>
                    <Text style={styles.details}>
                        {medication.dosage} • {medication.time} • {medication.stockCount || 0} left
                    </Text>
                </View>

                {medication.takenToday ? (
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
                        <Text style={styles.badgeText}>Completed</Text>
                    </View>
                ) : (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => onSnooze(medication)}
                        >
                            <MaterialCommunityIcons name="clock-outline" size={22} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.primaryAction]}
                            onPress={() => onTake(medication)}
                        >
                            <MaterialCommunityIcons name="check" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {!medication.takenToday && (
                <TouchableOpacity
                    style={styles.deleteArea}
                    onPress={() => onDelete(medication.id)}
                >
                    <MaterialCommunityIcons name="minus-circle-outline" size={16} color="#FDA4AF" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTaken: {
        backgroundColor: COLORS.medBlue,
        borderColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainInfo: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    textMuted: {
        color: COLORS.textSecondary,
        opacity: 0.6,
        textDecorationLine: 'line-through',
    },
    details: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    primaryAction: {
        backgroundColor: COLORS.primary,
        width: 50,
        height: 50,
        borderRadius: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.success,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    deleteArea: {
        position: 'absolute',
        top: -6,
        left: -6,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 2,
    }
});

export default ReminderCard;
