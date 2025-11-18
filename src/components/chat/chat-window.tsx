import React, { FC, useState, useEffect } from 'react';
import { videoCallService, VideoCallState } from '../../services/video_call_service';
import { VideoCallScreen } from './video-call-screen';
import { conversationCoachService, ConversationCoachState } from '../../services/conversation_coach_service';
import { ConversationCoach } from './conversation-coach';

export const ChatWindow: FC = () => {
  const [videoCallState, setVideoCallState] = useState<VideoCallState | null>(null);
  const [coachState, setCoachState] = useState<ConversationCoachState | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const videoSub = videoCallService.state$.subscribe(setVideoCallState);
    const coachSub = conversationCoachService.state$.subscribe(setCoachState);
    return () => {
      videoSub.unsubscribe();
      coachSub.unsubscribe();
    };
  }, []);

  const handleAnalyze = () => {
    conversationCoachService.analyzeMessage(message);
  };

  return (
    <div className="chat-window">
      {videoCallState?.isCallActive ? (
        <VideoCallScreen state={videoCallState} />
      ) : (
        <div className="chat-interface">
          {coachState && <ConversationCoach state={coachState} />}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={handleAnalyze}>Analyze</button>
          <button onClick={() => videoCallService.startCall()}>Start Video Call</button>
        </div>
      )}
    </div>
  );
};
