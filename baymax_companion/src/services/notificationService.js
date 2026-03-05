import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getCurrentISTTime, msUntilScheduledTime } from './timeService';

// ── Foreground notification handler ─────────────────────────────────────────
// Controls whether a notification should show while the app is open.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        // SDK 53+: shouldShowBanner = heads-up pop-over, shouldShowList = notification tray
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// ── Immediate notification (test / manual trigger) ───────────────────────────
export const triggerNotificationNow = async (medication) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '💊 Time for your medication',
            body: `Hello, I am Baymax. It is time for your dose (${medication.dosage || '1 dose'}) of ${medication.name}.`,
            data: { medicationId: medication.id, medicationName: medication.name, dosage: medication.dosage },
            sound: true,
            // ✅ categoryIdentifier for interactive actions
            categoryIdentifier: 'medication_reminder',
            // channelId in CONTENT is valid for Android channel routing
            channelId: 'default',
        },
        trigger: null, // null = fire immediately
    });
};

// ── Time string parser ────────────────────────────────────────────────────────
// Parses "HH:MM", "H:MM", or bare hour strings. Handles AM/PM from context.
const parseTimeString = (timeStr, context = '') => {
    const lower = (timeStr || '').toLowerCase().trim();
    const contextLower = (context || '').toLowerCase();

    const match =
        lower.match(/(\d{1,2})[:\s.](\d{2})/) ||
        lower.match(/(\d{1,2})/);

    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;

    const isPM =
        contextLower.includes('pm') ||
        contextLower.includes('evening') ||
        contextLower.includes('night') ||
        lower.includes('pm');
    const isAM =
        contextLower.includes('am') ||
        contextLower.includes('morning') ||
        lower.includes('am');

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    if (isNaN(hours) || isNaN(minutes)) return null;

    return { hours, minutes };
};

// ── Scheduled notification ────────────────────────────────────────────────────
/**
 * Schedules a medication reminder notification at the specified IST time.
 *
 * CRITICAL: For TimeIntervalTrigger { seconds: N },
 * channelId must ONLY appear in the content object, NOT in the trigger.
 * Adding channelId to a seconds-based trigger is invalid and causes
 * Expo to silently fall back to immediate delivery.
 *
 * @param {object} medication - { id, name, dosage, time, context }
 */
export const scheduleNotification = async (medication) => {
    const parsed = parseTimeString(medication.time, medication.context);

    if (!parsed) {
        console.warn('[NotificationService] ⚠️ Could not parse time:', medication.time, 'for:', medication.name);
        return;
    }

    const { hours, minutes } = parsed;

    // Live IST time from API Ninjas
    const istNow = await getCurrentISTTime();

    // Smart nearest-occurrence: picks AM or PM whichever fires sooner
    const { delayMs, resolvedHour, resolvedMinute } = await msUntilScheduledTime(hours, minutes);

    // Minimum 30 seconds to avoid near-zero triggers in Expo Go
    // (anything < 30s from now should have been caught earlier as "too soon to schedule")
    const delaySeconds = Math.max(Math.round(delayMs / 1000), 30);

    const pad = n => n.toString().padStart(2, '0');
    const resolvedTimeStr = `${pad(resolvedHour)}:${pad(resolvedMinute)}`;

    // 12-hour display for the notification body
    const displayHour = resolvedHour % 12 || 12;
    const amPm = resolvedHour >= 12 ? 'PM' : 'AM';
    const displayTime = `${displayHour}:${pad(resolvedMinute)} ${amPm}`;

    console.log(
        `[NotificationService] ✅ "${medication.name}" → ` +
        `Fires at: ${resolvedTimeStr} IST (${displayTime}) | ` +
        `Current IST: ${pad(istNow.hour)}:${pad(istNow.minute)}:${pad(istNow.second)} | ` +
        `Delay: ${delaySeconds}s = ${Math.round(delaySeconds / 60)} min from now`
    );

    const status = await Notifications.getPermissionsAsync();
    console.log(`[NotificationService] 📱 Permission current status: ${status.status}, canAsk: ${status.canAskAgain}`);

    if (status.status !== 'granted') {
        console.warn('[NotificationService] ⚠️ Notifications are NOT granted. The reminder will be saved but NO alarm will trigger.');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: `💊 Reminder — ${medication.name}`,
            body: `Hello, I am Baymax. It is ${displayTime}. Time for your ${medication.dosage || '1 dose'} of ${medication.name}. Please take it now.`,
            data: {
                medicationId: medication.id,
                medicationName: medication.name,
                dosage: medication.dosage,
                snoozeCount: 0 // New reminder starts at 0 snoozes
            },
            sound: true,
            // ✅ categoryIdentifier for interactive actions
            categoryIdentifier: 'medication_reminder',
            // ✅ channelId is ONLY in content — correct placement for Android channel routing
            channelId: 'default',
        },
        trigger: {
            type: 'timeInterval', // SDK 53+ often requires an explicit type
            seconds: delaySeconds,
            repeats: false,
            // On some Expo versions, channelId is required here too, but type: 'timeInterval'
            // specifically tells the library how to interpret 'seconds'.
            channelId: 'default',
        },
    });

    console.log(`[NotificationService] 📅 Notification queued (ID: ${notificationId}). Will fire in ${Math.round(delaySeconds / 60)} minutes.`);
};

