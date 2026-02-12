import Groq from "groq-sdk";

let groqClient = null;

const getGroqClient = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    return groqClient;
};

/**
 * Analyze civic issue image using Groq Vision
 */
export const analyzeImageSeverityGroq = async (imageUrl) => {
    try {
        const groq = getGroqClient();

        if (!groq) {
            console.warn("⚠️ GROQ_API_KEY not configured");
            return fallbackImageAnalysis();
        }

        console.log("🖼️ Analyzing image with Groq Vision...");

        // Convert AVIF/WEBP to PNG for better compatibility
        let processedImageUrl = imageUrl;
        if (imageUrl.includes('.avif') || imageUrl.includes('.webp')) {
            // Cloudinary transformation to convert to PNG
            processedImageUrl = imageUrl.replace('/upload/', '/upload/f_png/');
            console.log("🔄 Converting image format to PNG for compatibility");
        }

        const prompt = `Analyze this civic infrastructure issue image and provide a JSON response with:
- severity: number from 1-10 (1=minor cosmetic issue, 10=critical safety hazard)
- confidence: number from 0-1 (how confident you are in the assessment)
- detectedObjects: array of 1-3 main objects/issues visible
- description: brief description of what you see
- isRelevant: boolean (true if this is a civic infrastructure issue like roads, water, electricity, waste, public facilities; false if it's random/unrelated content)

Civic issues include: potholes, broken roads, water leaks, garbage, streetlights, drainage, public property damage, etc.
NOT civic issues: personal photos, memes, random objects, food, animals, selfies, etc.

Respond ONLY with valid JSON, no other text.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: processedImageUrl
                            }
                        }
                    ]
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.3,
            max_tokens: 300,
        });

        let responseText = completion.choices[0]?.message?.content || "{}";
        
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\n?/g, '');
        }
        responseText = responseText.trim();

        const analysis = JSON.parse(responseText);

        // Check if content is relevant to civic issues
        if (analysis.isRelevant === false) {
            console.log("❌ Image is not relevant to civic issues");
            return {
                isRelevant: false,
                error: "The uploaded image does not appear to be related to civic infrastructure issues. Please upload an image of roads, water supply, electricity, waste management, or other public infrastructure problems."
            };
        }

        const severity = Math.min(10, Math.max(1, analysis.severity || 5));
        const confidence = Math.min(1, Math.max(0, analysis.confidence || 0.7));
        const detectedObjects = analysis.detectedObjects || ['infrastructure issue'];

        console.log(`✅ Groq Vision Analysis: Severity=${severity}/10, Confidence=${Math.round(confidence * 100)}%`);

        return {
            isRelevant: true,
            severity,
            confidence,
            detectedObjects,
            description: analysis.description,
            source: 'groq-vision'
        };

    } catch (error) {
        console.error("❌ Groq Vision analysis failed:", error.message);
        return fallbackImageAnalysis();
    }
};

const fallbackImageAnalysis = () => {
    console.log("⚠️ Using fallback image analysis");
    
    return {
        isRelevant: true,
        severity: 5,
        confidence: 0.5,
        detectedObjects: ['unknown'],
        fallback: true
    };
};
