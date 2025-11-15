import { Answer } from "@/ai/questionnaires/questionnaire_structure";

export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    bio?: string;
    profilePicture?: string;
    interests?: string[];
    questionnaireAnswers?: Record<string, Answer>;
    createdAt?: any; 
    updatedAt?: any;
}
