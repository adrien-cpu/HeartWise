/**
 * @fileOverview Configures and exports the Genkit AI instance for the application.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * The Genkit AI instance configured for this application.
 *
 * @const {Genkit} ai - The configured Genkit instance.
 */
export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
