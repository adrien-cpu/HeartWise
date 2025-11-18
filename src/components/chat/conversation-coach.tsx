import React, { FC } from 'react';
import { conversationCoachService, ConversationCoachState } from '../../services/conversation_coach_service';

interface ConversationCoachProps {
  state: ConversationCoachState;
}

export const ConversationCoach: FC<ConversationCoachProps> = ({ state }) => {
  const { suggestions, isAnalyzationg } = state;

  return (
    <div className="conversation-coach">
      {isAnalyzationg ? (
        <p>Analyzing...</p>
      ) : (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
