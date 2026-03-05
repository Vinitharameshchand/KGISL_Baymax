import { AudioModule, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';

export const startRecordingAudio = async (onStatusUpdate) => {
    try {
        console.log('Requesting permissions..');
        const permission = await requestRecordingPermissionsAsync();

        if (permission.status !== 'granted') {
            console.log('Permission to access microphone is required!');
            return null;
        }

        await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
        });

        console.log('Starting recording..');
        const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);

        if (onStatusUpdate) {
            recorder.addListener('recordingStatusUpdate', onStatusUpdate);
        }

        await recorder.prepareToRecordAsync();
        recorder.record();

        return recorder;
    } catch (err) {
        console.error('Failed to start recording', err);
        return null;
    }
};

export const stopRecordingAudio = async (recorder) => {
    try {
        if (!recorder) return null;

        console.log('Stopping recording..');

        // Using recorder's own state for safety
        if (recorder.isRecording) {
            await recorder.stop();
        }

        await setAudioModeAsync({
            allowsRecording: false,
        });

        const uri = recorder.uri;
        console.log('Recording stopped and stored at', uri);
        return uri;
    } catch (err) {
        console.error('Failed to stop recording', err);
        return null;
    }
};

// Uses OpenAI Whisper (via Groq) to transcribe
export const transcribeAudio = async (uri, apiKey) => {
    try {
        console.log("Transcribing with OpenAI...");

        if (!uri) {
            console.error("No URI provided for transcription");
            return null;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', {
            uri: uri, // Use original URI as-is for FormData on both platforms
            name: 'audio.m4a',
            type: 'audio/m4a'
        });
        formData.append('model', 'whisper-large-v3');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Transcription API Error:", response.status, errorText);
            return null;
        }

        const data = await response.json();
        return data.text;
    } catch (e) {
        console.error("Failed to transcribe:", e);
        return null;
    }
};
