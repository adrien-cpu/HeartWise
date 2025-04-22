
'use server';
/**
 * @fileOverview Generates a compatible profile for Blind Exchange Mode based on facial and emotional matching, common interests, and opposite traits.
 *
 * @module BlindExchangeProfile
 *
 * @description This module defines the Blind Exchange Mode functionality, including input/output schemas,
 * AI flow, and supporting functions for calculating compatibility and generating profile descriptions.
 *
 * @exports {function} generateBlindExchangeProfile - A function that generates the blind exchange profile.
 * @exports {BlindExchangeProfileInput} BlindExchangeProfileInput - The input type for the generateBlindExchangeProfile function.
 * @exports {BlindExchangeProfileOutput} BlindExchangeProfileOutput - The return type for the generateBlindExchangeProfile function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getPsychologicalTraits, PsychologicalTraits} from '@/services/face-analysis'; // Removed unused FaceData

/**
 * @typedef {object} BlindExchangeProfileInput
 * @property {object} faceData1 - Face data of the first user.
 * @property {string} faceData1.imageUrl - URL of the first user's face image.
 * @property {object} faceData2 - Face data of the second user.
 * @property {string} faceData2.imageUrl - URL of the second user's face image.
 * @property {string[]} interests1 - List of interests of the first user.
 * @property {string[]} interests2 - List of interests of the second user.
 */
const BlindExchangeProfileInputSchema = z.object({
  faceData1: z.object({
    imageUrl: z.string().describe('URL of the first user\'s face image.'),
  }).describe('Face data of the first user.'),
  faceData2: z.object({
    imageUrl: z.string().describe('URL of the second user\'s face image.'),
  }).describe('Face data of the second user.'),
  interests1: z.array(z.string()).describe('List of interests of the first user.'),
  interests2: z.array(z.string()).describe('List of interests of the second user.'),
});

export type BlindExchangeProfileInput = z.infer<typeof BlindExchangeProfileInputSchema>;

/**
 * @typedef {object} BlindExchangeProfileOutput
 * @property {number} compatibilityScore - A percentage indicating the compatibility between the two users.
 * @property {string} profileDescription - A short, neutral description of the potential connection between the two users, highlighting commonalities and differences.
 */
const BlindExchangeProfileOutputSchema = z.object({
  compatibilityScore: z.number().describe('A percentage indicating the compatibility between the two users.'),
  profileDescription: z.string().describe('A short, neutral description of the potential connection between the two users, highlighting commonalities and differences.'),
});

export type BlindExchangeProfileOutput = z.infer<typeof BlindExchangeProfileOutputSchema>;

/**
 * Generates a blind exchange profile based on input data.
 *
 * @async
 * @function generateBlindExchangeProfile
 * @param {BlindExchangeProfileInput} input - The input data for generating the profile.
 * @returns {Promise<BlindExchangeProfileOutput>} The generated blind exchange profile.
 */
export async function generateBlindExchangeProfile(input: BlindExchangeProfileInput): Promise<BlindExchangeProfileOutput> {
  return blindExchangeProfileFlow(input);
}

const blindExchangeProfilePrompt = ai.definePrompt({
  name: 'blindExchangeProfilePrompt',
  input: {
    schema: z.object({
      compatibilityScore: z.number().describe('A percentage indicating the compatibility between the two users.'),
      profileDescription: z.string().describe('A short, neutral description of the potential connection between the two users, highlighting commonalities and differences.'),
    })
  },
  output: {
    schema: BlindExchangeProfileOutputSchema,
  },
  prompt: `You are an AI matchmaker for a blind dating app.

You are given a compatibility score between two users, and a description of their commonalities and differences.

Based on this information, create a short, neutral profile description for the users to see before they reveal their photos or personal information.  The goal is to entice them to connect based on potential shared interests and complementary traits.

Compatibility Score: {{{compatibilityScore}}}%
Description: {{{profileDescription}}}`, // Corrected escape sequence for backtick
});

const blindExchangeProfileFlow = ai.defineFlow<
  typeof BlindExchangeProfileInputSchema,
  typeof BlindExchangeProfileOutputSchema
>(
  {
    name: 'blindExchangeProfileFlow',
    inputSchema: BlindExchangeProfileInputSchema,
    outputSchema: BlindExchangeProfileOutputSchema,
  },
  async input => {
    // Assuming getPsychologicalTraits returns an object with known structure,
    // replace 'unknown' with a specific type if available.
    const traits1: PsychologicalTraits = await getPsychologicalTraits(input.faceData1);
    const traits2: PsychologicalTraits = await getPsychologicalTraits(input.faceData2);

    // Calculate a compatibility score based on traits and interests
    const compatibilityScore = calculateCompatibilityScore(traits1, traits2, input.interests1, input.interests2);

    // Generate a profile description highlighting common interests and complementary traits
    const profileDescription = generateProfileDescription(input.interests1, input.interests2, traits1, traits2);

    const {output} = await blindExchangeProfilePrompt({
      compatibilityScore,
      profileDescription,
    });
    return output!;
  }
);

/**
 * Calculates a compatibility score based on interests and psychological traits.
 * @param traits1 Psychological traits of the first user.
 * @param traits2 Psychological traits of the second user.
 * @param interests1 Interests of the first user.
 * @param interests2 Interests of the second user.
 * @returns A number representing the compatibility score.
 */
function calculateCompatibilityScore(
  traits1: PsychologicalTraits, // Changed from any
  traits2: PsychologicalTraits, // Changed from any
  interests1: string[],
  interests2: string[]
): number {
  let score = 0;

  // Award points for shared interests
  const sharedInterests = interests1.filter(interest => interests2.includes(interest)).length;
  score += sharedInterests * 5;


  // Award points for complementary traits (e.g., one high extroversion, one low)
  const extroversionDiff = Math.abs(traits1.extroversion - traits2.extroversion);
  if (extroversionDiff > 0.5) {
    score += 10;
  }


  // Award points for similar traits (e.g., both high agreeableness)
  if (Math.abs(traits1.agreeableness - traits2.agreeableness) < 0.3) {
    score += 10;
  }

  // Normalize the score to a percentage
  score = Math.max(0, Math.min(100, score));
  return score;
}

/**
 * Generates a profile description based on similar and opposing traits and shared interests.
 * @param interests1 Interests of the first user.
 * @param interests2 Interests of the second user.
 * @param traits1 Psychological traits of the first user.
 * @param traits2 Psychological traits of the second user.
 * @returns A string representing the generated profile description.
 */
function generateProfileDescription(
  interests1: string[],
  interests2: string[],
  traits1: PsychologicalTraits, // Changed from any
  traits2: PsychologicalTraits  // Changed from any
): string {
  let description = '';

  // Highlight shared interests
  const sharedInterests = interests1.filter(interest => interests2.includes(interest));
  if (sharedInterests.length > 0) {
    description += `Both users share an interest in ${sharedInterests.join(', ')}. `;
  }

  // Highlight complementary traits
  const extroversionDiff = Math.abs(traits1.extroversion - traits2.extroversion);
  if (extroversionDiff > 0.5) {
    description += 'One user is more outgoing, while the other is more reserved, which could lead to a balanced dynamic. ';
  }

  // Highlight similar traits
  if (Math.abs(traits1.agreeableness - traits2.agreeableness) < 0.3) {
    description += 'Both users value agreeableness and getting along with others. ';
  }


  if (description === '') {
    description = 'These users have the potential for an interesting connection.';
  }

  return description;
}
