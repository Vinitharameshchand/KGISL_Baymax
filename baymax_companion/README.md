# Voice-Based AI Medication Adherence Tracker (Baymax Companion)

A mobile-based AI assistant that reminds users to take their medications on time using voice interaction and tracks medication adherence.

---

## Project Overview

Medication non-adherence is a major healthcare issue, especially among elderly individuals and patients with chronic illnesses. Many patients forget to take medications at scheduled times, which can lead to serious health complications.

The **Voice-Based AI Medication Adherence Tracker** is a mobile application that provides **AI-powered voice reminders**, allows users to **confirm medication intake using voice commands**, and tracks medication adherence history.

The application works similarly to voice assistants like Siri or Google Assistant, providing an easy-to-use voice interface for medication management.

---

## Features

### Voice Reminder System
- **Automated Voice Triggers**: Baymax speaks instructions automatically when it's time for medication.
- **Context-Aware Scheduling**: Understands natural voice commands like "Remind me to take Aspirin at 9 PM."
- **Foreground Automation**: If the app is open, Baymax triggers voice feedback without user interaction.
- **Tap-to-Speak (Background)**: Tapping a lock-screen notification immediately initiates Baymax's voice assistance.

### Medication Management
- Add medications with custom names and dosages.
- Set specific times (HH:MM) for daily reminders.
- Track "taken" status to build daily streaks.
- Visualize health trends and adherence in a dedicated dashboard.

### Loneliness & Emotional Support
- AI conversational support to reduce loneliness among elderly users.
- Sentiment analysis to offer breathing exercises or gentle encouragement.

---

## Technology Stack

| Layer | Technology |
|------|-------------|
| Mobile Application | React Native / Expo |
| AI / LLM | Groq / Llama 3.3 (via aiService) |
| Voice Processing | Expo Speech (TTS) & AI Transcription (STT) |
| Storage | AsyncStorage (Local Persistence) |

---

## Setup Instructions

1. **Clone or Open the Project**:
   Ensure you are in the `baymax-companion` directory.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Required APIs**:
   Open `src/services/aiService.js` and ensure your API key is configured.

4. **Run the App**:
   ```bash
   npx expo start
   ```

5. **Scan and Test**:
   - Use the **Expo Go** app to scan the QR code.
   - For the best experience with voice and notifications, use a physical device.

---

## System Architecture

The application follows a modular architecture for scalability:

1. **Presentation Layer**: React Native screens for Medication, Voice, Dashboard, and Breathing exercises.
2. **Service Layer**: 
   - `aiService`: Handles LLM communication and time synchronization.
   - `notificationService`: Manages system-level scheduling and catch-up triggers.
   - `voiceService`: Provides Text-to-Speech (TTS) capabilities.
3. **Data Layer**: Local storage using `AsyncStorage` to track medication history and mood.
