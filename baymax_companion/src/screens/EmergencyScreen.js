import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { COLORS } from '../constants/colors';
import { logEmergencyIncident } from '../services/emergencyService';

const EmergencyScreen = ({ navigation }) => {
    const [contactNumber, setContactNumber] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const loadContact = async () => {
            const savedContact = await AsyncStorage.getItem('@emergency_contact');
            if (savedContact) setContactNumber(savedContact);
        };
        loadContact();
    }, []);

    const saveContact = async () => {
        if (!contactNumber.trim()) return;
        await AsyncStorage.setItem('@emergency_contact', contactNumber);
        setIsEditing(false);
        Alert.alert("Saved", "Emergency contact updated successfully.");
    };

    const handleAmbulance = async () => {
        await logEmergencyIncident("Called Ambulance (911)");
        Alert.alert(
            "Confirm Call",
            "Are you sure you want to call emergency services?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Call",
                    style: "destructive",
                    onPress: () => Linking.openURL('tel:911')
                }
            ]
        );
    };

    const handleContact = async () => {
        if (!contactNumber) {
            Alert.alert("No Contact", "Please configure an emergency contact first.");
            setIsEditing(true);
            return;
        }
        await logEmergencyIncident(`Called Emergency Contact (${contactNumber})`);
        Alert.alert(
            "Confirm Call",
            `Call your emergency contact (${contactNumber})?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Call",
                    onPress: () => Linking.openURL(`tel:${contactNumber}`)
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.protocolBadge}>
                    <MaterialCommunityIcons name="security" size={16} color={COLORS.error} />
                    <Text style={styles.protocolText}>SAFETY PROTOCOL</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.alertCircle}>
                    <MaterialCommunityIcons name="alert-decagram" size={64} color={COLORS.error} />
                </View>
                <Text style={styles.title}>Immediate Assistance</Text>
                <Text style={styles.subtitle}>
                    If you are experiencing a medical emergency, please use the triggers below.
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleAmbulance}>
                    <View style={styles.btnIcon}>
                        <MaterialCommunityIcons name="ambulance" size={28} color={COLORS.white} />
                    </View>
                    <View style={styles.btnContent}>
                        <Text style={styles.btnLabel}>Emergency Services</Text>
                        <Text style={styles.btnSubLabel}>Call 911 immediately</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <View style={styles.contactRow}>
                    <TouchableOpacity style={[styles.secondaryBtn, { flex: 1, marginBottom: 0 }]} onPress={handleContact}>
                        <View style={[styles.btnIcon, { backgroundColor: 'rgba(255,159,10,0.2)' }]}>
                            <MaterialCommunityIcons name="account-alert" size={28} color="#FF9F0A" />
                        </View>
                        <View style={styles.btnContent}>
                            <Text style={[styles.btnLabel, { color: COLORS.text }]}>Emergency Contact</Text>
                            <Text style={styles.btnSubLabel}>{contactNumber ? contactNumber : "Not configured"}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.border} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => setIsEditing(!isEditing)}
                    >
                        <MaterialCommunityIcons name="pencil" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {isEditing && (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter contact number"
                            placeholderTextColor={COLORS.textSecondary}
                            value={contactNumber}
                            onChangeText={setContactNumber}
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={saveContact}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.outlineText}>Everything is under control</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 60,
    },
    protocolBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    protocolText: {
        color: COLORS.error,
        fontSize: 11,
        fontWeight: '800',
        marginLeft: 6,
        letterSpacing: 1,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    content: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    alertCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -1,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
        paddingHorizontal: 20,
        fontWeight: '500',
    },
    buttonContainer: {
        flex: 1,
    },
    primaryBtn: {
        backgroundColor: COLORS.error,
        padding: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: COLORS.error,
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    secondaryBtn: {
        backgroundColor: COLORS.white,
        padding: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    btnIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    btnContent: {
        flex: 1,
    },
    btnLabel: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
    },
    btnSubLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.8,
    },
    outlineBtn: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    outlineText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    editBtn: {
        width: 50,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    editContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 16,
        marginRight: 10,
        backgroundColor: COLORS.white,
        color: COLORS.text,
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    saveBtnText: {
        color: COLORS.white,
        fontWeight: '700',
    }
});

export default EmergencyScreen;
