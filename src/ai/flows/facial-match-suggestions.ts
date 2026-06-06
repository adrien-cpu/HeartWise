
'use server';
/**
 * @fileOverview Genkit flow for suggesting potential matches based on facial and psychological analysis.
 * @module FacialMatchSuggestionsFlow
 * @description This flow takes a user's photo, analyzes it, compares it against a (mock) database
 *              of other users, and uses an LLM to provide reasoned match suggestions.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { UserProfile, get_all_users } from '@/services/user_profile';
import { 
  getPsychologicalTraits, 
  compareFaces, 
  PsychologicalTraits, 
  FaceData 
} from '@/services/face-analysis';

// Type definition for a match candidate based on its usage
interface MatchCandidate {
  userId: string;
  name: string | undefined;
  psychologicalTraits: PsychologicalTraits;
  interests: string[] | undefined;
  facialCompatibilityScore: number;
}

// Schema for the psychological traits (re-defined here for explicitness if needed, or import directly)
const PsychologicalTraitsSchema = z.object({
  openness: z.number().min(0).max(1).optional().describe("Openness to experience score (0-1)"),
  conscientiousness: z.number().min(0).max(1).optional().describe("Conscientiousness score (0-1)"),
  extroversion: z.number().min(0).max(1).describe("Extroversion score (0-1)"),
  agreeableness: z.number().min(0).max(1).describe("Agreeableness score (0-1)"),
  neuroticism: z.number().min(0).max(1).optional().describe("Neuroticism score (0-1)"),
});

// Schema for the current user's analyzed data to be passed to the prompt
const CurrentUserAnalyzedDataSchema = z.object({
  // We don't pass the photo URI directly to the LLM for privacy/token reasons,
  // but we pass its derived traits. The LLM is told a photo was analyzed.
  psychologicalTraits: PsychologicalTraitsSchema.describe("Psychological traits of the current user, derived from their photo."),
  interests: z.array(z.string()).optional().describe("Interests of the current user."),
});

// Schema for a candidate profile to be passed to the prompt
const MatchCandidateSchema = z.object({
  userId: z.string().describe("ID of the candidate."),
  name: z.string().optional().describe("Name of the candidate."),
  // Candidate's photo URI is not directly passed to the prompt for privacy/token reasons.
  // The AI is informed that photos were compared.
  psychologicalTraits: PsychologicalTraitsSchema.describe("Psychological traits of the candidate, derived from their photo."),
  interests: z.array(z.string()).optional().describe("Interests of the candidate."),
  facialCompatibilityScore: z.number().min(0).max(100).describe("Pre-calculated facial compatibility score (0-100) between the current user and this candidate."),
});

// Input schema for the Genkit AI prompt
const AiMatchContextSchema = z.object({
  currentUserData: CurrentUserAnalyzedDataSchema.describe("Analyzed data of the current user seeking matches."),
  candidates: z.array(MatchCandidateSchema).describe("List of potential match candidates with their analyzed data."),
});

// Schema for a single match suggestion (output from AI)
export const FacialMatchSuggestionSchema = z.object({
  userId: z.string().describe("The ID of the suggested user."),
  name: z.string().optional().describe("The name of the suggested user."),
  profilePicture: z.string().describe("URL of the suggested user's profile picture."),
  dataAiHint: z.string().optional().describe("AI hint for the profile picture (e.g., 'man smiling')."),
  overallCompatibilityScore: z.number().min(0).max(100).describe("AI-assessed overall compatibility score (0-100)."),
  reasoning: z.string().describe("Brief reasoning for the match suggestion (1-2 sentences)."),
});
export type FacialMatchSuggestion = z.infer<typeof FacialMatchSuggestionSchema>;

// Input schema for the main flow
export const FacialMatchSuggestionsInputSchema = z.object({
  currentUserPhotoDataUri: z.string().describe("Data URI of the current user's photo for matching."),
  currentUserId: z.string().describe("ID of the current user seeking matches."), // To exclude self from candidates
});
export type FacialMatchSuggestionsInput = z.infer<typeof FacialMatchSuggestionsInputSchema>;

// Output schema for the main flow
export const FacialMatchSuggestionsOutputSchema = z.object({
  suggestions: z.array(FacialMatchSuggestionSchema).describe("List of AI-powered match suggestions."),
});
export type FacialMatchSuggestionsOutput = z.infer<typeof FacialMatchSuggestionsOutputSchema>;


const facialMatchmakingPrompt = ai.definePrompt({
  name: 'facialMatchmakingPrompt',
  input: { schema: AiMatchContextSchema },
  output: { schema: FacialMatchSuggestionsOutputSchema }, // The AI will directly output in the final flow's output structure
  prompt: `You are an advanced AI matchmaker for the HeartWise dating app. Your goal is to identify the most promising connections for a user based on a holistic analysis of their profile (psychological traits derived from their photo and their interests) and potential candidates.

Current User's Profile:
- Psychological Traits (derived from photo analysis):
  - Extroversion: {{{currentUserData.psychologicalTraits.extroversion}}}
  - Agreeableness: {{{currentUserData.psychologicalTraits.agreeableness}}}
  {{#if currentUserData.psychologicalTraits.openness}}- Openness: {{{currentUserData.psychologicalTraits.openness}}}{{/if}}
  {{#if currentUserData.psychologicalTraits.conscientiousness}}- Conscientiousness: {{{currentUserData.psychologicalTraits.conscientiousness}}}{{/if}}
  {{#if currentUserData.psychologicalTraits.neuroticism}}- Neuroticism: {{{currentUserData.psychologicalTraits.neuroticism}}}{{/if}}
- Interests: {{#if currentUserData.interests}}{{{currentUserData.interests.join ', '}}}{{else}}Not specified{{/if}}

Potential Match Candidates (Photos have been analyzed for facial compatibility and psychological traits):
{{#each candidates}}
- Candidate ID: {{{userId}}}
  - Name: {{{name}}}
  - Psychological Traits (derived from photo analysis):
    - Extroversion: {{{psychologicalTraits.extroversion}}}
    - Agreeableness: {{{psychologicalTraits.agreeableness}}}
    {{#if psychologicalTraits.openness}}- Openness: {{{psychologicalTraits.openness}}}{{/if}}
    {{#if psychologicalTraits.conscientiousness}}- Conscientiousness: {{{psychologicalTraits.conscientiousness}}}{{/if}}
    {{#if psychologicalTraits.neuroticism}}- Neuroticism: {{{psychologicalTraits.neuroticism}}}{{/if}}
  - Interests: {{#if interests}}{{{interests.join ', '}}}{{else}}Not specified{{/if}}
  - Facial Compatibility Score with Current User: {{{facialCompatibilityScore}}}%
{{/each}}

Task:
Analyze all provided data. Select the top 3-5 most promising matches from the candidates.
For each selected match, you MUST provide:
1.  'userId': The ID of the candidate.
2.  'name': The name of the candidate.
3.  'profilePicture': You will be provided this after selection by the system. For now, use the candidate's name as a placeholder like "Photo of [CandidateName]".
4.  'dataAiHint': You will be provided this after selection. For now, use a generic hint like "person".
5.  'overallCompatibilityScore': Your holistic assessment of compatibility (0-100), considering facial compatibility, psychological traits (both similarities and beneficial differences), and shared interests.
6.  'reasoning': A brief (1-2 sentences) explanation for why this candidate is a good match. Highlight specific points of connection or complementary aspects.

Consider these principles:
- "Birds of a feather flock together": Similarities can be good.
- "Opposites attract": Complementary traits can also lead to strong connections.
- Facial compatibility is one factor, but psychological and interest-based compatibility are equally important.
- Aim for a diverse set of reasoned suggestions if possible.

Return your response as a JSON object matching the output schema, containing a 'suggestions' array.
`,
});

const facialMatchSuggestionsFlow = ai.defineFlow(
  {
    name: 'facialMatchSuggestionsFlow',
    inputSchema: FacialMatchSuggestionsInputSchema,
    outputSchema: FacialMatchSuggestionsOutputSchema,
  },
  async (input): Promise<FacialMatchSuggestionsOutput> => {
    const { currentUserPhotoDataUri, currentUserId } = input;

    // 1. Get current user's data
    const currentUserPhotoFaceData: FaceData = { imageUrl: currentUserPhotoDataUri };
    const currentUserPsychTraits = await getPsychologicalTraits(currentUserPhotoFaceData);
    // In a real app, current user's interests would be fetched from their full profile
    // For simulation, we'll assume they are not passed or are empty if not available
    const currentUserAnalyzedData = {
      psychologicalTraits: currentUserPsychTraits,
      interests: [], // Placeholder or fetch from a UserProfile if available
    };

    // 2. Get all other users as candidates (mocked)
    const allUsers = await get_all_users({ forMatching: true });
    const candidateProfiles = allUsers.filter(user => user.id !== currentUserId && user.profilePicture);

    if (candidateProfiles.length === 0) {
      return { suggestions: [] }; // No candidates to match against
    }

    // 3. Analyze candidates
    const matchCandidates: MatchCandidate[] = await Promise.all(
      candidateProfiles.map(async (candidate) => {
        const candidatePhotoFaceData: FaceData = { imageUrl: candidate.profilePicture! };
        const candidatePsychTraits = await getPsychologicalTraits(candidatePhotoFaceData);
        const facialScore = await compareFaces(currentUserPhotoFaceData, candidatePhotoFaceData);
        
        return {
          userId: candidate.id,
          name: candidate.name,
          psychologicalTraits: candidatePsychTraits,
          interests: candidate.interests,
          facialCompatibilityScore: facialScore,
        };
      })
    );
    
    // 4. Call LLM to get suggestions
    const { output } = await facialMatchmakingPrompt({
      currentUserData: currentUserAnalyzedData,
      candidates: matchCandidates,
    });

    if (!output || !output.suggestions) {
      console.error('AI did not return valid suggestions for facial matching.');
      return { suggestions: [] };
    }

    // 5. Augment suggestions with actual profile picture URLs and dataAiHints
    const augmentedSuggestions = output.suggestions.map(suggestion => {
      const originalCandidate = candidateProfiles.find(p => p.id === suggestion.userId);
      return {
        ...suggestion,
        profilePicture: originalCandidate?.profilePicture || 'https://placehold.co/200x200.png', // Fallback
        dataAiHint: originalCandidate?.dataAiHint || 'person', // Fallback
        name: suggestion.name || originalCandidate?.name || 'Unknown User', // Ensure name is present
      };
    });

    return { suggestions: augmentedSuggestions };
  }
);

/**
 * Publicly exported function to trigger the facial match suggestions flow.
 * @param {FacialMatchSuggestionsInput} input - The user's photo data URI and ID.
 * @returns {Promise<FacialMatchSuggestionsOutput>} A promise resolving to AI-powered match suggestions.
 */
export async function suggestFacialMatches(input: FacialMatchSuggestionsInput): Promise<FacialMatchSuggestionsOutput> {
  return facialMatchSuggestionsFlow(input);
};