import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';
import ReminderCard from '../components/ReminderCard';
import { COLORS } from '../constants/colors';
import { deleteMedication, getMedications, logDoseTaken, saveMedication, snoozeMedication } from '../services/medicationService';
import { triggerNotificationNow } from '../services/notificationService';

const MedicationScreen = () => {
    const [meds, setMeds] = useState([]);
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [time, setTime] = useState('');

    const loadMeds = async () => {
        const list = await getMedications();
        setMeds(list);
    };

    const handleSnooze = async (id) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await snoozeMedication(id);
        Alert.alert("Snoozed", "I will remind you again in 10 minutes.");
        loadMeds();
    };

    useEffect(() => {
        loadMeds();
    }, []);

    const handleAdd = async () => {
        if (!name || !time) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Please provide medication name and time HH:MM");
            return;
        }

        const newMed = {
            id: uuid.v4(),
            name,
            dosage,
            time,
            takenToday: false,
            streakCount: 0,
        };

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await saveMedication(newMed);
        setName('');
        setDosage('');
        setTime('');
        loadMeds();
    };

    const handleDelete = async (id) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await deleteMedication(id);
        loadMeds();
    };

    const handleTake = async (id) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await logDoseTaken(id);
        loadMeds();
    };

    const handleTestNotification = async () => {
        if (meds.length > 0) {
            await triggerNotificationNow(meds[0]);
        } else {
            await triggerNotificationNow({ name: 'Test Med', dosage: '1 dose' });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Schedule</Text>
                <View style={[styles.statusPill, { backgroundColor: '#F1F5F9' }]}>
                    <Text style={[styles.statusText, { color: COLORS.textSecondary }]}>Active</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.listTitle}>Add New Schedule</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Medication Name"
                    placeholderTextColor={COLORS.textSecondary}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Dosage (e.g. 1 Tablet)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={dosage}
                    onChangeText={setDosage}
                />
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Time (HH:MM)"
                        placeholderTextColor={COLORS.textSecondary}
                        value={time}
                        onChangeText={setTime}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                        <MaterialCommunityIcons name="plus" size={32} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Today's Schedule</Text>
                <TouchableOpacity onPress={handleTestNotification} style={styles.testBtn}>
                    <MaterialCommunityIcons name="bell-ring-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={meds}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <ReminderCard
                        medication={item}
                        onTake={handleTake}
                        onDelete={handleDelete}
                        onSnooze={handleSnooze}
                    />
                )}
            />
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
        marginTop: 40,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    testBtn: {
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputContainer: {
        backgroundColor: COLORS.white,
        padding: 24,
        borderRadius: 30,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        fontSize: 16,
        fontWeight: '500',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addBtn: {
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
        marginLeft: 4,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default MedicationScreen;
