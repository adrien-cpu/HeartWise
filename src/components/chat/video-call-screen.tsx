import React, { FC } from 'react';
import { videoCallService, VideoCallState } from '../../services/video_call_service';

interface VideoCallScreenProps {
  state: VideoCallState;
}

export const VideoCallScreen: FC<VideoCallScreenProps> = ({ state }) => {
  const { users, isCameraOn, isMicrophoneOn } = state;

  return (
    <div className="video-call-screen">
      <div className="video-grid">
        {users.map((user) => (
          <div key={user.id} className="video-participant">
            <div className="video-placeholder">{user.name}</div>
            <div className="participant-controls">
              <span>{user.isCameraOn ? '📷' : '📸'}</span>
              <span>{user.isMicrophoneOn ? '🎤' : '🎙️'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="call-controls">
        <button onClick={() => videoCallService.toggleCamera()}>
          {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </button>
        <button onClick={() => videoCallService.toggleMicrophone()}>
          {isMicrophoneOn ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={() => videoCallService.endCall()}>End Call</button>
      </div>
    </div>
  );
};
