
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
// Importing compatibility functions
import { calculateCompatibilityScore, generateProfileDescription } from '@/services/compatibility';

export const PsychologicalTraitsSchema = z.object({
  openness: z.number(),
  conscientiousness: z.number(),
  extraversion: z.number(),
  agreeableness: z.number(),
  neuroticism: z.number(),
});

export type PsychologicalTraits = z.infer<typeof PsychologicalTraitsSchema>;

export const BlindExchangeProfileInputSchema = z.object({
  psychologicalTraits: PsychologicalTraitsSchema,
  // Assuming interests are part of the user profile or provided separately
  // For now, adding mock interests to the input schema for flow logic demonstration
  userInterests: z.array(z.string()).describe('Interests of the user'),
  matchPsychologicalTraits: PsychologicalTraitsSchema,
  matchInterests: z.array(z.string()).describe('Interests of the potential match'),
});

export type BlindExchangeProfileInput = z.infer<typeof BlindExchangeProfileInputSchema>;


export const BlindExchangeProfileOutputSchema = z.object({
  compatibleProfile: z.string(),
});

export type BlindExchangeProfileOutput = z.infer<typeof BlindExchangeProfileOutputSchema>;

// This function seems redundant with the flow below, commenting out or clarifying its purpose needed
// export async function generateBlindExchangeProfile(input: BlindExchangeProfileInput) :Promise<BlindExchangeProfileOutput> {
//   const compatibleProfile:BlindExchangeProfileOutput ={
//       compatibleProfile: 'This is a blind exchange profile'
//   }

//   return compatibleProfile;
// }


export const blindExchangeProfilePrompt = ai.definePrompt({
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

Based on this information, create a short, neutral profile description for the users to see before they reveal their photos or personal information. The goal is to entice them to connect based on potential shared interests and complementary traits.

Compatibility Score: {{{compatibilityScore}}}%
Description: {{{profileDescription}}}`,
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
   const { psychologicalTraits, userInterests, matchPsychologicalTraits, matchInterests } = input;

    // Calculate a compatibility score based on traits and interests
    const compatibilityScore = calculateCompatibilityScore(
      psychologicalTraits,
      matchPsychologicalTraits,
      userInterests,
      matchInterests
    );

    // Generate a profile description highlighting common interests and complementary traits
    const profileDescription = generateProfileDescription(
      userInterests,
      matchInterests,
      psychologicalTraits,
      matchPsychologicalTraits
    );

    // Use the prompt to generate the final compatible profile string
    const { output } = await blindExchangeProfilePrompt({
        compatibilityScore: compatibilityScore,
        profileDescription: profileDescription,
    });

    return output!;
  }
);

// Export the flow for use in the application
export default blindExchangeProfileFlow;
