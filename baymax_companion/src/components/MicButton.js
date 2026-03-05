import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const MicButton = ({ isListening, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.button,
                isListening && styles.listeningGlow
            ]}
        >
            <MaterialCommunityIcons
                name={isListening ? "microphone" : "microphone-outline"}
                size={46}
                color={COLORS.white}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    listeningGlow: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.8,
        shadowRadius: 30,
        backgroundColor: '#1E90FF', // Brighter when listening
    }
});

export default MicButton;
