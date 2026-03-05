import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNotification } from './notificationService';

const MEDICATION_STORAGE_KEY = '@medications';

export const getMedications = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(MEDICATION_STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error fetching medications', e);
        return [];
    }
};

export const saveMedication = async (medication) => {
    try {
        const currentMedications = await getMedications();
        const newMeds = [...currentMedications, medication];
        await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(newMeds));

        // schedule notification for it
        await scheduleNotification(medication);

        return true;
    } catch (e) {
        console.error('Error saving medication', e);
        return false;
    }
};

export const updateMedication = async (id, updates) => {
    try {
        const currentMedications = await getMedications();
        const updatedMeds = currentMedications.map(med =>
            med.id === id ? { ...med, ...updates } : med
        );
        await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(updatedMeds));
        return true;
    } catch (e) {
        console.error('Error updating medication', e);
        return false;
    }
};

export const deleteMedication = async (id) => {
    try {
        const currentMedications = await getMedications();
        const filteredMeds = currentMedications.filter(med => med.id !== id);
        await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(filteredMeds));
        return true;
    } catch (e) {
        console.error('Error deleting medication', e);
        return false;
    }
};

const ADHERENCE_LOGS_KEY = '@adherence_logs';

export const logAdherence = async (medicationId, status) => {
    try {
        const logsStr = await AsyncStorage.getItem(ADHERENCE_LOGS_KEY);
        const logs = logsStr ? JSON.parse(logsStr) : [];
        const newLog = {
            id: Math.random().toString(),
            medicationId,
            date: new Date().toISOString(),
            status // 'taken' | 'missed' | 'skipped'
        };
        await AsyncStorage.setItem(ADHERENCE_LOGS_KEY, JSON.stringify([...logs, newLog]));
    } catch (e) {
        console.error('Error logging adherence', e);
    }
};

export const snoozeMedication = async (medicationId) => {
    try {
        const meds = await getMedications();
        const med = meds.find(m => m.id === medicationId);
        if (med) {
            // Use IST-accurate snooze (10 min from real IST now via API Ninjas)
            await scheduleSnoozeNotification(med);
            return true;
        }
    } catch (e) {
        console.error('Error snoozing medication', e);
    }
    return false;
};

export const logDoseTaken = async (id) => {
    try {
        const meds = await getMedications();
        let needsRefillAlert = false;
        let alertMed = null;

        const updated = meds.map(med => {
            if (med.id === id) {
                logAdherence(id, 'taken');

                const newStock = Math.max(0, (med.stockCount || 0) - 1);

                // If stock hits 3, we alert the user
                if (newStock === 3) {
                    needsRefillAlert = true;
                    alertMed = med;
                }

                return {
                    ...med,
                    takenToday: true,
                    streakCount: (med.streakCount || 0) + 1,
                    stockCount: newStock
                };
            }
            return med;
        });

        await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(updated));

        if (needsRefillAlert && alertMed) {
            const { triggerRefillAlert } = require('./notificationService');
            await triggerRefillAlert(alertMed);
        }

        return true;
    } catch (err) {
        console.error('Error logging dose', err);
        return false;
    }
};

export const skipDose = async (id) => {
    try {
        const meds = await getMedications();
        const updated = meds.map(med => {
            if (med.id === id) {
                logAdherence(id, 'skipped');
                return { ...med, takenToday: false }; // Mark as processed but not taken
            }
            return med;
        });
        await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(updated));
        return true;
    } catch (err) {
        console.error('Error skipping dose', err);
        return false;
    }
};
