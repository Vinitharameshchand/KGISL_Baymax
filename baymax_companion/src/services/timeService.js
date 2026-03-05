/**
 * timeService.js
 * Fetches accurate IST time via API Ninjas World Time API.
 * Falls back to device time if the API is unavailable.
 */

const API_NINJAS_KEY = 'PDMuYz2Dau24DDFib8zlmKdgyVEFEeCetRGolV3P';
const TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_12H = 12 * MS_PER_HOUR;

/**
 * Fetches the current IST time from API Ninjas World Time.
 * @returns {{ hour, minute, second, datetime, date, day_of_week }}
 */
export const getCurrentISTTime = async () => {
    try {
        const response = await fetch(
            `https://api.api-ninjas.com/v1/worldtime?timezone=${TIMEZONE}`,
            { headers: { 'X-Api-Key': API_NINJAS_KEY } }
        );

        if (!response.ok) throw new Error(`API Ninjas error: ${response.status}`);

        const data = await response.json();
        const hour = parseInt(data.hour, 10);
        const minute = parseInt(data.minute, 10);
        const second = parseInt(data.second, 10);

        console.log(`[TimeService] IST via API Ninjas: ${data.hour}:${data.minute}:${data.second}`);

        return {
            hour, minute, second,
            datetime: data.datetime,  // "YYYY-MM-DD HH:MM:SS"
            date: data.date,          // "YYYY-MM-DD"
            day_of_week: data.day_of_week,
        };
    } catch (err) {
        console.warn('[TimeService] API Ninjas failed, using device time:', err.message);
        return getDeviceISTTime();
    }
};

/**
 * Device-based IST fallback.
 */
export const getDeviceISTTime = () => {
    const now = new Date();
    const istStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istStr);

    const hour = istDate.getHours();
    const minute = istDate.getMinutes();
    const second = istDate.getSeconds();

    const pad = n => n.toString().padStart(2, '0');
    const datetime = `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
    const date = `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())}`;

    console.log(`[TimeService] Device IST fallback: ${pad(hour)}:${pad(minute)}:${pad(second)}`);
    return { hour, minute, second, datetime, date };
};

/**
 * Returns a formatted HH:MM string of the current IST time.
 */
export const getFormattedISTTime = async () => {
    const { hour, minute } = await getCurrentISTTime();
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(hour)}:${pad(minute)}`;
};

/**
 * Computes milliseconds from now (IST) until the next occurrence of targetHour:targetMinute.
 *
 * KEY SMART LOGIC — "NEAREST OCCURRENCE":
 * If the target is more than 12 hours away AND the hour is between 1–12
 * (i.e. could be AM or PM), we also try the alternate 12-hour shift.
 * Whichever fires SOONER is chosen.
 *
 * Examples:
 *   User says "12 o'clock" at 23:59 IST
 *     → 12:00 PM = 721 min away
 *     → 00:00 AM = 1 min away   ← CHOSEN ✅
 *
 *   User says "9 PM" at 08:00 IST
 *     → 21:00 = 780 min away
 *     → no alternate needed (> 12 hr but not ambiguous since "PM" is explicit)
 *
 *   User says "9 o'clock" at 07:00 IST
 *     → 09:00 = 120 min away   ← CHOSEN ✅ (closer)
 *     → 21:00 = 840 min away
 *
 * @param {number} targetHour   — 0–23
 * @param {number} targetMinute — 0–59
 * @returns {Promise<{ delayMs: number, resolvedHour: number, resolvedMinute: number }>}
 */
export const msUntilScheduledTime = async (targetHour, targetMinute) => {
    const { hour, minute, second, date } = await getCurrentISTTime();

    const [year, month, day] = date.split('-').map(Number);
    const todayMidnightUTC = Date.UTC(year, month - 1, day) - IST_OFFSET_MS;
    const nowMs = todayMidnightUTC + (hour * 60 + minute) * 60 * 1000 + second * 1000;

    // Calculate delay for a given 0-23 hour
    const delayForHour = (h, m) => {
        const targetMs = todayMidnightUTC + (h * 60 + m) * 60 * 1000;
        let diff = targetMs - nowMs;

        // If diff is slightly negative (e.g., -5s), it's just the 'current minute'
        // Don't jump to tomorrow unless it's more than 60 seconds past.
        if (diff < -60000) {
            diff += MS_PER_DAY; // target is definitely for tomorrow
        } else if (diff < 0) {
            diff = 0; // it's right now
        }
        return diff;
    };

    const primaryDelay = delayForHour(targetHour, targetMinute);

    // --- Smart nearest-occurrence: check alternate 12-hour shift ---
    // Only apply when hour is 1–12 (ambiguous) and primary is > 12 h away
    const isAmbiguous = targetHour >= 1 && targetHour <= 12;
    if (isAmbiguous && primaryDelay > MS_PER_12H) {
        const altHour = targetHour < 12
            ? targetHour + 12   // e.g. 12:xx → try 00:xx, handled below
            : targetHour - 12;  // e.g. 12:xx PM → 00:xx AM
        const altHourWrapped = altHour >= 24 ? altHour - 24 : altHour;

        const altDelay = delayForHour(altHourWrapped, targetMinute);

        if (altDelay < primaryDelay) {
            const pad = n => n.toString().padStart(2, '0');
            console.log(
                `[TimeService] Smart nearest-occurrence: ${pad(targetHour)}:${pad(targetMinute)} was ${Math.round(primaryDelay / 60000)}min away. ` +
                `Switched to ${pad(altHourWrapped)}:${pad(targetMinute)} → fires in ${Math.round(altDelay / 60000)} min.`
            );
            return { delayMs: altDelay, resolvedHour: altHourWrapped, resolvedMinute: targetMinute };
        }
    }

    return { delayMs: primaryDelay, resolvedHour: targetHour, resolvedMinute: targetMinute };
};
