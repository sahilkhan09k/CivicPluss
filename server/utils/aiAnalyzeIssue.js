import Groq from "groq-sdk";
import { analyzeImageSeverity } from "./aiAnalyzeImage.js";

let groqClient = null;

const getGroqClient = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        console.log("🔑 Groq API key detected, initializing client...");
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    } else if (!process.env.GROQ_API_KEY) {
        console.log("❌ GROQ_API_KEY environment variable not found");
    }
    return groqClient;
};

/**
 * HYBRID ANALYSIS: Combines image analysis + text analysis
 * This is the main function to use for issue severity assessment
 */
export const aiAnalyzeIssueHybrid = async (text, imageUrl) => {
    console.log("🔬 Starting HYBRID analysis (Image + Text)...");

    try {
        // Run both analyses in parallel for speed
        const [imageAnalysis, textAnalysis] = await Promise.all([
            analyzeImageSeverity(imageUrl),
            aiAnalyzeIssue(text)
        ]);

        console.log("📊 Image Analysis Result:", imageAnalysis);
        console.log("📊 Text Analysis Result:", textAnalysis);

        // Combine severities with weighted average
        // Image: 60% weight (visual evidence is stronger)
        // Text: 40% weight (context matters)
        const imageSeverity = imageAnalysis.severity || 5;
        const textSeverity = textAnalysis.severity || 5;
        
        const combinedSeverity = Math.round(
            (imageSeverity * 0.6) + (textSeverity * 0.4)
        );

        // Combine urgency boosts
        const combinedUrgencyBoost = textAnalysis.urgencyBoost || 0;

        // Use text analysis for category (more reliable than image)
        const category = textAnalysis.category || "Other";

        const explanation = `Image severity: ${imageSeverity}/10 (${imageAnalysis.confidence ? Math.round(imageAnalysis.confidence * 100) : 50}% confidence), Text severity: ${textSeverity}/10. Combined: ${combinedSeverity}/10`;

        console.log(`✅ HYBRID Analysis Complete: Combined Severity=${combinedSeverity}/10`);

        return {
            severity: combinedSeverity,
            urgencyBoost: combinedUrgencyBoost,
            category,
            explanation,
            imageAnalysis: {
                severity: imageSeverity,
                confidence: imageAnalysis.confidence,
                detectedObjects: imageAnalysis.detectedObjects
            },
            textAnalysis: {
                severity: textSeverity,
                category: textAnalysis.category
            }
        };

    } catch (error) {
        console.error("❌ Hybrid analysis failed:", error.message);
        console.log("🔄 Falling back to text-only analysis...");
        return await aiAnalyzeIssue(text);
    }
};

export const aiAnalyzeIssue = async (text, userCategory = null) => {
    try {
        const groq = getGroqClient();

        if (!groq) {
            console.warn("⚠️ GROQ_API_KEY not configured - using fallback rule-based analysis");
            return fallbackAnalysis(text, userCategory);
        }

        console.log("🚀 Attempting Groq API call for issue analysis...");

        const prompt = `Analyze this civic issue report and provide a JSON response with the following fields:
- severity: number from 1-10 (1=minor, 10=critical) based on description urgency
- urgencyBoost: number from 0-15 (additional priority points)
- category: one of ["Road", "Water", "Electricity", "Waste", "Other"]
- explanation: brief reason for the severity rating
- isRelevant: boolean (true if this describes a civic infrastructure issue; false if it's random/irrelevant text)

Civic issues include: potholes, broken roads, water leaks, garbage, streetlights, drainage, public property damage, etc.
NOT civic issues: random text, jokes, personal messages, unrelated content, gibberish, etc.

Issue: "${text}"
${userCategory ? `User selected category: ${userCategory}` : ''}

Respond ONLY with valid JSON, no other text.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that analyzes civic infrastructure issues. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 200,
        });

        let responseText = completion.choices[0]?.message?.content || "{}";
        console.log("📥 Groq API raw response:", responseText);

        // Clean up response - remove markdown code blocks if present
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\n?/g, '');
        }
        responseText = responseText.trim();

        const result = JSON.parse(responseText);

        // Check if content is relevant to civic issues
        if (result.isRelevant === false) {
            console.log("❌ Description is not relevant to civic issues");
            return {
                isRelevant: false,
                error: "The description does not appear to be related to civic infrastructure issues. Please describe problems with roads, water supply, electricity, waste management, or other public infrastructure."
            };
        }

        const severity = Math.min(10, Math.max(1, result.severity || 5));
        const urgencyBoost = Math.min(15, Math.max(0, result.urgencyBoost || 0));

        console.log(`✅ Groq API SUCCESS: Severity=${severity}, Boost=${urgencyBoost}, Category=${result.category}`);

        return {
            isRelevant: true,
            textSeverity: severity,
            urgencyBoost,
            category: userCategory || result.category || "Other",
            explanation: result.explanation || "AI-based priority scoring",
            source: 'groq'
        };

    } catch (error) {
        console.error("❌ Groq API FAILED:", error.message);
        console.error("📋 Error details:", {
            name: error.name,
            status: error.status,
            type: error.type
        });
        console.log("🔄 Falling back to rule-based analysis...");
        return fallbackAnalysis(text, userCategory);
    }
};

const fallbackAnalysis = (text, userCategory = null) => {
    const lowerText = text.toLowerCase();

    let severity = 5;
    let urgencyBoost = 0;
    let category = userCategory || "Other";
    let explanation = "Standard priority";

    // Auto-detect category if not provided by user
    if (!userCategory) {
        if (lowerText.includes('garbage') || lowerText.includes('trash') || lowerText.includes('waste')) {
            category = "Waste";
        } else if (lowerText.includes('road') || lowerText.includes('pothole') || lowerText.includes('street')) {
            category = "Road";
        } else if (lowerText.includes('water') || lowerText.includes('pipe') || lowerText.includes('leak')) {
            category = "Water";
        } else if (lowerText.includes('light') || lowerText.includes('electricity') || lowerText.includes('power')) {
            category = "Electricity";
        }
    }

    const highSeverityKeywords = ['broken', 'damaged', 'dangerous', 'hazard', 'emergency', 'urgent', 'critical', 'severe'];
    const mediumSeverityKeywords = ['leaking', 'cracked', 'blocked', 'stuck', 'malfunctioning'];

    let highCount = 0;
    let mediumCount = 0;

    highSeverityKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) highCount++;
    });
    mediumSeverityKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) mediumCount++;
    });

    if (highCount > 0) {
        severity = 8 + Math.min(highCount, 2);
        explanation = "High severity issue";
    } else if (mediumCount > 0) {
        severity = 6 + Math.min(mediumCount, 2);
        explanation = "Moderate severity issue";
    }

    const highImpactLocations = ['hospital', 'school', 'station', 'main road', 'highway', 'market'];
    highImpactLocations.forEach(location => {
        if (lowerText.includes(location)) {
            urgencyBoost += 10;
        }
    });

    const safetyKeywords = ['unsafe', 'danger', 'risk', 'accident', 'injury'];
    safetyKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            urgencyBoost += 5;
            severity = Math.min(10, severity + 1);
        }
    });

    severity = Math.min(10, Math.max(1, severity));
    urgencyBoost = Math.min(15, Math.max(0, urgencyBoost));

    console.log(`✅ Fallback Analysis: Severity=${severity}, Boost=${urgencyBoost}, Category=${category}`);

    return {
        textSeverity: severity,
        urgencyBoost,
        category,
        explanation,
        source: 'fallback'
    };
};
