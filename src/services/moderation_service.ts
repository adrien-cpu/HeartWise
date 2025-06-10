/**
 * @fileOverview Provides services for content moderation.
 * @module ModerationService
 * @description This module defines interfaces for moderation results and provides
 *              functions for moderating text and image content.
 *              In a production environment, this would connect to a real moderation API.
 */

/**
 * @interface ModerationIssue
 * @description Represents a specific issue found during moderation.
 */
export interface ModerationIssue {
  /** @property {string} category - The category of the moderation issue (e.g., 'HATE_SPEECH', 'SEXUALLY_EXPLICIT', 'VIOLENCE', 'SPAM'). */
  category: string;
  /** @property {number} confidence - The confidence score (0-1) that the content belongs to this category. */
  confidence: number;
  /** @property {string} [details] - Optional additional details about the issue. */
  details?: string;
}

/**
 * @interface ModerationResult
 * @description Represents the outcome of a content moderation check.
 */
export interface ModerationResult {
  /** @property {boolean} isSafe - True if the content is deemed safe, false otherwise. */
  isSafe: boolean;
  /** @property {ModerationIssue[]} [issues] - An array of identified issues if the content is not safe. */
  issues?: ModerationIssue[];
}

// Simulated lists of problematic content
const SIMULATED_BAD_WORDS: string[] = [
  "badword", "inappropriate", "offensive", "nasty", "explicit", "superbad",
  "fuck", "shit", "ass", "bitch", "dick", "pussy", "cunt", "cock", "whore"
];

const SIMULATED_SENSITIVE_WORDS: string[] = [
  "kill", "hate", "violence", "threat", "suicide", "die", "attack", "bomb",
  "gun", "weapon", "murder", "terrorist", "rape", "assault"
];

const SIMULATED_IMAGE_KEYWORDS_BLOCK: string[] = [
  "unsafe_mock_image", "adult_content_keyword", "nude", "porn", "explicit_content"
];

/**
 * Moderates text content.
 * In a production environment, this would call an external moderation API.
 *
 * @async
 * @function moderateText
 * @param {string} text - The text content to moderate.
 * @returns {Promise<ModerationResult>} A promise that resolves to the moderation result.
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  console.log(`ModerationService: Moderating text: "${text.substring(0, 50)}..."`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  // In a real implementation, you would call a moderation API:
  /*
  try {
    const response = await fetch('YOUR_MODERATION_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`Moderation API failed with status ${response.status}`);
    }
    
    const result = await response.json();
    return {
      isSafe: result.isSafe,
      issues: result.issues
    };
  } catch (error) {
    console.error("Moderation API call failed:", error);
    return { 
      isSafe: false, 
      issues: [{ 
        category: 'API_ERROR', 
        confidence: 1.0, 
        details: 'Moderation service unavailable' 
      }] 
    };
  }
  */

  const issues: ModerationIssue[] = [];
  const lowerText = text.toLowerCase();

  // Check for bad words
  for (const word of SIMULATED_BAD_WORDS) {
    if (lowerText.includes(word)) {
      issues.push({
        category: 'profanity',
        confidence: 0.9,
        details: `Contains the word: ${word}`,
      });
      break; // Only report one profanity issue
    }
  }

  // Check for sensitive content
  for (const word of SIMULATED_SENSITIVE_WORDS) {
    if (lowerText.includes(word)) {
      issues.push({
        category: 'sensitive_content',
        confidence: 0.7,
        details: `Contains potentially sensitive word: ${word}`,
      });
      break; // Only report one sensitive content issue
    }
  }

  // Check for spam patterns
  if (lowerText.includes("buy now") || 
      lowerText.includes("click here") || 
      lowerText.includes("free money") ||
      lowerText.includes("viagra")) {
    issues.push({ 
      category: 'spam', 
      confidence: 0.85, 
      details: 'Potential spam content detected.' 
    });
  }

  // Check for adult content
  if (lowerText.includes("sex") || 
      lowerText.includes("porn") || 
      lowerText.includes("nude")) {
    issues.push({ 
      category: 'adult_content_simulated', 
      confidence: 0.95, 
      details: 'Potential adult content detected.' 
    });
  }

  return {
    isSafe: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined,
  };
}

/**
 * Moderates image content.
 * In a production environment, this would involve uploading the image to a moderation API.
 *
 * @async
 * @function moderateImage
 * @param {string} imageUrlOrDataUri - The URL or data URI of the image to moderate.
 * @returns {Promise<ModerationResult>} A promise that resolves to the moderation result.
 */
export async function moderateImage(imageUrlOrDataUri: string): Promise<ModerationResult> {
  console.log(`ModerationService: Moderating image: ${imageUrlOrDataUri.substring(0, 70)}...`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  // In a real implementation, you would call an image moderation API:
  /*
  try {
    const formData = new FormData();
    
    if (imageUrlOrDataUri.startsWith('data:')) {
      const blob = await (await fetch(imageUrlOrDataUri)).blob();
      formData.append('image', blob, 'image.jpg');
    } else {
      formData.append('imageUrl', imageUrlOrDataUri);
    }
    
    const response = await fetch('YOUR_IMAGE_MODERATION_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Image moderation API failed: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      isSafe: result.isSafe,
      issues: result.issues
    };
  } catch (error) {
    console.error("Image moderation API call failed:", error);
    return { 
      isSafe: false, 
      issues: [{ 
        category: 'API_ERROR', 
        confidence: 1.0, 
        details: 'Image moderation service unavailable' 
      }] 
    };
  }
  */

  const lowerImageIdentifier = imageUrlOrDataUri.toLowerCase();
  
  // Check for blocked keywords in the image URL or data URI
  for (const keyword of SIMULATED_IMAGE_KEYWORDS_BLOCK) {
    if (lowerImageIdentifier.includes(keyword)) {
      return {
        isSafe: false,
        issues: [{
          category: 'adult_content_simulated',
          confidence: 0.95,
          details: `Image identifier contains a keyword indicating potentially unsafe content: ${keyword}.`,
        }],
      };
    }
  }
  
  // Check for violence keywords
  if (lowerImageIdentifier.includes('violence') || 
      lowerImageIdentifier.includes('weapon') || 
      lowerImageIdentifier.includes('blood')) {
    return {
      isSafe: false,
      issues: [{
        category: 'VIOLENCE_SIMULATED',
        confidence: 0.90,
        details: 'Image identifier suggests violent content.',
      }],
    };
  }

  // For demonstration purposes, randomly flag some images (1% chance)
  if (Math.random() < 0.01) {
    return {
      isSafe: false,
      issues: [{
        category: 'random_flag_simulated',
        confidence: 0.85,
        details: 'Random flag for demonstration purposes.',
      }],
    };
  }

  return { isSafe: true };
}