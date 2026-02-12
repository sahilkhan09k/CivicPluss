/**
 * Spam detection utility for title and description
 */

// Common spam patterns
const spamPatterns = [
    /(.)\1{4,}/i, // Repeated characters (aaaaa, 11111)
    /^[^a-zA-Z0-9\s]+$/, // Only special characters
    /\b(buy|sell|cheap|free|click|visit|website|link|promo|discount|offer)\b/i, // Spam keywords
    /\b(viagra|casino|lottery|prize|winner|congratulations)\b/i, // Common spam words
    /https?:\/\//i, // URLs
    /\b\d{10,}\b/, // Long number sequences (phone numbers, etc)
];

// Minimum meaningful content requirements
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 200;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Check if text contains spam patterns
 */
const containsSpam = (text) => {
    if (!text || typeof text !== 'string') return true;
    
    const trimmedText = text.trim();
    
    // Check length
    if (trimmedText.length < 3) return true;
    
    // Check for spam patterns
    for (const pattern of spamPatterns) {
        if (pattern.test(trimmedText)) {
            return true;
        }
    }
    
    return false;
};

/**
 * Validate title for spam
 */
export const validateTitle = (title) => {
    if (!title || typeof title !== 'string') {
        return {
            isValid: false,
            error: 'Title is required'
        };
    }
    
    const trimmedTitle = title.trim();
    
    // Check length
    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
        return {
            isValid: false,
            error: `Title must be at least ${MIN_TITLE_LENGTH} characters long`
        };
    }
    
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        return {
            isValid: false,
            error: `Title must not exceed ${MAX_TITLE_LENGTH} characters`
        };
    }
    
    // Check for spam
    if (containsSpam(trimmedTitle)) {
        return {
            isValid: false,
            error: 'Title contains inappropriate or spam content. Please provide a genuine issue title.'
        };
    }
    
    // Check if title has meaningful words
    const words = trimmedTitle.split(/\s+/).filter(word => word.length > 2);
    if (words.length < 2) {
        return {
            isValid: false,
            error: 'Title must contain at least 2 meaningful words'
        };
    }
    
    return {
        isValid: true
    };
};

/**
 * Validate description for spam
 */
export const validateDescription = (description) => {
    if (!description || typeof description !== 'string') {
        return {
            isValid: false,
            error: 'Description is required'
        };
    }
    
    const trimmedDescription = description.trim();
    
    // Check length
    if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
        return {
            isValid: false,
            error: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long`
        };
    }
    
    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
        return {
            isValid: false,
            error: `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`
        };
    }
    
    // Check for spam
    if (containsSpam(trimmedDescription)) {
        return {
            isValid: false,
            error: 'Description contains inappropriate or spam content. Please provide a genuine issue description.'
        };
    }
    
    // Check if description has meaningful content
    const words = trimmedDescription.split(/\s+/).filter(word => word.length > 2);
    if (words.length < 3) {
        return {
            isValid: false,
            error: 'Description must contain at least 3 meaningful words'
        };
    }
    
    return {
        isValid: true
    };
};

/**
 * Validate both title and description
 */
export const validateIssueContent = (title, description) => {
    const titleValidation = validateTitle(title);
    if (!titleValidation.isValid) {
        return titleValidation;
    }
    
    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.isValid) {
        return descriptionValidation;
    }
    
    return {
        isValid: true
    };
};
