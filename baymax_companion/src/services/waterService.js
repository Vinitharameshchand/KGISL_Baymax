import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const WATER_LOG_KEY = '@water_intake';
const WATER_GOAL = 8; // 8 glasses

export const getWaterIntake = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(WATER_LOG_KEY);
        const data = jsonValue != null ? JSON.parse(jsonValue) : { count: 0, lastUpdated: new Date().toDateString() };

        // Reset if it's a new day
        if (data.lastUpdated !== new Date().toDateString()) {
            return { count: 0, lastUpdated: new Date().toDateString() };
        }
        return data;
    } catch (e) {
        return { count: 0, lastUpdated: new Date().toDateString() };
    }
};

export const logWaterDrop = async () => {
    try {
        const data = await getWaterIntake();
        const newData = { count: data.count + 1, lastUpdated: new Date().toDateString() };
        await AsyncStorage.setItem(WATER_LOG_KEY, JSON.stringify(newData));
        return newData;
    } catch (e) {
        console.error('Error logging water', e);
        return null;
    }
};

export const scheduleWaterReminders = async () => {
    // Clear existing water reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
        if (notif.content.data?.type === 'water_reminder') {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }

    // Schedule 8 reminders throughout the day (every 1.5 hours from 9 AM)
    const startHour = 9;
    for (let i = 0; i < 8; i++) {
        const triggerHour = startHour + Math.floor(i * 1.5);
        if (triggerHour >= 22) break; // Don't remind late at night

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '💧 Hydration Time',
                body: "Hello, I am Baymax. It is time to drink a glass of water. Staying hydrated is important for your energy!",
                data: { type: 'water_reminder' },
                sound: true,
                categoryIdentifier: 'water_interaction'
            },
            trigger: {
                type: 'daily',
                hour: triggerHour,
                minute: 0,
            },
        });
    }
    console.log('[WaterService] Water reminders scheduled.');
};

export const setupWaterCategory = async () => {
    await Notifications.setNotificationCategoryAsync('water_interaction', [
        {
            identifier: 'DRANK_WATER',
            buttonTitle: '🥤 I drank water',
            options: { opensAppToForeground: false }
        }
    ]);
};
