# Baymax Companion App

**Baymax Companion** is an intelligent, offline-capable mobile healthcare assistant built using React Native and Expo. It leverages advanced natural language processing (NLP) to provide a voice-first experience for managing medications, tracking vitals, monitoring daily health habits, and ensuring personal safety through automated emergency protocols.

---

## 🚀 Features

### 🗣️ Smart Voice Assistant
- Powered by Whisper (Speech-to-Text) and LLaMA-3.3 APIs.
- Effortlessly set medication reminders using natural voice commands (e.g., *"Remind me to take Aspirin at 8 PM"*).
- Simply say *"I took my medicine"* to log adherence.
- Receive empathetic, conversational responses modeled after a personal healthcare companion.

### 💊 Medication Tracker & Automated Notifications
- **Chronological Parsing:** Automatically extracts drug names and precise times from your voice prompt using Chrono-Node.
- **Offline Push Alerts:** Schedules native OS alarm banners that trigger reliably even if the device loses internet access.
- **Actionable Tracking:** Tap "Take" to physically log a dose or "Snooze" to intelligently delay the alarm by 10 minutes.

### 🩺 Vitals & Wellbeing Scan
- Performs simulated visual health checks and asks for your current pain scale out of 10 natively via the voice handler.
- Tracks emotional patterns continuously via voice sentiment analysis to generate a "Mood Trend".

### 💧 Hydration Analytics
- Track your daily water intake with a single tap. 
- Progress visuals constantly update based on your unique health goals.

### 📈 Trends & Dashboard Reports
- Aggregates your physical pill adherence, missed doses, and logged pain scales into a clear **Health Score**.
- Shows dynamic insights and actionable health warnings directly on the Dashboard.

### 🚨 Native Emergency Protocol
- Save a custom Emergency Guardian phone number directly to the device's secure local memory.
- In a crisis, the Red Emergency button instantly pauses the app and hands the Guardian's number back to the phone's native dialer to place a live call.

---

## 🏗️ System Architecture 

The application follows an **Offline-First Client Architecture**. 
All data (Medications, Adherence Logs, Pain Levels, Custom Settings) is persisted exclusively onto the user's localized device storage via `AsyncStorage`. The only external dependencies are stateless REST API calls to Groq Cloud for speech/text processing.

### Communication Flow
1. **User speaks** -> App captures audio via native Microphone.
2. **Audio sent to Cloud** -> Whisper returns accurate text.
3. **App parses intent** -> Uses Chrono-Node to find times; API extracts logic.
4. **App writes to Storage** -> JSON is saved safely to `AsyncStorage`.
5. **App sets Native Alarm** -> `expo-notifications` alerts the OS clock.
6. **Alarm Rings later** -> User is prompted to take action (app handles offline).

---

## 💻 Tech Stack
- **Frontend Framework:** React Native, Expo
- **Language / Parsing:** JavaScript, Chrono-Node
- **AI & NLP Processing:** Groq Cloud APIs (Whisper for Audio Transcription, LLaMA-3.3 70B for Intent generation)
- **Local Persistence:** React Native AsyncStorage
- **Notifications:** Expo Notifications
- **Routing:** React Navigation

---

## 🛠️ Project Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and the [Expo CLI](https://expo.dev/) installed.
It's recommended to test using the **Expo Go** application on your physical iOS or Android device.

### 1. Clone the repository
```bash
git clone https://github.com/Vinitharameshchand/KGISL_Baymax.git
cd KGISL_Baymax
```

### 2. Enter the app directory
```bash
cd baymax_companion
```

### 3. Install dependencies
```bash
npm install
```

### 4. Provide Environment & API Definitions
Ensure you have replaced the default API constants in `src/services/aiService.js` and `src/services/audioService.js` with your active Groq API Key if necessary for deployment, although placeholders are pre-configured for sandbox review.

### 5. Run the Application
Start the Expo development server:
```bash
npx expo start
```
- Open the **Expo Go** app on your physical device.
- Scan the QR code rendered in your terminal.
- *Note: Emulators can be utilized by pressing `i` (for iOS Simulator) or `a` (for Android Emulator) within the active terminal, though a physical device is required for native Microphone support.*

---

## 📖 Usage Guide

1. **Dashboard:** Monitor your Health Score (an average of adherence and sentiment).
2. **Setup Emergency:** Tap the Red "Emergency Support" card on the Home screen to securely save your Guardian's phone number.
3. **Voice Scheduling:** Tap the Home page purple Microphone > hold your finger down on the glowing mic > Say *"Set a reminder for Ibuprofen at 10 AM"* > Release.
4. **Alarms:** Accept the system prompt to allow push notifications when requested.
5. **Review Analytics:** Tap the "Trends" tab to monitor your actual hydration rate, skipped pill logs, and average recorded pain scale.

---

*“I cannot deactivate until you say you are satisfied with your care.”*
