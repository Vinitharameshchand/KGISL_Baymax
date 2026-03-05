export const checkEmergency = (text) => {
    const emergencyPhrases = ["chest pain", "can't breathe", "help me", "heart attack", "dying"];
    const textLower = text.toLowerCase();

    return emergencyPhrases.some(phrase => textLower.includes(phrase));
};

export const logEmergencyIncident = async (details) => {
    // Use AsyncStorage or similar to record emergency logs
    console.log("Emergency Incident Logged:", details);
};
