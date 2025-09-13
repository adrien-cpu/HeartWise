/**
 * @fileOverview Provides contextual help and onboarding guidance for users.
 * @module ContextHelpService
 * @description This service provides dynamic help content, feature tutorials, and onboarding flows.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface HelpContent {
  id: string;
  title: string;
  description: string;
  steps: HelpStep[];
  category: 'onboarding' | 'feature-guide' | 'troubleshooting' | 'tips';
  targetFeature?: string;
  priority: 'high' | 'medium' | 'low';
  prerequisites?: string[];
}

export interface HelpStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  targetElement?: string;
  image?: string;
}

export interface UserOnboardingState {
  userId: string;
  completedSteps: string[];
  currentStep?: string;
  lastActiveFeature?: string;
  showTips: boolean;
  helpPreferences: {
    autoShow: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  updatedAt: Timestamp;
}

class ContextHelpService {
  private readonly HELP_CONTENT_COLLECTION = 'helpContent';
  private readonly USER_ONBOARDING_COLLECTION = 'userOnboarding';

  private defaultHelpContent: HelpContent[] = [
    {
      id: 'profile-setup',
      title: 'Complete Your Profile',
      description: 'Set up your profile to get better matches',
      category: 'onboarding',
      priority: 'high',
      steps: [
        {
          id: 'add-photo',
          title: 'Add Your Photo',
          description: 'Upload a clear photo of yourself',
          action: 'click',
          targetElement: '#profile-photo-upload'
        },
        {
          id: 'write-bio',
          title: 'Write Your Bio',
          description: 'Tell others about yourself in a few sentences',
          action: 'focus',
          targetElement: '#bio-textarea'
        },
        {
          id: 'select-interests',
          title: 'Select Your Interests',
          description: 'Choose topics you enjoy to find compatible matches',
          action: 'click',
          targetElement: '.interests-section'
        }
      ]
    },
    {
      id: 'first-conversation',
      title: 'Start Your First Conversation',
      description: 'Learn how to use our chat features',
      category: 'onboarding',
      priority: 'high',
      prerequisites: ['profile-setup'],
      steps: [
        {
          id: 'open-chat',
          title: 'Open a Chat',
          description: 'Click on a conversation to start chatting',
          action: 'click',
          targetElement: '.conversation-item'
        },
        {
          id: 'use-intention-tags',
          title: 'Use Intention Tags',
          description: 'Select how you want your message to be perceived',
          action: 'click',
          targetElement: '#intention-select'
        },
        {
          id: 'ai-suggestions',
          title: 'AI Suggestions',
          description: 'Our AI can suggest better ways to phrase your messages',
          action: 'hover',
          targetElement: '.ai-suggestion-badge'
        }
      ]
    },
    {
      id: 'facial-analysis-guide',
      title: 'Using Facial Analysis',
      description: 'Get AI-powered match suggestions',
      category: 'feature-guide',
      targetFeature: 'facial-analysis-matching',
      priority: 'medium',
      steps: [
        {
          id: 'upload-consent',
          title: 'Grant Consent',
          description: 'Consent to facial analysis for better matching',
          action: 'click',
          targetElement: '#consent-checkbox'
        },
        {
          id: 'upload-photo',
          title: 'Upload or Capture Photo',
          description: 'Provide a clear photo for analysis',
          action: 'click',
          targetElement: '#photo-upload'
        },
        {
          id: 'review-matches',
          title: 'Review AI Suggestions',
          description: 'See why the AI thinks these people are good matches',
          action: 'scroll',
          targetElement: '.match-suggestions'
        }
      ]
    }
  ];

  async getAllHelpContent(): Promise<HelpContent[]> {
    if (criticalConfigError) {
      return this.defaultHelpContent;
    }

    try {
      // In a real implementation, this would fetch from Firestore
      // For now, return the default content
      return this.defaultHelpContent;
    } catch (error) {
      console.error('Error fetching all help content:', error);
      return this.defaultHelpContent;
    }
  }

  async getHelpContent(contentId: string): Promise<HelpContent | null> {
    if (criticalConfigError) {
      // Return default content if Firebase is not available
      return this.defaultHelpContent.find(content => content.id === contentId) || null;
    }

    try {
      const docRef = doc(firestore, this.HELP_CONTENT_COLLECTION, contentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as HelpContent;
      }
      
      // Fallback to default content
      return this.defaultHelpContent.find(content => content.id === contentId) || null;
    } catch (error) {
      console.error('Error fetching help content:', error);
      return this.defaultHelpContent.find(content => content.id === contentId) || null;
    }
  }

  async getContextualHelp(featureName: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<HelpContent[]> {
    // Return relevant help based on current feature and user level
    return this.defaultHelpContent.filter(content => 
      content.targetFeature === featureName || 
      (content.category === 'onboarding' && userLevel === 'beginner')
    ).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async getUserOnboardingState(userId: string): Promise<UserOnboardingState> {
    if (criticalConfigError) {
      return {
        userId,
        completedSteps: [],
        showTips: true,
        helpPreferences: { autoShow: true, difficulty: 'beginner' },
        updatedAt: Timestamp.now()
      };
    }

    try {
      const docRef = doc(firestore, this.USER_ONBOARDING_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserOnboardingState;
      }
      
      // Create default onboarding state
      const defaultState: UserOnboardingState = {
        userId,
        completedSteps: [],
        showTips: true,
        helpPreferences: { autoShow: true, difficulty: 'beginner' },
        updatedAt: Timestamp.now()
      };
      
      await setDoc(docRef, defaultState);
      return defaultState;
    } catch (error) {
      console.error('Error fetching user onboarding state:', error);
      return {
        userId,
        completedSteps: [],
        showTips: true,
        helpPreferences: { autoShow: true, difficulty: 'beginner' },
        updatedAt: Timestamp.now()
      };
    }
  }

  async markStepCompleted(userId: string, stepId: string): Promise<void> {
    if (criticalConfigError) return;

    try {
      const docRef = doc(firestore, this.USER_ONBOARDING_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const state = docSnap.data() as UserOnboardingState;
        if (!state.completedSteps.includes(stepId)) {
          await updateDoc(docRef, {
            completedSteps: [...state.completedSteps, stepId],
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error marking step completed:', error);
    }
  }

  async updateHelpPreferences(userId: string, preferences: Partial<UserOnboardingState['helpPreferences']>): Promise<void> {
    if (criticalConfigError) return;

    try {
      const docRef = doc(firestore, this.USER_ONBOARDING_COLLECTION, userId);
      await updateDoc(docRef, {
        helpPreferences: preferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating help preferences:', error);
    }
  }

  getNextOnboardingStep(completedSteps: string[]): HelpContent | null {
    for (const content of this.defaultHelpContent) {
      if (content.category === 'onboarding') {
        // Check if all prerequisites are completed
        const prerequisitesMet = !content.prerequisites || 
          content.prerequisites.every(prereq => completedSteps.includes(prereq));
        
        // Check if this content's steps are not all completed
        const allStepsCompleted = content.steps.every(step => completedSteps.includes(step.id));
        
        if (prerequisitesMet && !allStepsCompleted) {
          return content;
        }
      }
    }
    return null;
  }

  shouldShowContextualHelp(
    userState: UserOnboardingState, 
    currentFeature: string,
    interactionCount: number
  ): boolean {
    // Show help if:
    // 1. User has auto-show enabled
    // 2. They haven't seen help for this feature
    // 3. It's their first few interactions with the feature
    return userState.helpPreferences.autoShow && 
           userState.lastActiveFeature !== currentFeature &&
           interactionCount < 3;
  }
}

export const contextHelpService = new ContextHelpService();