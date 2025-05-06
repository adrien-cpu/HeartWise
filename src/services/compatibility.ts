/**
 * @fileOverview Provides functions for calculating compatibility scores and generating profile descriptions.
 *
 * @module CompatibilityService
 *
 * @description This module contains helper functions used by the Blind Exchange AI flow
 * to determine compatibility between users based on psychological traits and interests,
 * and to generate a neutral profile description.
 */

import { PsychologicalTraits } from '@/services/face-analysis';

/**
 * Calculates a compatibility score based on interests and psychological traits.
 * @param traits1 Psychological traits of the first user.
 * @param traits2 Psychological traits of the second user.
 * @param interests1 Interests of the first user.
 * @param interests2 Interests of the second user.
 * @returns A number representing the compatibility score (0-100).
 */
export function calculateCompatibilityScore(
  traits1: PsychologicalTraits,
  traits2: PsychologicalTraits,
  interests1: string[],
  interests2: string[]
): number {
  let score = 0;

  // Award points for shared interests
  const sharedInterests = interests1.filter(interest => interests2.includes(interest)).length;
  score += sharedInterests * 5;

  // Award points for complementary traits (e.g., one high extroversion, one low)
  const extroversionDiff = Math.abs(traits1.extroversion - traits2.extroversion);
  if (extroversionDiff > 0.5) {
    score += 10;
  }

  // Award points for similar traits (e.g., both high agreeableness)
  if (Math.abs(traits1.agreeableness - traits2.agreeableness) < 0.3) {
    score += 10;
  }

  // Normalize the score to a percentage
  score = Math.max(0, Math.min(100, score));
  return score;
}

/**
 * Generates a profile description based on similar and opposing traits and shared interests.
 * @param interests1 Interests of the first user.
 * @param interests2 Interests of the second user.
 * @param traits1 Psychological traits of the first user.
 * @param traits2 Psychological traits of the second user.
 * @returns A string representing the generated profile description.
 */
export function generateProfileDescription(
  interests1: string[],
  interests2: string[],
  traits1: PsychologicalTraits,
  traits2: PsychologicalTraits
): string {
  let description = '';

  // Highlight shared interests
  const sharedInterests = interests1.filter(interest => interests2.includes(interest));
  if (sharedInterests.length > 0) {
    description += `Both users share an interest in ${sharedInterests.join(', ')}. `;
  }

  // Highlight complementary traits
  const extroversionDiff = Math.abs(traits1.extroversion - traits2.extroversion);
  if (extroversionDiff > 0.5) {
    description += 'One user is more outgoing, while the other is more reserved, which could lead to a balanced dynamic. ';
  }

  // Highlight similar traits
  if (Math.abs(traits1.agreeableness - traits2.agreeableness) < 0.3) {
    description += 'Both users value agreeableness and getting along with others. ';
  }

  if (description === '') {
    description = 'These users have the potential for an interesting connection.';
  }

  return description;
}

// Note: The calculateCompatibilityRate function was deemed redundant with calculateCompatibilityScore
// and has not been included in this refactored file.
