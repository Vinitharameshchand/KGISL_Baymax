import * as Speech from 'expo-speech';

// Export function to speak text out loud with calm/slow voice
export const speak = (text) => {
    Speech.speak(text, {
        rate: 0.8, // Slow and calm
        pitch: 1.0,
        language: 'en-US',
    });
};

export const stopSpeaking = () => {
    Speech.stop();
};
