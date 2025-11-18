
import { BehaviorSubject } from 'rxjs';

// Mock implementation of a conversation coach service
// In a real application, this would be replaced with an API call to a LLM

export interface ConversationCoachState {
  suggestions: string[];
  isAnalyzationg: boolean;
}

const initialState: ConversationCoachState = {
  suggestions: [],
  isAnalyzationg: false,
};

class ConversationCoachService {
  private readonly _state = new BehaviorSubject<ConversationCoachState>(initialState);

  public readonly state$ = this._state.asObservable();

  public analyzeMessage(message: string) {
    this._state.next({ ...this._state.value, isAnalyzationg: true });

    // Simulate API call to LLM
    setTimeout(() => {
      const suggestions = [
        `Rephrase: "${message}" to be more engaging.`,
        `Ask an open-ended question related to the topic.`,
        `Add a personal touch to your message.`,
      ];
      this._state.next({ suggestions, isAnalyzationg: false });
    }, 1000);
  }

  public clearSuggestions() {
    this._state.next(initialState);
  }
}

export const conversationCoachService = new ConversationCoachService();
