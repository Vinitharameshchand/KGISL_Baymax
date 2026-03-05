/**
 * VoiceScreen.js
 *
 * Complete end-to-end voice pipeline:
 *
 *  1. 🎙️  User presses & holds mic button  → startRecordingAudio()
 *  2. 🎙️  User releases button            → stopRecordingAudio() → audio URI
 *  3. 📝  Audio URI sent to Whisper        → transcribeAudio() → text transcript
 *  4. 🔍  Intent detection on transcript:
 *           a. Emergency phrases          → navigate to EmergencyScreen
 *           b. "took / taken / did" + med → logDoseTaken()
 *           c. Reminder intent            → Chrono NLP extract time
 *                                           → getAIResponse() for med name
 *                                           → saveMedication() → scheduleNotification()
 *           d. General conversation       → getAIResponse()
 *  5. 🔊  Baymax speaks the response      → speak()
 */

// ── Imports ─────────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import uuid from 'react-native-uuid';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import WaveAnimation from '../components/WaveAnimation';
import { COLORS } from '../constants/colors';

import { getAIResponse, OPENAI_API_KEY } from '../services/aiService';
import { startRecordingAudio, stopRecordingAudio, transcribeAudio } from '../services/audioService';
import { checkEmergency } from '../services/emergencyService';
import { getMedications, logDoseTaken, saveMedication, snoozeMedication } from '../services/medicationService';
import { getCurrentISTTime } from '../services/timeService';
import { speak, stopSpeaking } from '../services/voiceService';
import { checkSentiment } from '../utils/sentimentCheck';

// chrono-node via CJS path to avoid Metro ESM resolution issues
const chrono = require('chrono-node/dist/cjs/index.js');

// ── Constants ────────────────────────────────────────────────────────────────
const REMINDER_KEYWORDS = [
    'remind', 'reminder', 'schedule', 'set a reminder',
    'set reminder', 'alarm', 'alert', 'notify', 'notification',
    'set an alarm', 'don\'t forget', 'remember to',
];

const TAKEN_KEYWORDS = ['took', 'taken', 'had', 'finished', 'completed', 'done with'];
const SNOOZE_KEYWORDS = ['snooze', 'remind me later', 'remind me again', '10 minutes'];
const SKIP_KEYWORDS = ['skip', 'skipping', 'not taking', 'won\'t take'];
const WATER_DRANK_KEYWORDS = ['drank water', 'drank a glass', 'had water', 'finished my water'];
const EMERGENCY_CALL_KEYWORDS = ['call my son', 'call my daughter', 'call emergency', 'call my family', 'call help'];

