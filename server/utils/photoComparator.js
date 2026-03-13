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
 * Extract similarity score from Groq API response
 * @param {Object} groqResponse - The response from Groq API
 * @returns {number} Similarity score between 0 and 100
 */
export const extractSimilarityScore = (groqResponse) => {
    try {
        let responseText = groqResponse.choices[0]?.message?.content || "{}";
        
        // Clean up markdown code blocks if present
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\n?/g, '');
        }
        responseText = responseText.trim();

        const analysis = JSON.parse(responseText);
        
        // Extract similarity score and ensure it's within valid range
        const similarityScore = analysis.similarityScore || analysis.similarity || 0;
        return Math.min(100, Math.max(0, Math.round(similarityScore)));
    } catch (error) {
        console.error("❌ Failed to extract similarity score:", error.message);
        // Return 0 on parsing error to trigger manual review
        return 0;
    }
};

/**
 * Compare two photos using Groq Vision API
 * @param {string} originalPhotoUrl - URL of the original issue photo
 * @param {string} challengePhotoUrl - URL of the challenge photo
 * @returns {Promise<Object>} Comparison result with similarity score
 */
export const comparePhotos = async (originalPhotoUrl, challengePhotoUrl) => {
    try {
        const groq = getGroqClient();

        if (!groq) {
            console.warn("⚠️ GROQ_API_KEY not configured - falling back to manual review");
            return {
                success: false,
                similarityScore: 0,
                confidence: 0,
                analysis: "API key not configured",
                requiresManualReview: true,
                error: "Groq API not configured"
            };
        }

        console.log("🖼️ Comparing photos with Groq Vision...");

        // Convert AVIF/WEBP to PNG for better compatibility
        const processImageUrl = (url) => {
            if (url.includes('.avif') || url.includes('.webp')) {
                return url.replace('/upload/', '/upload/f_png/');
            }
            return url;
        };

        const processedOriginalUrl = processImageUrl(originalPhotoUrl);
        const processedChallengeUrl = processImageUrl(challengePhotoUrl);

        const prompt = `Compare these two images and determine how similar they are. The first image is the original issue photo, and the second is a challenge photo taken to verify the issue still exists.

Analyze:
- Are they showing the same location/scene?
- Are they showing the same type of issue or problem?
- Do they have similar objects, structures, or landmarks?
- Are the lighting and angle similar enough to be the same place?

Provide a JSON response with:
- similarityScore: number from 0-100 (0=completely different, 100=identical or very similar scene)
- confidence: number from 0-1 (how confident you are in the assessment)
- analysis: brief explanation of why they are similar or different
- sameLocation: boolean (true if they appear to be the same location)
- sameIssue: boolean (true if they show the same type of issue)

Scoring guidelines:
- 80-100: Same location and issue, clear match
- 60-79: Same location, similar issue type
- 40-59: Similar location or issue type, but notable differences
- 20-39: Different location or issue, some common elements
- 0-19: Completely different scenes

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
                                url: processedOriginalUrl
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: processedChallengeUrl
                            }
                        }
                    ]
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.3,
            max_tokens: 400,
        });

        const similarityScore = extractSimilarityScore(completion);
        
        // Parse the full response for additional details
        let responseText = completion.choices[0]?.message?.content || "{}";
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\n?/g, '');
        }
        responseText = responseText.trim();

        const analysis = JSON.parse(responseText);
        const confidence = Math.min(1, Math.max(0, analysis.confidence || 0.7));

        console.log(`✅ Photo Comparison: Similarity=${similarityScore}%, Confidence=${Math.round(confidence * 100)}%`);

        return {
            success: true,
            similarityScore,
            confidence,
            analysis: analysis.analysis || "Photos compared successfully",
            sameLocation: analysis.sameLocation || false,
            sameIssue: analysis.sameIssue || false,
            requiresManualReview: false
        };

    } catch (error) {
        console.error("❌ Photo comparison failed:", error.message);
        
        // On error, return 0 similarity to trigger manual review
        return {
            success: false,
            similarityScore: 0,
            confidence: 0,
            analysis: `Comparison failed: ${error.message}`,
            requiresManualReview: true,
            error: error.message
        };
    }
};
