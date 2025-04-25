/**
 * @fileOverview Provides services for performing face analysis.
 *
 * @module face-analysis
 *
 * @description This module defines the FaceData and PsychologicalTraits interfaces,
 * and the getPsychologicalTraits function for retrieving psychological traits from face data.
 */
import { generateResponse } from "@/ai/ai-instance";

/**
 * @interface FaceData
 * @description Represents facial morphology data.
 */
export interface FaceData {
  /**
   * @property {string} imageUrl - The URL of the image to process.
   */
  imageUrl: string;
}

/**
 * @interface PsychologicalTraits
 * @description Represents psychological traits.
 */
export interface PsychologicalTraits {
  /**
   * @property {number} extroversion - The extroversion score.
   */
  extroversion: number;
  /**
   * @property {number} agreeableness - The agreeableness score.
   */
  agreeableness: number;
}

/**
 * @async
 * @function getPsychologicalTraits
 * @description Asynchronously retrieves psychological traits for a given face.
 * @param {FaceData} faceData - The face data for which to retrieve psychological traits.
 * @returns {Promise<PsychologicalTraits>} A promise that resolves to a list of psychological traits.
 */
export async function getPsychologicalTraits(faceData: FaceData): Promise<PsychologicalTraits> {
  // TODO: Implement this by calling an API.

  return {
    extroversion: 0.8,
    agreeableness: 0.7,
  };
}

/**
 * @interface Face
 * @description Represents a face object with an ID and image URL.
 */
export interface Face {
  /**
   * @property {string} id - The unique identifier of the face.
   */
  id: string;
  /**
   * @property {string} imageUrl - The URL of the image representing the face.
   */
  imageUrl: string;
}

/**
 * @function analyzeFaces
 * @description Analyzes an array of faces and returns them sorted by similarity to the first face.
 * @param {Face[]} faces - An array of face objects to analyze.
 * @returns {Face[]} - An array of faces sorted by similarity, with the most similar face first. Each face object includes a 'similarity' property.
 */
export function analyzeFaces(faces: Face[]): (Face & { similarity: number })[] {
  if (!faces || faces.length === 0) {
    return [];
  }

  const facesWithSimilarity = faces.map((face, index) => ({
    ...face,
    similarity: index === 0 ? 1 : Math.random(),
  }));

  facesWithSimilarity.sort((a, b) => b.similarity - a.similarity);

  return facesWithSimilarity;
}
