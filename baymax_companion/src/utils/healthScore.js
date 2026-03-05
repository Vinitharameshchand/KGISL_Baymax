export const calculateHealthScore = (adherencePercentage, moodScore) => {
    // adherence: 0 to 100
    // moodScore: 0 to 100 (where 100 is very positive, 0 is very negative)
    const healthScore = (adherencePercentage * 0.7) + (moodScore * 0.3);
    return Math.round(healthScore);
};
