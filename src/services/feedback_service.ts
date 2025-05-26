
'use server';

/**
 * @fileOverview Provides services for submitting user feedback related to risky word analysis.
 * @module FeedbackService
 * @description This module contains functions to submit feedback on words flagged by the
 *              Risky Words Dictionary and to report words that users believe should have been flagged.
 *              Feedback is stored in Firestore for potential model retraining or analysis.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

/**
 * @interface RiskyWordFeedback
 * @description Defines the structure for feedback submitted by users on flagged risky words.
 */
export interface RiskyWordFeedback {
  /** @property {string} [id] - Firestore document ID (auto-generated). */
  id?: string;
  /** @property {string} userId - ID of the user providing feedback. */
  userId: string;
  /** @property {string} originalText - The full text that was analyzed. */
  originalText: string;
  /** @property {string} flaggedWord - The specific word/phrase that was flagged. */
  flaggedWord: string;
  /** @property {'accurate' | 'not_risky'} feedbackType - Type of feedback ('accurate' or 'not_risky'). */
  feedbackType: 'accurate' | 'not_risky';
  /** @property {string} [analysisItemId] - Optional ID of the analysis item from RiskyWordAnalysis. */
  analysisItemId?: string;
  /** @property {Timestamp} timestamp - Timestamp of when the feedback was submitted. */
  timestamp: Timestamp;
  /** @property {string} [notes] - Optional user notes. */
  notes?: string;
}

/**
 * Submits feedback for a risky word analysis item to Firestore.
 * @async
 * @function submitRiskyWordFeedback
 * @param {Omit<RiskyWordFeedback, 'id' | 'timestamp'>} feedbackData - The feedback data to submit.
 * @returns {Promise<string>} The ID of the newly created feedback document in Firestore.
 * @throws {Error} If submission to Firestore fails.
 */
export async function submitRiskyWordFeedback(
  feedbackData: Omit<RiskyWordFeedback, 'id' | 'timestamp'>
): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot submit risky word feedback.");
    throw new Error("Application services are not available.");
  }
  try {
    const feedbackCollectionRef = collection(firestore, 'riskyWordsFeedback');
    const docRef = await addDoc(feedbackCollectionRef, {
      ...feedbackData,
      timestamp: serverTimestamp(), 
    });
    console.log('Risky word feedback submitted with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting risky word feedback:', error);
    throw new Error('Failed to submit feedback to Firestore.');
  }
}

/**
 * @interface ReportMissedRiskyWord
 * @description Defines the structure for reports submitted by users for words/phrases
 *              they believe should have been flagged as risky.
 */
export interface ReportMissedRiskyWord {
  /** @property {string} [id] - Firestore document ID (auto-generated). */
  id?: string;
  /** @property {string} userId - ID of the user submitting the report. */
  userId: string;
  /** @property {string} originalText - The full text that was analyzed where the word was missed. */
  originalText: string;
  /** @property {string} missedWord - The word/phrase the user believes should have been flagged. */
  missedWord: string;
  /** @property {string} [reason] - Optional: User's reason why the word is risky. */
  reason?: string;
  /** @property {Timestamp} timestamp - Timestamp of when the report was submitted. */
  timestamp: Timestamp;
}

/**
 * Submits a report for a word/phrase that was missed by the risky words dictionary to Firestore.
 * @async
 * @function reportMissedRiskyWord
 * @param {Omit<ReportMissedRiskyWord, 'id' | 'timestamp'>} reportData - The report data.
 * @returns {Promise<string>} The ID of the newly created report document in Firestore.
 * @throws {Error} If submission to Firestore fails.
 */
export async function reportMissedRiskyWord(
  reportData: Omit<ReportMissedRiskyWord, 'id' | 'timestamp'>
): Promise<string> {
    if (criticalConfigError) {
      console.error("Firebase is not configured. Cannot report missed risky word.");
      throw new Error("Application services are not available.");
    }
    try {
        const reportsCollectionRef = collection(firestore, 'missedRiskyWordReports');
        const docRef = await addDoc(reportsCollectionRef, {
            ...reportData,
            timestamp: serverTimestamp(),
        });
        console.log('Missed risky word report submitted with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error submitting missed risky word report:', error);
        throw new Error('Failed to submit report to Firestore.');
    }
}

/**
 * Conceptual function for how feedback could be processed by a backend system.
 * This would involve fetching feedback, analyzing patterns, and potentially
 * updating an AI model or a dynamic list of risky words.
 * This is a placeholder and would not be called directly from the client.
 * @async
 * @function processFeedbackForModelUpdate
 * @param {Date} since - Optional date to process feedback since.
 * @returns {Promise<void>}
 */
async function processFeedbackForModelUpdate(since?: Date): Promise<void> {
  console.log("Conceptual: Starting processFeedbackForModelUpdate...");
  // 1. Fetch feedback from 'riskyWordsFeedback' and 'missedRiskyWordReports' collections.
  //    - Filter by date if 'since' is provided.
  //    - Example: query(feedbackCollectionRef, where('timestamp', '>', Timestamp.fromDate(since)))
  
  // 2. Analyze the feedback:
  //    - Identify words frequently marked 'not_risky' that the AI flagged.
  //    - Identify words frequently reported as 'missed' that the AI didn't flag.
  //    - Look for patterns in `originalText` and `reason` for missed words.

  // 3. Prepare data for model retraining or updating dynamic lists:
  //    - This could involve creating datasets for fine-tuning an LLM.
  //    - Or, updating a blocklist/allowlist used by the Genkit flow.
  
  // 4. Trigger model retraining or update process (external to this function).

  console.log("Conceptual: Feedback processing complete. Data would be ready for model update/retraining.");
  // In a real scenario, this might involve:
  // - Storing aggregated feedback insights.
  // - Kicking off a separate ML training pipeline.
  // - Updating a remote configuration or database that the Genkit flow reads.
}

// Note: The `processFeedbackForModelUpdate` function is purely conceptual
// and illustrates where backend AI/ML logic would integrate.
// It is not intended to be called from client-side code.
