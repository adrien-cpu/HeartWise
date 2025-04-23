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
 * @exports {ConversationCoachOutput} ConversationCoachOutput - The output type for the conversationCoach function.
 * @exports {function} getConversationAdvice - A function that provides advice on how to proceed in the conversation.
 * @exports {function} getConversationStarter - A function that suggests a good conversation starter.
 * @exports {function} getConversationSummary - A function that summarizes a conversation.
 * @exports {function} generateFeedback - A function that generates feedback based on a conversation.
 * @exports {ConversationAdviceInput} ConversationAdviceInput - The input type for the getConversationAdvice function.
 * @exports {ConversationAdviceOutput} ConversationAdviceOutput - The output type for the getConversationAdvice function.
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

/**
 * @typedef {object} ConversationAdviceInput
 * @property {string} conversationHistory - The history of the conversation.
 * @property {string} userProfile - The profile of the user.
 * @property {string} partnerProfile - The profile of the conversation partner.
 */
const ConversationAdviceInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation.'),
  userProfile: z.string().describe('The profile of the user.'),
  partnerProfile: z.string().describe('The profile of the conversation partner.'),
});
export type ConversationAdviceInput = z.infer<typeof ConversationAdviceInputSchema>;

/**
 * @typedef {object} ConversationAdviceOutput
 * @property {string} advice - Advice on how to proceed in the conversation.
 */
const ConversationAdviceOutputSchema = z.object({
  advice: z.string().describe('Advice on how to proceed in the conversation.'),
});
export type ConversationAdviceOutput = z.infer<typeof ConversationAdviceOutputSchema>;

/**
 * Provides advice on how to proceed in the conversation.
 *
 * @async
 * @function getConversationAdvice
 * @param {ConversationAdviceInput} input - The input data for analyzing the conversation.
 * @returns {Promise<ConversationAdviceOutput>} The advice on how to proceed.
 */
export async function getConversationAdvice(input: ConversationAdviceInput): Promise<ConversationAdviceOutput> {
  return conversationAdviceFlow(input);
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

const conversationAdvicePrompt = ai.definePrompt({
  name: 'conversationAdvicePrompt',
  input: {
    schema: z.object({
      conversationHistory: z.string().describe('The history of the conversation.'),
      userProfile: z.string().describe('The profile of the user.'),
      partnerProfile: z.string().describe('The profile of the conversation partner.'),
    }),
  },
  output: {
    schema: z.object({
      advice: z.string().describe('Advice on how to proceed in the conversation.'),
    }),
  },
  prompt: `You are an AI conversation coach that provides advice on how to proceed in a conversation.

  Analyze the following conversation history between a user and their partner:
  {{{conversationHistory}}}

  Consider the following information about the user:
  {{{userProfile}}}

  And the following information about the partner:
  {{{partnerProfile}}}

  Based on the conversation history and user/partner profiles, provide advice on how to proceed. 
  This could include suggestions to keep the conversation flowing, address potential issues, or suggest new topics.

  Advice:`,
});

const conversationAdviceFlow = ai.defineFlow<
  typeof ConversationAdviceInputSchema,
  typeof ConversationAdviceOutputSchema
>(
  {
    name: 'conversationAdviceFlow',
    inputSchema: ConversationAdviceInputSchema,
    outputSchema: ConversationAdviceOutputSchema,
  },
  async input => {
    const {output} = await conversationAdvicePrompt(input);
    return output!;
  }
);

/**
 * Suggests a conversation starter based on the user's profile.
 *
 * @async
 * @function getConversationStarter
 * @param {string} userProfile - The profile of the user.
 * @returns {Promise<string>} A conversation starter.
 */
export async function getConversationStarter(userProfile: string): Promise<string> {
  const {output} = await ai.generateText({
    prompt: `Generate a good conversation starter based on the following user profile: ${userProfile}`,
  });
  return output;
}

/**
 * Summarizes a conversation.
 *
 * @async
 * @function getConversationSummary
 * @param {string} conversationHistory - The history of the conversation.
 * @returns {Promise<string>} A summary of the conversation.
 */
export async function getConversationSummary(conversationHistory: string): Promise<string> {
  const {output} = await ai.generateText({
    prompt: `Summarize the following conversation: ${conversationHistory}`,
  });
  return output;
}

/**
 * Generates feedback based on a conversation.
 *
 * @async
 * @function generateFeedback
 * @param {string} conversationHistory - The history of the conversation.
 * @param {string} userProfile - The profile of the user.
 * @param {string} partnerProfile - The profile of the conversation partner.
 * @returns {Promise<string>} Feedback on the conversation.
 */
export async function generateFeedback(
  conversationHistory: string,
  userProfile: string,
  partnerProfile: string
): Promise<string> {
  const {output} = await ai.generateText({
    prompt: `Generate feedback based on the following conversation: ${conversationHistory}

    Consider the following information about the user:
    ${userProfile}

    And the following information about the partner:
    ${partnerProfile}`,
  });
  return output;
}















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

