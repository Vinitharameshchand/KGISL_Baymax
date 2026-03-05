import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { COLORS } from './src/constants/colors';
import { requestPermissionsOptions } from './src/services/notificationService';
import { speak } from './src/services/voiceService';

import BreathingScreen from './src/screens/BreathingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import HomeScreen from './src/screens/HomeScreen';
import MedicationScreen from './src/screens/MedicationScreen';
import ScanScreen from './src/screens/ScanScreen';
import VoiceScreen from './src/screens/VoiceScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Suppress Expo Go notification warnings at MODULE LEVEL.
// These fire during module initialisation (before React renders),
// so they MUST be here — not inside useEffect — to take effect in time.
// These are expected limitations of Expo Go with SDK 53; local scheduled
// notifications (scheduleNotificationAsync) still work fine.
// ─────────────────────────────────────────────────────────────────────────────
LogBox.ignoreLogs([
    // Remote push notifications removed from Expo Go in SDK 53
    'expo-notifications: Android Push notifications',
    // General Expo Go notification limitation warning
    '`expo-notifications` functionality is not fully supported in Expo Go',
    // Deprecated shouldShowAlert replaced by shouldShowBanner + shouldShowList
    'shouldShowAlert is deprecated',
    '[expo-notifications]',
]);

const Stack = createNativeStackNavigator();

export default function App() {
    useEffect(() => {
        requestPermissionsOptions();

        // When a notification arrives while app is OPEN → play Baymax voice
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            const data = notification.request.content.data;
            const title = notification.request.content.title || '';
            const body = notification.request.content.body || '';
            if (data?.medicationId) {
                // Extract name from body: "Time for your 1 dose of Aspirin. Please take it now."
                const nameMatch = body.match(/of\s+([^.]+)\./i);
                const medName = nameMatch ? nameMatch[1].trim() : 'your medicine';
                speak(`Hello. I am Baymax. It is time for your ${medName}. Please take it now.`);
            }
        });

        // When user TAPS the notification from the tray or uses an ACTION
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(async response => {
            const { actionIdentifier, notification } = response;
            const data = notification.request.content.data;
            const body = notification.request.content.body || '';

            if (data?.medicationId) {
                const medName = data.medicationName || 'your medicine';

                if (actionIdentifier === 'TAKE_NOW') {
                    const { logDoseTaken } = require('./src/services/medicationService');
                    speak(`Excellent choice! I am glad you are taking your ${medName} now. I have logged this for you.`);
                    await logDoseTaken(data.medicationId);
                } else if (actionIdentifier === 'SNOOZE') {
                    // Import Snooze if not already available (it should be in notificationService)
                    const { scheduleSnoozeNotification } = require('./src/services/notificationService');
                    speak(`Understood. I will remind you again in 5 minutes. Please don't forget.`);
                    await scheduleSnoozeNotification({
                        id: data.medicationId,
                        name: data.medicationName,
                        dosage: data.dosage,
                        snoozeCount: data.snoozeCount || 0
                    });
                } else {
                    // Default tap behavior
                    speak(`Hello. I am Baymax. You opened the reminder for ${medName}. Have you taken your dose?`);
                }
            }
        });

        return () => {
            foregroundSubscription.remove();
            responseSubscription.remove();
        };
    }, []);

    return (
        <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.background },
                    headerShadowVisible: false,
                    headerTintColor: COLORS.text,
                    headerTitleStyle: { fontWeight: '800', fontSize: 18 },
                    contentStyle: { backgroundColor: COLORS.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Voice"
                    component={VoiceScreen}
                    options={{
                        headerShown: false,
                        animation: 'fade',
                        presentation: 'transparentModal'
                    }}
                />
                <Stack.Screen
                    name="Medication"
                    component={MedicationScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Emergency"
                    component={EmergencyScreen}
                    options={{
                        headerShown: false,
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="Scan"
                    component={ScanScreen}
                    options={{
                        headerShown: false,
                        animation: 'fade',
                    }}
                />
                <Stack.Screen
                    name="Breathing"
                    component={BreathingScreen}
                    options={{
                        headerShown: false,
                        animation: 'slide_from_bottom',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
