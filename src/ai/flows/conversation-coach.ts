'use server';
/**
 * @fileOverview An AI conversation coach that analyzes messages and suggests improvements.
 *
 * @module ConversationCoach
 *
 * @description This module defines the AI conversation coach functionality, including input/output schemas,
 * AI flow, and functions for analyzing messages and suggesting improvements.
 *
 * @exports {function} conversationCoach - A function that analyzes a message and suggests improvements.
 * @exports {ConversationCoachInput} ConversationCoachInput - The input type for the conversationCoach function.
 * @exports {ConversationCoachOutput} ConversationCoachOutput - The return type for the conversationCoach function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

/**
 * @typedef {object} ConversationCoachInput
 * @property {string} message - The message to analyze.
 * @property {string} [partnerCharacteristics] - Characteristics of the conversation partner.
 * @property {string} [userStyle] - The user style (e.g., romantic, direct, poetic).
 */
const ConversationCoachInputSchema = z.object({
  message: z.string().describe('The message to analyze.'),
  partnerCharacteristics: z.string().optional().describe('Characteristics of the conversation partner.'),
  userStyle: z.string().optional().describe('The user style (e.g., romantic, direct, poetic).'),
});
export type ConversationCoachInput = z.infer<typeof ConversationCoachInputSchema>;

/**
 * @typedef {object} ConversationCoachOutput
 * @property {string} suggestion - The suggested reformulation of the message, if any.
 * @property {string} explanation - The explanation for the suggestion, if any.
 */
const ConversationCoachOutputSchema = z.object({
  suggestion: z.string().describe('The suggested reformulation of the message, if any.'),
  explanation: z.string().describe('The explanation for the suggestion, if any.'),
});
export type ConversationCoachOutput = z.infer<typeof ConversationCoachOutputSchema>;

/**
 * Analyzes a message and suggests improvements using AI.
 *
 * @async
 * @function conversationCoach
 * @param {ConversationCoachInput} input - The input data for analyzing the message.
 * @returns {Promise<ConversationCoachOutput>} The analysis result with suggestion and explanation.
 */
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

/**
 * Provides conversation tips based on the last user message.
 *
 * @function getConversationTips
 * @param {string} lastMessage - The last message sent by the user.
 * @returns {string} - A string containing conversation tips.
 */
export async function getConversationTips(lastMessage: string): Promise<string> {
  if (!lastMessage) {
    // Generic advice when there's no message
    return "To keep the conversation flowing, try asking open-ended questions or sharing something interesting about your day.";
  }

  // Specific advice based on the message content (example)
  if (lastMessage.toLowerCase().includes("how are you")) {
    return "Since your partner asked about you, remember to ask them the same question and show genuine interest in their response.";
  }

  return "Consider asking a follow-up question or relating to something your partner has said to maintain engagement.";
}

