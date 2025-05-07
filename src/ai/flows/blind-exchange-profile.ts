
'use server';
/**
 * @fileOverview Generates a compatible profile for Blind Exchange Mode based on psychological traits, common interests, and opposite traits.
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
import { calculateCompatibilityScore, generateProfileDescription } from '@/services/compatibility'; // Assuming generateProfileDescription provides the detailed internal description

export const PsychologicalTraitsSchema = z.object({
  openness: z.number().min(0).max(1).describe("Openness to experience score (0-1)"),
  conscientiousness: z.number().min(0).max(1).describe("Conscientiousness score (0-1)"),
  extroversion: z.number().min(0).max(1).describe("Extroversion score (0-1)"), // Corrected from extraversion
  agreeableness: z.number().min(0).max(1).describe("Agreeableness score (0-1)"),
  neuroticism: z.number().min(0).max(1).describe("Neuroticism score (0-1)"),
});
export type PsychologicalTraits = z.infer<typeof PsychologicalTraitsSchema>;

export const BlindExchangeProfileInputSchema = z.object({
  currentUserPsychologicalTraits: PsychologicalTraitsSchema.describe("Psychological traits of the current user."),
  currentUserInterests: z.array(z.string()).describe('Interests of the current user.'),
  matchUserPsychologicalTraits: PsychologicalTraitsSchema.describe("Psychological traits of the potential match."),
  matchUserInterests: z.array(z.string()).describe('Interests of the potential match.'),
});
export type BlindExchangeProfileInput = z.infer<typeof BlindExchangeProfileInputSchema>;

// Output schema for the main flow
export const BlindExchangeProfileOutputSchema = z.object({
  compatibleProfileDescription: z.string().describe("A short, AI-generated neutral description of the potential connection, suitable for display in Blind Exchange Mode."),
  compatibilityPercentage: z.number().min(0).max(100).describe("A percentage indicating the compatibility between the two users (0-100)."),
});
export type BlindExchangeProfileOutput = z.infer<typeof BlindExchangeProfileOutputSchema>;

// Input schema for the AI prompt that generates the user-facing description
const AiGeneratedProfileDescriptionInputSchema = z.object({
    calculatedCompatibilityScore: z.number().min(0).max(100).describe('The pre-calculated compatibility score between the two users (0-100).'),
    detailedProfileInsights: z.string().describe('A detailed text summarizing commonalities, differences, and potential dynamics between the two users, based on their interests and psychological traits.'),
});

// Output schema for the AI prompt (the text part of the final output)
const AiGeneratedProfileDescriptionOutputSchema = z.object({
    generatedSummary: z.string().describe("The AI-crafted, short, neutral, and enticing profile summary for the users to see."),
});

// Prompt to generate the neutral profile description based on calculated score and detailed insights
const blindExchangeTextGenerationPrompt = ai.definePrompt({
  name: 'blindExchangeTextGenerationPrompt',
  input: { schema: AiGeneratedProfileDescriptionInputSchema },
  output: { schema: AiGeneratedProfileDescriptionOutputSchema },
  prompt: `You are an AI matchmaker for a blind dating app.
Your task is to generate an enticing but neutral summary for a user about a potential connection.
You are given a pre-calculated compatibility score and a detailed analysis of two users' traits and interests.
Use this information to craft a short (2-3 sentences) summary.

Guidelines for the summary:
- Be neutral: Avoid overly positive or negative language.
- Be intriguing: Spark curiosity without revealing specifics.
- Focus on potential connection: Hint at shared aspects or complementary differences.
- Do NOT reveal specific interests, names, or detailed psychological traits directly in the summary.
- The summary should be suitable to be shown to one of the users before any other information is revealed.

Compatibility Score: {{{calculatedCompatibilityScore}}}%
Detailed Insights: {{{detailedProfileInsights}}}

Generate the profile summary based on the above information.
Output only the generated summary string.`,
});

// The main flow
const blindExchangeProfileFlow = ai.defineFlow(
  {
    name: 'blindExchangeProfileFlow',
    inputSchema: BlindExchangeProfileInputSchema,
    outputSchema: BlindExchangeProfileOutputSchema,
  },
  async (input) => {
    const { currentUserPsychologicalTraits, currentUserInterests, matchUserPsychologicalTraits, matchUserInterests } = input;

    // 1. Calculate compatibility score using the service
    const compatibilityScore = calculateCompatibilityScore(
      currentUserPsychologicalTraits,
      matchUserPsychologicalTraits,
      currentUserInterests,
      matchUserInterests
    );

    // 2. Generate detailed internal description/insights using the service
    const detailedInsights = generateProfileDescription(
      currentUserInterests,
      matchUserInterests,
      currentUserPsychologicalTraits,
      matchUserPsychologicalTraits
    );

    // 3. Call the LLM prompt to generate the user-facing summary
    const { output: promptOutput } = await blindExchangeTextGenerationPrompt({
      calculatedCompatibilityScore: compatibilityScore,
      detailedProfileInsights: detailedInsights,
    });

    if (!promptOutput || !promptOutput.generatedSummary) {
      throw new Error("AI failed to generate the blind exchange profile summary.");
    }

    // 4. Construct the final output for the flow
    return {
      compatibleProfileDescription: promptOutput.generatedSummary,
      compatibilityPercentage: compatibilityScore,
    };
  }
);

/**
 * @function generateBlindExchangeProfile
 * @description Public function to trigger the blind exchange profile generation flow.
 * @param {BlindExchangeProfileInput} input - The input data for the blind exchange profile generation.
 * @returns {Promise<BlindExchangeProfileOutput>} A promise that resolves to the generated blind exchange profile output.
 */
export async function generateBlindExchangeProfile(input: BlindExchangeProfileInput): Promise<BlindExchangeProfileOutput> {
  return blindExchangeProfileFlow(input);
}

// Default export the flow if it's the primary export for this file's purpose
export default blindExchangeProfileFlow;
