exports.generateRecommendation = async (req, res) => {
    const { food, dietType, diseases } = req.body;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API Key is missing from .env file");
        }

        const prompt = `
        You are an expert AI Nutritionist integrated into a health tracking app called "NutriSenseAI".
        Analyze the following meal data for a user and provide a highly personalized, concise health recommendation or alert (strictly 1 to 2 sentences max).
        
        CRITICAL: The response MUST be in very simple, easy-to-understand English. Avoid complex medical or scientific jargon so a regular user can easily understand it.

        User Health Profile:
        - Current Diet Type: ${dietType || 'No specific diet'}
        - Chronic Diseases: ${diseases && diseases.length > 0 ? diseases.join(', ') : 'None'}

        Total Meal Nutritional Values:
        - Calories: ${food.calories} cal
        - Protein: ${food.protein}g
        - Carbohydrates: ${food.carbs}g
        - Fat: ${food.fat}g
        - Fiber: ${food.fiber}g
        - Sodium: ${food.sodium}mg
        - Cholesterol: ${food.cholesterol}mg

        Critical Guideline: Ensure the advice is dynamic and worded differently each time. Focus primarily on the nutrient that impacts them the most. Do not use the exact same intro formula for every response.
        `;

        // 🔗 استخدام gemini-pro المضمون لجميع الحسابات والمفاتيح الافتراضية
        // 🔗 التحديث للموديل الرسمي المستقر الحالي لعام 2026 لحل مشكلة الـ 404 نهائياً
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Direct Error:", data);
            throw new Error(data.error?.message || "Failed to fetch from Gemini Endpoint");
        }

        const responseText = data.candidates[0].content.parts[0].text;

        console.log("🧠 Gemini AI Direct Fetch Success! 🎉");
        res.json({ recommendation: responseText.trim() });

    } catch (error) {
        console.error("Gemini Native Fetch Error:", error.message);
        res.status(500).json({ error: "AI failed to generate recommendation." });
    }
};