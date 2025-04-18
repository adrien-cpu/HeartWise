'use server';
/**
 * @fileOverview An AI conversation coach that analyzes messages and suggests improvements.
 *
 * - conversationCoach - A function that analyzes a message and suggests improvements.
 * - ConversationCoachInput - The input type for the conversationCoach function.
 * - ConversationCoachOutput - The return type for the conversationCoach function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ConversationCoachInputSchema = z.object({
  message: z.string().describe('The message to analyze.'),
  partnerCharacteristics: z.string().optional().describe('Characteristics of the conversation partner.'),
  userStyle: z.string().optional().describe('The user style (e.g., romantic, direct, poetic).'),
});
export type ConversationCoachInput = z.infer<typeof ConversationCoachInputSchema>;

const ConversationCoachOutputSchema = z.object({
  suggestion: z.string().describe('The suggested reformulation of the message, if any.'),
  explanation: z.string().describe('The explanation for the suggestion, if any.'),
});
export type ConversationCoachOutput = z.infer<typeof ConversationCoachOutputSchema>;

export async function conversationCoach(input: ConversationCoachInput): Promise<ConversationCoachOutput> {
  return conversationCoachFlow(input);
}

const conversationCoachPrompt = ai.definePrompt({
  name: 'conversationCoachPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The message to analyze.'),
      partnerCharacteristics: z.string().optional().describe('Characteristics of the conversation partner.'),
      userStyle: z.string().optional().describe('The user style (e.g., romantic, direct, poetic).'),
    }),
  },
  output: {
    schema: z.object({
      suggestion: z.string().describe('The suggested reformulation of the message, if any.'),
      explanation: z.string().describe('The explanation for the suggestion, if any.'),
    }),
  },
  prompt: `You are an AI conversation coach that analyzes user messages and suggests improvements to enhance the conversation.
  You should only intervene when necessary to avoid being intrusive.

  Consider the following when analyzing the message:
  - Ambiguity
  - Tone (e.g., aggressive)
  - Potential for misunderstandings
  - Appropriateness for the partner, given their characteristics: {{{partnerCharacteristics}}}
  - Alignment with the user's style: {{{userStyle}}}

  If the message is fine, output an empty suggestion and an empty explanation.

  Message to analyze: {{{message}}}

  Suggestion:`,
});

const conversationCoachFlow = ai.defineFlow<
  typeof ConversationCoachInputSchema,
  typeof ConversationCoachOutputSchema
>(
  {
    name: 'conversationCoachFlow',
    inputSchema: ConversationCoachInputSchema,
    outputSchema: ConversationCoachOutputSchema,
  },
  async input => {
    const {output} = await conversationCoachPrompt(input);
    return output!;
  }
);
