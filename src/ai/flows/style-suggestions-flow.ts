
'use server';
/**
 * @fileOverview Provides AI-driven communication style suggestions.
 *
 * @module StyleSuggestionsFlow
 *
 * @description This module defines a Genkit flow to analyze user context and
 * suggest communication styles (e.g., romantic, direct, poetic) for dating conversations.
 *
 * @exports {function} getStyleSuggestions - A function that generates style suggestions.
 * @exports {StyleSuggestionsInput} StyleSuggestionsInput - The input type for the getStyleSuggestions function.
 * @exports {StyleSuggestionsOutput} StyleSuggestionsOutput - The return type for the getStyleSuggestions function.
 * @exports {StyleSuggestion} StyleSuggestion - The type for a single style suggestion.
 * @exports {StyleSuggestionSchema} StyleSuggestionSchema - The Zod schema for a single style suggestion.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

/**
 * @typedef {object} StyleSuggestionsInput
 * @property {string} userProfile - A summary of the user's profile (e.g., bio, interests).
 * @property {string} partnerProfile - A summary of the potential partner's profile.
 * @property {string} [conversationContext] - Optional: Recent conversation history for context.
 * @property {string} [userComfortLevel] - Optional: User's stated comfort level (e.g., 'shy', 'outgoing', 'getting comfortable').
 */
const StyleSuggestionsInputSchema = z.object({
  userProfile: z.string().describe("A summary of the user's profile (e.g., bio, interests)."),
  partnerProfile: z.string().describe("A summary of the potential partner's profile."),
  conversationContext: z.string().optional().describe('Optional: Recent conversation history for context.'),
  userComfortLevel: z.string().optional().describe("Optional: User's stated comfort level (e.g., 'shy', 'outgoing', 'getting comfortable')."),
});

export type StyleSuggestionsInput = z.infer<typeof StyleSuggestionsInputSchema>;

/**
 * @typedef {object} StyleSuggestion
 * @property {string} styleName - The name of the suggested style (e.g., "Romantic", "Playful Humor", "Direct & Clear").
 * @property {string} description - A brief explanation of the style and why it might be suitable.
 * @property {string[]} examples - Example phrases demonstrating the style.
 */
export const StyleSuggestionSchema = z.object({
    styleName: z.string().describe('The name of the suggested style (e.g., "Romantic", "Playful Humor", "Direct & Clear").'),
    description: z.string().describe('A brief explanation of the style and why it might be suitable.'),
    examples: z.array(z.string()).describe('Example phrases demonstrating the style.'),
});
export type StyleSuggestion = z.infer<typeof StyleSuggestionSchema>; // Exporting the StyleSuggestion type

/**
 * @typedef {object} StyleSuggestionsOutput
 * @property {StyleSuggestion[]} suggestions - An array of personalized communication style suggestions.
 */
const StyleSuggestionsOutputSchema = z.object({
  suggestions: z.array(StyleSuggestionSchema).describe('An array of personalized communication style suggestions.'),
});

export type StyleSuggestionsOutput = z.infer<typeof StyleSuggestionsOutputSchema>;

/**
 * Generates personalized communication style suggestions based on user and partner profiles,
 * conversation context, and comfort level.
 *
 * @async
 * @function getStyleSuggestions
 * @param {StyleSuggestionsInput} input - The input data for generating suggestions.
 * @returns {Promise<StyleSuggestionsOutput>} The generated style suggestions.
 */
export async function getStyleSuggestions(input: StyleSuggestionsInput): Promise<StyleSuggestionsOutput> {
  return styleSuggestionsFlow(input);
}

const styleSuggestionsPrompt = ai.definePrompt({
  name: 'styleSuggestionsPrompt',
  input: {
    schema: StyleSuggestionsInputSchema,
  },
  output: {
    schema: StyleSuggestionsOutputSchema,
  },
  prompt: `You are an AI dating coach specializing in communication styles.
Your goal is to provide personalized communication style suggestions to a user based on their profile, their potential partner's profile, their comfort level, and the recent conversation context.

Analyze the provided information:
User Profile: {{{userProfile}}}
Partner Profile: {{{partnerProfile}}}
{{#if conversationContext}}
Conversation Context: {{{conversationContext}}}
{{/if}}
{{#if userComfortLevel}}
User Comfort Level: {{{userComfortLevel}}}
{{/if}}

Based on this analysis, suggest 2-3 distinct communication styles (e.g., Romantic, Playful Humor, Direct & Clear, Thoughtful & Deep, Casual & Friendly, Poetic) that the user could adopt.

For each suggested style:
1.  **styleName**: Provide a clear name for the style.
2.  **description**: Briefly explain the style and why it might be effective given the context (e.g., matching partner's interests, complementing user's comfort level, advancing the conversation).
3.  **examples**: Provide 2-3 concrete example phrases or sentences demonstrating this style in the context of the conversation or getting to know the partner.

Consider the user's comfort level – suggest bolder styles if they are outgoing, or gentler approaches if they are shy. Tailor suggestions based on potential shared interests or contrasting personalities identified from the profiles and conversation.

Return the suggestions as a JSON object matching the output schema. If the context is insufficient for specific suggestions, provide more general style advice.`,
});

const styleSuggestionsFlow = ai.defineFlow<
  typeof StyleSuggestionsInputSchema,
  typeof StyleSuggestionsOutputSchema
>(
  {
    name: 'styleSuggestionsFlow',
    inputSchema: StyleSuggestionsInputSchema,
    outputSchema: StyleSuggestionsOutputSchema,
  },
  async (input) => {
    // Basic check for minimal required input
    if (!input.userProfile || !input.partnerProfile) {
      console.warn("StyleSuggestionsFlow: Missing required profile information.");
      // Return empty suggestions or a default message
      return { suggestions: [{
          styleName: "General Advice",
          description: "Provide more profile information for personalized suggestions.",
          examples: ["Try asking about their day.", "Share one of your interests."]
      }] };
    }

    const { output } = await styleSuggestionsPrompt(input);

    // Ensure output is not null and suggestions is an array
    return output ?? { suggestions: [] };
  }
);

