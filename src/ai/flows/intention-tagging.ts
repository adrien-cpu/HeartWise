'use server';
/**
 * @fileOverview Analyzes a message to determine its primary intention tag using Genkit.
 *
 * @exports tagMessageIntent - A function to get the intention tag for a message.
 * @exports IntentionTaggingInput - The input type for the intention tagging flow.
 * @exports IntentionTaggingOutput - The output type for the intention tagging flow.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

// Define the available intention tags
const intentionTags = [
    "tender", // tendre: expressing affection, warmth, or romantic interest softly.
    "humor", // humour: aiming to be funny, witty, or lighthearted.
    "seduction", // séduction: expressing strong romantic or sexual interest, often with a suggestive tone.
    "friendly", // amical: expressing platonic goodwill, casual interest, or general pleasantness.
    "neutral", // neutre: no clear specific intention from the defined list.
    "question", // question: the primary purpose is to ask for information.
    "information", // information: the primary purpose is to provide information.
    "other" // autre: intention is clear but doesn't fit any defined tag.
] as const; // Use 'as const' for z.enum

// Define the input schema using Zod
export const IntentionTaggingInputSchema = z.object({
    message: z.string().describe("The user's message to analyze."),
    conversationContext: z.string().optional().describe("Optional: Recent conversation history to provide context for better analysis."),
    messageLanguage: z.string().optional().describe("Optional: The language of the user's message (e.g., 'en', 'fr'). Defaults to 'auto-detect' if not provided."),
});
export type IntentionTaggingInput = z.infer<typeof IntentionTaggingInputSchema>;

// Define the output schema using Zod
export const IntentionTaggingOutputSchema = z.object({
    detectedIntention: z.enum(intentionTags).describe("The most likely intention tag for the message based on the predefined list."),
    confidenceScore: z.number().min(0).max(1).describe("A score between 0 and 1 indicating the confidence level of the detected intention."),
    explanation: z.string().optional().describe("Optional: A brief explanation for the detected intention."),
});
export type IntentionTaggingOutput = z.infer<typeof IntentionTaggingOutputSchema>;


const intentionTaggingPrompt = ai.definePrompt({
  name: 'intentionTaggingPrompt',
  input: { schema: IntentionTaggingInputSchema },
  output: { schema: IntentionTaggingOutputSchema },
  prompt: `You are an AI assistant specializing in analyzing dating app conversations. Your task is to identify the primary intention behind a user's message.
Analyze the following message, taking into account the conversation context if provided.
The user's message is in language: {{{messageLanguage}}} (if 'auto-detect', infer from message).
Conversation Context: {{{conversationContext}}}

Message to analyze:
{{{message}}}

Choose one tag from the following list that best describes the main intention: ${intentionTags.join(', ')}.
Provide a confidence score for your detection (0 to 1). Also, provide a brief explanation for the detected intention.
Return your response in the specified JSON format.
`,
});

const intentionTaggingFlow = ai.defineFlow(
  {
    name: 'intentionTaggingFlow',
    inputSchema: IntentionTaggingInputSchema,
    outputSchema: IntentionTaggingOutputSchema,
  },
  async (input) => {
    const { output } = await intentionTaggingPrompt({
        ...input,
        messageLanguage: input.messageLanguage || 'auto-detect',
        conversationContext: input.conversationContext || "N/A",
    });
    if (!output) {
        throw new Error("The AI model did not return a valid output for intention tagging.");
    }
    return output;
  }
);

/**
 * @function tagMessageIntent
 * @description Analyzes a message within its conversation context to determine its primary intention tag and confidence score using Genkit.
 * @param {IntentionTaggingInput} input - The input containing the message, optional conversation context, and optional message language.
 * @returns {Promise<IntentionTaggingOutput>} A promise that resolves with the detected intention tag, confidence score, and optional explanation.
 * @throws {Error} If the AI model fails to generate a valid response or if input validation fails.
 */
export async function tagMessageIntent(input: IntentionTaggingInput): Promise<IntentionTaggingOutput> {
    try {
        // Validate input with Zod schema. This happens automatically by Genkit flow as well.
        const validatedInput = IntentionTaggingInputSchema.parse(input);
        return await intentionTaggingFlow(validatedInput);
    } catch (error) {
        console.error("Error in tagMessageIntent:", error);
        // Re-throw the error or return a specific error structure
        // Ensure the error is an instance of Error for better logging/handling downstream.
        if (error instanceof z.ZodError) {
            throw new Error(`Input validation failed for intention tagging: ${error.errors.map(e => e.message).join(', ')}`);
        }
        throw new Error(`Failed to get intention tag: ${error instanceof Error ? error.message : String(error)}`);
    }
}