// ── Snooze notification (5 min from now, IST-accurate) ───────────────────────
export const scheduleSnoozeNotification = async (medication) => {
    const { hour, minute } = await getCurrentISTTime();

    // Increment snooze count
    const currentSnoozeCount = (medication.snoozeCount || 0) + 1;

    // If snoozed 2 times already (next one is the 3rd reminder), notify emergency contact
    if (currentSnoozeCount >= 2) {
        console.log(`[NotificationService] 🚨 Second snooze detected. Notifying emergency contact for ${medication.name}.`);
        await notifyEmergencyContact(medication);
    }

    const totalMinutes = hour * 60 + minute + 5;
    const snoozeHour = Math.floor(totalMinutes / 60) % 24;
    const snoozeMinute = totalMinutes % 60;

    const pad = n => n.toString().padStart(2, '0');
    const snoozeTimeStr = `${pad(snoozeHour)}:${pad(snoozeMinute)}`;

    console.log(`[NotificationService] 😴 Snooze #${currentSnoozeCount} scheduled for ${snoozeTimeStr} IST`);

    await Notifications.scheduleNotificationAsync({
        content: {
            title: `💊 Final Warning — ${medication.name}`,
            body: `Hello, I am Baymax. You have snoozed this twice. Please take your ${medication.dosage || 'dose'} of ${medication.name} immediately.`,
            data: {
                medicationId: medication.id,
                medicationName: medication.name,
                dosage: medication.dosage,
                snoozeCount: currentSnoozeCount
            },
            sound: true,
            categoryIdentifier: 'medication_reminder',
            channelId: 'default',
        },
        trigger: {
            type: 'timeInterval',
            seconds: 300,
            repeats: false,
            channelId: 'default',
        },
    });
};

// ── Notify Emergency Contact ────────────────────────────────────────────────
export const notifyEmergencyContact = async (medication) => {
    // In a real app, this would send an SMS or Push to a stored contact.
    // For now, we simulate with a special critical notification.
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🚨 Emergency Alert (Simulation)',
            body: `ALERT: The user has skipped their ${medication.name} dose twice. Please check on them.`,
            data: { type: 'emergency_contact_alert', medName: medication.name },
            sound: true,
            color: '#E11D48',
        },
        trigger: null, // Fire immediately
    });
};

// ── Define Notification Categories (Actions) ───────────────────────────────
export const setupNotificationCategories = async () => {
    await Notifications.setNotificationCategoryAsync('medication_reminder', [
        {
            identifier: 'TAKE_NOW',
            buttonTitle: '✅ Yes, I\'ll take now',
            options: {
                opensAppToForeground: true,
            },
        },
        {
            identifier: 'SNOOZE',
            buttonTitle: '⏰ After 5 mins',
            options: {
                opensAppToForeground: false, // Snooze can happen in background
            },
        },
    ]);
    console.log('[NotificationService] Notification category "medication_reminder" set up.');
};

export const requestPermissionsOptions = async () => {
    await setupNotificationCategories();

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Medication Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#E11D48',
            description: 'Baymax medication reminders.',
        });
        console.log('[NotificationService] Android notification channel "default" set up.');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log(`[NotificationService] Initial permission status: ${existingStatus}`);

    if (existingStatus !== 'granted') {
        console.log('[NotificationService] Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log(`[NotificationService] Permission request result: ${finalStatus}`);
    } else {
        console.log('[NotificationService] Permissions already granted.');
    }

    return finalStatus === 'granted';
};
