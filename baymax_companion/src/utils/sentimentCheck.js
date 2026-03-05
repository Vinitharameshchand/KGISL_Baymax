export const checkSentiment = (text) => {
    const negativeWords = ['sad', 'lonely', 'depressed', 'crying', 'alone', 'hurt', 'pain', 'hopeless', 'anxious', 'worried'];
    const textLower = text.toLowerCase();

    const isNegative = negativeWords.some(word => textLower.includes(word));

    return {
        isNegative,
        timestamp: new Date().toISOString()
    };
};
