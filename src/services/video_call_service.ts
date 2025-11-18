
import { BehaviorSubject } from 'rxjs';

// Mock implementation of a video call service
// In a real application, this would be replaced with a WebRTC solution like Twilio or Agora

export interface VideoCallUser {
  id: string;
  name: string;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
}

export interface VideoCallState {
  users: VideoCallUser[];
  isCallActive: boolean;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
}

const initialState: VideoCallState = {
  users: [],
  isCallActive: false,
  isCameraOn: false,
  isMicrophoneOn: false,
};

class VideoCallService {
  private readonly _state = new BehaviorSubject<VideoCallState>(initialState);

  public readonly state$ = this._state.asObservable();

  public startCall() {
    this._state.next({
      ...this._state.value,
      isCallActive: true,
      isCameraOn: true,
      isMicrophoneOn: true,
      users: [
        {
          id: 'user-1',
          name: 'You',
          isCameraOn: true,
          isMicrophoneOn: true,
        },
        {
          id: 'user-2',
          name: 'John Doe',
          isCameraOn: true,
          isMicrophoneOn: false,
        },
      ],
    });
  }

  public endCall() {
    this._state.next(initialState);
  }

  public toggleCamera() {
    const currentState = this._state.value;
    this._state.next({
      ...currentState,
      isCameraOn: !currentState.isCameraOn,
    });
  }

  public toggleMicrophone() {
    const currentState = this._state.value;
    this._state.next({
      ...currentState,
      isMicrophoneOn: !currentState.isMicrophoneOn,
    });
  }
}

export const videoCallService = new VideoCallService();
