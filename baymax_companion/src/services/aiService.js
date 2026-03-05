// Make sure to configure your OpenAI API key correctly.
// For production, use a backend server instead of exposing it in client side.
export const OPENAI_API_KEY = "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"; // REPLACE WITH ACTUAL KEY IF NO BACKEND


const SYSTEM_PROMPT = `You are Baymax, a compassionate healthcare and emotional support assistant.
You speak calmly and warmly. 
You help with medication reminders, daily tasks, and general health advice.
You support patients who feel lonely or stressed.

CORE FEATURES:
1. REMINDERS: If the user asks to set a reminder/alarm, include: [REMINDER:Item:HH:MM]
2. SNOOZE: If the user says "remind me later" or "snooze", acknowledge and the system will handle a 10-minute delay.
3. SKIP: If the user says "I am skipping my dose", be supportive but remind them of the importance of consistency if it's safe to do so.

STRICTURES:
- Never diagnose serious medical conditions. Recommend immediate medical attention for severe symptoms.
- Always add: 'This is not a medical diagnosis.'
- Use 24-HOUR format for tags: e.g., [REMINDER:Water:14:00].
- Keep responses short, gentle, and reassuring.`;


export const getAIResponse = async (userMessage) => {
    try {
        const { getFormattedISTTime } = require('./timeService');
        const currentTime = await getFormattedISTTime();

        let response;
        try {
            console.log("Sending Groq request with userMessage:", userMessage, "Current IST Time:", currentTime);
            response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `${SYSTEM_PROMPT}\n\nThe current time is ${currentTime} IST (Asia/Kolkata). 
                            If the user says 'in X minutes/hours', calculate the absolute time based on this current time.
                            DO NOT trigger the reminder immediately unless the user specifically asks for 'now'.`
                        },
                        { role: "user", content: String(userMessage) }
                    ],
                    temperature: 0.7,
                    max_tokens: 150,
                }),
            });
            console.log("Groq fetch response status:", response.status);
        } catch (fetchError) {
            console.error("Fetch threw error:", fetchError);
            throw fetchError;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Groq API error status:", response.status, errorData);
            return "I am currently having trouble connecting. But I am still here for you. This is not a medical diagnosis.";
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            console.error("Groq API Error Response:", data);
            return "I am currently having trouble connecting. But I am still here for you. This is not a medical diagnosis.";
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Service Error:", error);
        return "I am currently having trouble connecting. But I am still here for you. This is not a medical diagnosis.";
    }
};