// ── Component ────────────────────────────────────────────────────────────────
const VoiceScreen = ({ navigation }) => {
    const [phase, setPhase] = useState('idle'); // idle | listening | processing | speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('Hold the button below and speak to me.');
    const [reminderConfirm, setReminderConfirm] = useState(null); // { name, time } after saving

    const recordingRef = useRef(null);
    const speakTimeoutRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSpeaking();
            clearTimeout(speakTimeoutRef.current);
            if (recordingRef.current) {
                stopRecordingAudio(recordingRef.current).catch(() => { });
            }
        };
    }, []);

    // ── Mic handlers ─────────────────────────────────────────────────────────
    const handlePressIn = async () => {
        if (phase === 'listening' || phase === 'processing') return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        stopSpeaking();
        clearTimeout(speakTimeoutRef.current);

        setTranscript('');
        setAiResponse('Listening...');
        setReminderConfirm(null);
        setPhase('listening');

        try {
            const recorder = await startRecordingAudio();
            if (recorder) {
                recordingRef.current = recorder;
            } else {
                setPhase('idle');
                setAiResponse('Microphone access denied. Please check your permissions.');
            }
        } catch (err) {
            console.error('[VoiceScreen] startRecording error:', err);
            setPhase('idle');
        }
    };

    const handlePressOut = async () => {
        if (phase !== 'listening') return;
        setPhase('processing');

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAiResponse('Thinking...');

        const recorder = recordingRef.current;
        recordingRef.current = null;

        try {
            const uri = await stopRecordingAudio(recorder);

            if (!uri) {
                setAiResponse("I didn't catch anything. Try again!");
                setPhase('idle');
                return;
            }

            // ── Step 3: Transcribe ──────────────────────────────────────────
            setAiResponse('Transcribing...');
            const text = await transcribeAudio(uri, OPENAI_API_KEY);

            if (!text || !text.trim()) {
                setAiResponse("I couldn't understand that. Could you speak a bit louder?");
                setPhase('idle');
                return;
            }

            setTranscript(text.trim());
            setAiResponse('Processing...');

            // ── Step 4: Intent routing ──────────────────────────────────────
            await routeIntent(text.trim());

        } catch (err) {
            console.error('[VoiceScreen] handlePressOut error:', err);
            setAiResponse("Something went wrong. I am still here for you.");
            setPhase('idle');
        }
    };

    // ── Intent Router (Step 4) ────────────────────────────────────────────────
    const routeIntent = async (text) => {
        const lower = text.toLowerCase();

        // 4a. Emergency check
        if (checkEmergency(text)) {
            speak('Emergency mode activated. Navigating to emergency screen now.');
            navigation.navigate('Emergency');
            setPhase('idle');
            return;
        }

        // 4a-2. Emergency Call intent
        if (EMERGENCY_CALL_KEYWORDS.some(kw => lower.includes(kw))) {
            speak('I am calling your emergency contact right now. Please stay calm.');
            setTimeout(() => {
                navigation.navigate('Emergency');
            }, 2000);
            return;
        }

        // 4a-3. Water intake intent
        if (WATER_DRANK_KEYWORDS.some(kw => lower.includes(kw))) {
            const { logWaterDrop } = require('../services/waterService');
            await logWaterDrop();
            return respondWith("Excellent. Staying hydrated is vital for your health. I have logged that glass of water for you.");
        }

        // Store mood sentiment
        const sentiment = checkSentiment(text);
        storeMoodAsync(sentiment.isNegative);

        const meds = await getMedications();

        // 4b. Dose logging — "I took my Aspirin"
        if (TAKEN_KEYWORDS.some(kw => lower.includes(kw))) {
            const matchedMed = meds.find(m => lower.includes(m.name.toLowerCase()));
            if (matchedMed) {
                await logDoseTaken(matchedMed.id);
                const reply = `Great job! I have recorded that you took your ${matchedMed.name}. Keep up the streak!`;
                return respondWith(reply);
            }
        }

        // 4c. Snooze — "remind me later"
        if (SNOOZE_KEYWORDS.some(kw => lower.includes(kw))) {
            const pendingMed = meds.find(m => !m.takenToday);
            if (pendingMed) {
                await snoozeMedication(pendingMed.id);
                const reply = `I will remind you about your ${pendingMed.name} again in 10 minutes.`;
                return respondWith(reply);
            }
        }

        // 4d. Skip dose — "I am skipping my Aspirin"
        if (SKIP_KEYWORDS.some(kw => lower.includes(kw))) {
            const matchedMed = meds.find(m => lower.includes(m.name.toLowerCase())) || meds.find(m => !m.takenToday);
            const reply = matchedMed
                ? `Okay, I will note that you are skipping your ${matchedMed.name} today. Consistent schedules help your recovery. This is not a medical diagnosis.`
                : "Okay. Consistent schedules help your recovery. This is not a medical diagnosis.";
            return respondWith(reply);
        }

        // 4e. Reminder intent — Chrono + AI
        const isReminderIntent = REMINDER_KEYWORDS.some(kw => lower.includes(kw));
        const chronoResults = chrono.parse(text);

        if (isReminderIntent) {
            return await handleReminderIntent(text, chronoResults);
        }

        // 4f. General AI conversation
        const aiReply = await getAIResponse(text);

        let finalReply = aiReply;
        if (sentiment.isNegative && !aiReply.toLowerCase().includes('breath')) {
            finalReply += ' You sound a little stressed. Would you like a breathing exercise?';
        }

        respondWith(finalReply);
    };

    // ── Reminder Handler (Step 4e) ──────────────────────────────────────────
    const handleReminderIntent = async (text, chronoResults) => {
        // Get current IST so Chrono can correctly resolve relative times
        // e.g. "in 20 minutes" → uses current IST as reference
        const ist = await getCurrentISTTime();
        const refDate = new Date();
        refDate.setHours(ist.hour, ist.minute, ist.second, 0);

        // Re-parse with IST reference date for relative expressions
        const chronoWithRef = chrono.parse(text, refDate);
        const parsed = chronoWithRef.length > 0 ? chronoWithRef : chronoResults;

        // Simultaneously get AI response for medication name
        const aiReply = await getAIResponse(text);

        // Extract medication name from AI [REMINDER:Name:HH:MM] tag or fallback
        const reminderTag = aiReply.match(/\[REMINDER:(.*?):(.*?)]/i);

        if (parsed.length === 0 && !reminderTag) {
            // No time found at all — ask user to clarify
            const clarify = "I want to set that reminder for you! Could you tell me the exact time? For example: 'at 9 PM' or 'in 30 minutes'.";
            return respondWith(clarify);
        }

        let finalHour, finalMinute, medName;

        if (parsed.length > 0) {
            // ── Chrono extracted a time ──────────────────────────────────────
            const extracted = parsed[0].start.date();
            finalHour = extracted.getHours();
            finalMinute = extracted.getMinutes();
        } else if (reminderTag) {
            // ── AI tag has a time ─────────────────────────────────────────────
            const [, , aiTime] = reminderTag;
            const [h, m] = aiTime.split(':').map(Number);
            finalHour = h;
            finalMinute = m;
        }

        // Get medication name: prefer AI tag, then try to find it in the text
        if (reminderTag) {
            medName = reminderTag[1].trim();
        } else {
            // Try to match existing medication names
            const existingMedsStr = (await getMedications()).map(m => m.name.toLowerCase());
            const words = text.split(/\s+/);
            const found = words.find(w => existingMedsStr.includes(w.toLowerCase()));
            medName = found ? found.charAt(0).toUpperCase() + found.slice(1) : 'Medication';
        }

        const pad = n => n.toString().padStart(2, '0');
        const formattedTime = `${pad(finalHour)}:${pad(finalMinute)}`;

        // ── Step 5: Save reminder to storage + schedule notification ───────
        const newMed = {
            id: uuid.v4(),
            name: medName,
            time: formattedTime,
            dosage: '1 dose',
            takenToday: false,
            streakCount: 0,
            context: text,
        };

        await saveMedication(newMed);

        // Convert to 12-hour for display
        const displayHour = finalHour % 12 || 12;
        const amPm = finalHour >= 12 ? 'PM' : 'AM';
        const displayTime = `${displayHour}:${pad(finalMinute)} ${amPm}`;

        setReminderConfirm({ name: medName, time: displayTime });

        // Clean AI response of internal tags
        const cleanReply = aiReply.replace(/\[REMINDER:.*?]/gi, '').trim() ||
            `Done! I have scheduled your ${medName} reminder for ${displayTime} IST. I will notify you on time.`;

        respondWith(cleanReply);
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const respondWith = (text) => {
        setAiResponse(text);
        setPhase('speaking');
        speak(text);
        speakTimeoutRef.current = setTimeout(() => {
            setPhase('idle');
        }, Math.min(text.length * 55 + 1000, 15000));
    };

    const storeMoodAsync = async (isNegative) => {
        try {
            const moodScore = isNegative ? 40 : 90;
            const stored = await AsyncStorage.getItem('@moods');
            const moods = stored ? JSON.parse(stored) : [];
            const updated = [...moods, { score: moodScore, date: new Date().toISOString() }].slice(-10);
            await AsyncStorage.setItem('@moods', JSON.stringify(updated));
        } catch (e) {
            console.warn('[VoiceScreen] Could not store mood:', e);
        }
    };

    // ── Derived UI state ──────────────────────────────────────────────────────
    const isListening = phase === 'listening';
    const isProcessing = phase === 'processing';
    const isSpeaking = phase === 'speaking';

    const micLabel = isListening ? 'Listening...'
        : isProcessing ? 'Processing...'
            : isSpeaking ? 'Speaking...'
                : 'Hold to speak';

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => { stopSpeaking(); navigation.goBack(); }}
            >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>

            {/* Status pill */}
            <View style={styles.statusPill}>
                <View style={[styles.statusDot, {
                    backgroundColor: isListening ? '#22C55E'
                        : isProcessing ? '#F59E0B'
                            : isSpeaking ? COLORS.secondary
                                : COLORS.border
                }]} />
                <Text style={styles.statusPillText}>{micLabel}</Text>
            </View>

            {/* Conversation area */}
            <ScrollView contentContainerStyle={styles.textContainer} showsVerticalScrollIndicator={false}>
                {/* User transcript bubble */}
                {!!transcript && (
                    <View style={styles.userBubble}>
                        <Text style={styles.userBubbleLabel}>You</Text>
                        <Text style={styles.userBubbleText}>{transcript}</Text>
                    </View>
                )}

                {/* Baymax response */}
                <Text style={styles.aiText}>{aiResponse}</Text>

                {/* Reminder confirmation card */}
                {reminderConfirm && (
                    <View style={styles.confirmCard}>
                        <MaterialCommunityIcons name="bell-check-outline" size={22} color={COLORS.success} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.confirmTitle}>Reminder Scheduled</Text>
                            <Text style={styles.confirmDetail}>{reminderConfirm.name} · {reminderConfirm.time} IST</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Mic area */}
            <View style={styles.micContainer}>
                <WaveAnimation active={isListening || isSpeaking} />

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.micButton,
                        isListening && styles.micListening,
                        isSpeaking && styles.micSpeaking,
                    ]}
                    disabled={isProcessing}
                >
                    <MaterialCommunityIcons
                        name={isListening ? 'microphone' : isSpeaking ? 'volume-high' : 'microphone-outline'}
                        size={48}
                        color={COLORS.white}
                    />
                </TouchableOpacity>

                <Text style={styles.micLabel}>{micLabel}</Text>

                {/* Quick hint */}
                {phase === 'idle' && (
                    <Text style={styles.hintText}>
                        Try: "Remind me to take Aspirin at 9 PM"
                    </Text>
                )}
            </View>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    closeBtn: {
        position: 'absolute',
        top: 58,
        right: 24,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 3,
    },
    statusPill: {
        position: 'absolute',
        top: 62,
        left: 24,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 3,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 7,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    textContainer: {
        padding: 28,
        paddingTop: 130,
        paddingBottom: 20,
        flexGrow: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderBottomRightRadius: 4,
        padding: 16,
        marginBottom: 24,
        maxWidth: '82%',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    userBubbleLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    userBubbleText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    aiText: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    confirmCard: {
        marginTop: 28,
        backgroundColor: '#ECFDF5',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    confirmTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.success,
    },
    confirmDetail: {
        fontSize: 13,
        fontWeight: '600',
        color: '#065F46',
        marginTop: 2,
    },
    micContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 52,
        paddingTop: 24,
        height: 320,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 46,
        borderTopRightRadius: 46,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
        elevation: 16,
    },
    micButton: {
        width: 112,
        height: 112,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        elevation: 10,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    micListening: {
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
        shadowOpacity: 0.5,
        transform: [{ scale: 1.06 }],
    },
    micSpeaking: {
        backgroundColor: COLORS.secondary,
        shadowColor: COLORS.secondary,
        shadowOpacity: 0.45,
    },
    micLabel: {
        color: COLORS.textSecondary,
        marginTop: 18,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    hintText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
        opacity: 0.7,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
});

export default VoiceScreen;
