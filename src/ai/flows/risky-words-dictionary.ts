'use server';
/**
 * @fileOverview Provides an AI service to identify potentially risky or ambiguous words/phrases in text and offer interpretations and clarifications.
 *
 * @module RiskyWordsDictionary
 *
 * @description This module defines the AI flow for analyzing text against a dynamic dictionary of potentially sensitive terms.
 * It identifies risky phrases, provides possible interpretations, and suggests clarifications. Each analysis item includes a unique ID.
 *
 * @exports {function} analyzeTextForRiskyWords - A function that analyzes text for risky words.
 * @exports {RiskyWordsInput} RiskyWordsInput - The input type for the analyzeTextForRiskyWords function.
 * @exports {RiskyWordsOutput} RiskyWordsOutput - The return type for the analyzeTextForRiskyWords function.
 * @exports {RiskyWordAnalysis} RiskyWordAnalysis - The type for a single risky word analysis, including its ID.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

/**
 * @typedef {object} RiskyWordAnalysis
 * @property {string} id - A unique identifier for this specific analysis item.
 * @property {string} word - The identified risky word or phrase.
 * @property {string[]} possibleInterpretations - Potential interpretations of the word/phrase in the given context.
 * @property {string} clarificationSuggestion - A suggestion on how to clarify the intended meaning.
 */
const RiskyWordAnalysisSchema = z.object({
  id: z.string().describe('A unique identifier for this specific analysis item.'),
  word: z.string().describe('The identified risky word or phrase.'),
  possibleInterpretations: z.array(z.string()).describe('Potential interpretations of the word/phrase in the given context.'),
  clarificationSuggestion: z.string().describe('A suggestion on how to clarify the intended meaning.'),
});
export type RiskyWordAnalysis = z.infer<typeof RiskyWordAnalysisSchema>;


/**
 * @typedef {object} RiskyWordsInput
 * @property {string} textToAnalyze - The text content to be analyzed for risky words.
 */
const RiskyWordsInputSchema = z.object({
  textToAnalyze: z.string().describe('The text content to be analyzed for risky words.'),
});
export type RiskyWordsInput = z.infer<typeof RiskyWordsInputSchema>;

/**
 * @typedef {object} RiskyWordsOutput
 * @property {RiskyWordAnalysis[]} analysis - An array of analyses for each identified risky word/phrase, each including an ID.
 */
const RiskyWordsOutputSchema = z.object({
  analysis: z.array(RiskyWordAnalysisSchema).describe('An array of analyses for each identified risky word/phrase, each including an ID.'),
});
export type RiskyWordsOutput = z.infer<typeof RiskyWordsOutputSchema>;

/**
 * Analyzes the input text for potentially risky or ambiguous words and provides interpretations and clarifications.
 *
 * @async
 * @function analyzeTextForRiskyWords
 * @param {RiskyWordsInput} input - The input containing the text to analyze.
 * @returns {Promise<RiskyWordsOutput>} A promise that resolves to the analysis result, with IDs added to each analysis item.
 */
export async function analyzeTextForRiskyWords(input: RiskyWordsInput): Promise<RiskyWordsOutput> {
  return riskyWordsFlow(input);
}

// Define the schema for the LLM prompt's output, which does not include the 'id'
const LlmRiskyWordAnalysisSchema = RiskyWordAnalysisSchema.omit({ id: true });
const LlmRiskyWordsOutputSchema = z.object({
  analysis: z.array(LlmRiskyWordAnalysisSchema).describe('An array of analyses for each identified risky word/phrase from the LLM.'),
});


const riskyWordsPrompt = ai.definePrompt({
  name: 'riskyWordsPrompt',
  input: {
    schema: RiskyWordsInputSchema,
  },
  output: {
    schema: LlmRiskyWordsOutputSchema, // LLM output schema does not include 'id'
  },
  prompt: `You are an AI assistant specialized in communication within a dating app context.
Your task is to analyze the provided text for words or phrases that could be considered risky, ambiguous, or easily misinterpreted in a dating conversation.
Focus on phrases that might imply unintended intimacy, pressure, or could lead to misunderstandings. Examples include "making a move", "come over", "want to see you", "you're hot", "cuddle", etc.

For each identified risky word/phrase, provide:
1.  **word**: The specific word or phrase identified.
2.  **possibleInterpretations**: A list of potential ways this word/phrase could be interpreted (both positive and negative, if applicable).
3.  **clarificationSuggestion**: A suggestion on how the user could rephrase or clarify their message to avoid ambiguity or potential negative interpretation.

Analyze the following text:
{{{textToAnalyze}}}

Return the analysis as a JSON object matching the output schema. If no risky words are found, return an empty analysis array.`,
});

const riskyWordsFlow = ai.defineFlow(
  {
    name: 'riskyWordsFlow',
    inputSchema: RiskyWordsInputSchema,
    outputSchema: RiskyWordsOutputSchema, // Final output schema includes 'id'
  },
  async (input): Promise<RiskyWordsOutput> => {
    // Basic check for empty input
    if (!input.textToAnalyze?.trim()) {
        return { analysis: [] };
    }

    const { output: llmOutput } = await riskyWordsPrompt(input);

    // Ensure output is not null and analysis is an array
    // Add unique IDs to each analysis item
    const analysisWithIds = (llmOutput?.analysis || []).map((item, index) => ({
        ...item,
        id: `rwa-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}` // Generate a simple unique ID
    }));
    
    return { analysis: analysisWithIds };
  }
);
