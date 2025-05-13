// "use server"; // This service might be used in server components/actions in the future, but for now, it's client-side simulation.

/**
 * @fileOverview Provides services for content moderation (simulated).
 * @module ModerationService
 * @description This module defines interfaces for moderation results and provides
 *              functions for simulating the moderation of text and image content.
 *              **Requires Backend/External API:** Real content moderation would use a dedicated service.
 */

/**
 * @interface ModerationIssue
 * @description Represents a specific issue found during moderation.
 */
export interface ModerationIssue {
  /** @property {string} category - The category of the moderation issue (e.g., 'hate_speech', 'profanity', 'adult_content'). */
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

const SIMULATED_BAD_WORDS: string[] = ["badword", "inappropriate", "offensive", "nasty", "explicit"];
const SIMULATED_SENSITIVE_WORDS: string[] = ["kill", "hate", "violence"]; // Words that might trigger a warning

/**
 * Simulates text content moderation.
 * In a real application, this would call an external moderation API.
 *
 * @async
 * @function moderateText
 * @param {string} text - The text content to moderate.
 * @returns {Promise<ModerationResult>} A promise that resolves to the moderation result.
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  console.log(`Simulating moderation for text: "${text.substring(0, 50)}..."`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  const issues: ModerationIssue[] = [];
  const lowerText = text.toLowerCase();

  SIMULATED_BAD_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      issues.push({
        category: 'profanity',
        confidence: 0.9, // High confidence for exact match
        details: `Contains the word: ${word}`,
      });
    }
  });

  SIMULATED_SENSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      issues.push({
        category: 'sensitive_content',
        confidence: 0.7,
        details: `Contains potentially sensitive word: ${word}`,
      });
    }
  });

  if (issues.length > 0) {
    return {
      isSafe: false,
      issues,
    };
  }

  return { isSafe: true };
}

/**
 * Simulates image content moderation.
 * In a real application, this would involve uploading the image or its URL to an image moderation API.
 *
 * @async
 * @function moderateImage
 * @param {string} imageUrl - The URL of the image to moderate (or a data URI).
 * @returns {Promise<ModerationResult>} A promise that resolves to the moderation result.
 */
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  console.log(`Simulating moderation for image: ${imageUrl.substring(0, 50)}...`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  // For simulation, assume all images pass unless a specific keyword is in the URL
  if (imageUrl.toLowerCase().includes('unsafe_mock_image_keyword')) {
    return {
      isSafe: false,
      issues: [{
        category: 'adult_content_simulated',
        confidence: 0.95,
        details: 'Image URL contains a keyword indicating potentially unsafe content (simulated).',
      }],
    };
  }

  return { isSafe: true };
}
