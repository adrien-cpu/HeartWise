/**
 * @fileOverview Provides WebRTC functionality for video and audio calls.
 * @module WebRTCService
 * @description This module implements WebRTC for peer-to-peer video and audio calls,
 *              using Firestore for signaling.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  deleteDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  FieldValue
} from 'firebase/firestore';

export interface RTCConnection {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  signalingChannelId: string | null;
  callStatus: 'idle' | 'dialing' | 'receiving' | 'active' | 'ended' | 'error';
  isInitiator: boolean;
  unsubscribeSignaling?: Unsubscribe;
  onRemoteStreamReady?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
  targetUserId?: string;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Add TURN servers for production
];

const signalingCollectionName = 'webrtcSignaling';

interface SignalingMessageBase {
  senderId: string;
  timestamp: FieldValue;
}

export interface OfferMessage extends SignalingMessageBase {
  type: 'offer';
  sdp: RTCSessionDescriptionInit;
}

export interface AnswerMessage extends SignalingMessageBase {
  type: 'answer';
  sdp: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage extends SignalingMessageBase {
  type: 'candidate';
  candidate: RTCIceCandidateInit;
}

export interface HangupMessage extends SignalingMessageBase {
  type: 'hangup';
}

export type SignalingMessage = OfferMessage | AnswerMessage | IceCandidateMessage | HangupMessage;

export class WebRTCService {
  private userId: string;
  private connection: RTCConnection | null = null;
  private unsubscribeSignaling: Unsubscribe | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  private getSignalingChannelId(targetUserId: string): string {
    return [this.userId, targetUserId].sort().join('_webrtc_');
  }

  async initializeCall(targetUserId: string): Promise<void> {
    try {
      // Create a new connection
      this.connection = {
        peerConnection: null,
        localStream: null,
        remoteStream: null,
        signalingChannelId: this.getSignalingChannelId(targetUserId),
        callStatus: 'idle',
        isInitiator: true,
        targetUserId
      };

      // Initialize the signaling channel
      await this.initializeSignalingChannel(this.connection.signalingChannelId);

      // Get local media stream
      this.connection.localStream = await this.getLocalStream();

      // Initialize peer connection
      this.connection.peerConnection = this.initializePeerConnection();

      // Add local stream to peer connection
      this.addLocalStreamToPeerConnection();

      // Listen for signaling messages
      this.listenForSignalingMessages();

      // Create and send offer
      this.connection.callStatus = 'dialing';
      this.notifyCallStateChange();
      
      const offer = await this.createOffer();
      await this.sendSignalingMessage({
        type: 'offer',
        sdp: offer,
        senderId: this.userId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error initializing call:', error);
      this.handleCallError(error);
    }
  }

  async handleIncomingCall(callId: string): Promise<void> {
    try {
      this.connection = {
        peerConnection: null,
        localStream: null,
        remoteStream: null,
        signalingChannelId: callId,
        callStatus: 'receiving',
        isInitiator: false
      };

      // Get local media stream
      this.connection.localStream = await this.getLocalStream();

      // Initialize peer connection
      this.connection.peerConnection = this.initializePeerConnection();

      // Add local stream to peer connection
      this.addLocalStreamToPeerConnection();

      // Listen for signaling messages
      this.listenForSignalingMessages();

      this.notifyCallStateChange();
    } catch (error) {
      console.error('Error handling incoming call:', error);
      this.handleCallError(error);
    }
  }

  async acceptCall(): Promise<void> {
    if (!this.connection || this.connection.callStatus !== 'receiving') {
      throw new Error('No incoming call to accept');
    }

    try {
      // Get the offer from Firestore
      const signalingDocRef = doc(db, signalingCollectionName, this.connection.signalingChannelId!);
      const docSnap = await getDoc(signalingDocRef);
      
      if (!docSnap.exists() || !docSnap.data().offer) {
        throw new Error('No offer found for this call');
      }

      const offerData = docSnap.data().offer;
      
      // Set remote description (the offer)
      await this.connection.peerConnection!.setRemoteDescription(new RTCSessionDescription(offerData.sdp));
      
      // Create answer
      const answer = await this.connection.peerConnection!.createAnswer();
      await this.connection.peerConnection!.setLocalDescription(answer);
      
      // Send answer
      await this.sendSignalingMessage({
        type: 'answer',
        sdp: answer,
        senderId: this.userId,
        timestamp: serverTimestamp()
      });
      
      this.connection.callStatus = 'active';
      this.notifyCallStateChange();
    } catch (error) {
      console.error('Error accepting call:', error);
      this.handleCallError(error);
    }
  }

  async rejectCall(): Promise<void> {
    if (!this.connection || this.connection.callStatus !== 'receiving') {
      return;
    }

    await this.endCall();
  }

  async endCall(): Promise<void> {
    if (!this.connection) return;

    try {
      // Send hangup signal
      if (this.connection.signalingChannelId) {
        await this.sendSignalingMessage({
          type: 'hangup',
          senderId: this.userId,
          timestamp: serverTimestamp()
        });
      }

      // Stop all tracks
      if (this.connection.localStream) {
        this.connection.localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (this.connection.peerConnection) {
        this.connection.peerConnection.close();
      }

      // Clean up signaling
      if (this.unsubscribeSignaling) {
        this.unsubscribeSignaling();
        this.unsubscribeSignaling = null;
      }

      // Update status
      const oldStatus = this.connection.callStatus;
      this.connection.callStatus = 'ended';
      this.notifyCallStateChange();

      // Trigger onCallEnded callback
      if (this.connection.onCallEnded) {
        this.connection.onCallEnded();
      }

      // Reset connection
      this.connection = null;
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  async toggleMute(): Promise<boolean> {
    if (!this.connection || !this.connection.localStream) return false;

    const audioTracks = this.connection.localStream.getAudioTracks();
    const isMuted = !audioTracks[0]?.enabled;
    
    audioTracks.forEach(track => {
      track.enabled = isMuted;
    });
    
    this.notifyCallStateChange();
    return isMuted;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.connection || !this.connection.localStream) return false;

    const videoTracks = this.connection.localStream.getVideoTracks();
    const isVideoEnabled = !videoTracks[0]?.enabled;
    
    videoTracks.forEach(track => {
      track.enabled = isVideoEnabled;
    });
    
    this.notifyCallStateChange();
    return isVideoEnabled;
  }

  async toggleScreenShare(): Promise<boolean> {
    if (!this.connection || !this.connection.peerConnection) return false;

    try {
      // If already sharing screen, stop sharing
      const sender = this.connection.peerConnection.getSenders().find(s => 
        s.track?.kind === 'video' && s.track.label.includes('screen')
      );

      if (sender) {
        // Stop screen sharing
        sender.track?.stop();
        
        // Replace with camera video
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = cameraStream.getVideoTracks()[0];
        await sender.replaceTrack(videoTrack);
        
        this.notifyCallStateChange();
        return false;
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Find video sender
        const videoSender = this.connection.peerConnection.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        } else {
          this.connection.peerConnection.addTrack(screenTrack, screenStream);
        }
        
        // Handle the end of screen sharing
        screenTrack.onended = async () => {
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = cameraStream.getVideoTracks()[0];
          
          const sender = this.connection.peerConnection?.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
          
          this.notifyCallStateChange();
        };
        
        this.notifyCallStateChange();
        return true;
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      return false;
    }
  }

  setCallStateChangeCallback(callback: (state: {
    isCallActive: boolean;
    isMuted: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
  }) => void): void {
    this.onCallStateChange = callback;
    this.notifyCallStateChange();
  }

  private onCallStateChange: ((state: any) => void) | null = null;

  private notifyCallStateChange(): void {
    if (!this.onCallStateChange || !this.connection) return;

    const audioTracks = this.connection.localStream?.getAudioTracks() || [];
    const videoTracks = this.connection.localStream?.getVideoTracks() || [];
    
    const isMuted = audioTracks.length > 0 ? !audioTracks[0].enabled : true;
    const isVideoEnabled = videoTracks.length > 0 ? videoTracks[0].enabled : false;
    const isScreenSharing = videoTracks.length > 0 ? videoTracks[0].label.includes('screen') : false;
    
    this.onCallStateChange({
      isCallActive: this.connection.callStatus === 'active',
      isMuted,
      isVideoEnabled,
      isScreenSharing,
      localStream: this.connection.localStream,
      remoteStream: this.connection.remoteStream
    });
  }

  private async getLocalStream(constraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera or microphone');
    }
  }

  private initializePeerConnection(): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'candidate',
          candidate: event.candidate.toJSON(),
          senderId: this.userId,
          timestamp: serverTimestamp()
        });
      }
    };
    
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.connection!.remoteStream = event.streams[0];
        
        if (this.connection?.onRemoteStreamReady) {
          this.connection.onRemoteStreamReady(event.streams[0]);
        }
        
        this.notifyCallStateChange();
      }
    };
    
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state change:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        this.connection!.callStatus = 'active';
        this.notifyCallStateChange();
      } else if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
        this.handleCallEnded();
      }
    };
    
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state change:', peerConnection.iceConnectionState);
      
      if (['disconnected', 'failed', 'closed'].includes(peerConnection.iceConnectionState)) {
        this.handleCallEnded();
      }
    };
    
    return peerConnection;
  }

  private addLocalStreamToPeerConnection(): void {
    if (!this.connection?.peerConnection || !this.connection.localStream) return;
    
    this.connection.localStream.getTracks().forEach(track => {
      if (this.connection?.peerConnection && this.connection.localStream) {
        this.connection.peerConnection.addTrack(track, this.connection.localStream);
      }
    });
  }

  private async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.connection?.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    const offer = await this.connection.peerConnection.createOffer();
    await this.connection.peerConnection.setLocalDescription(offer);
    return offer;
  }

  private async initializeSignalingChannel(channelId: string): Promise<void> {
    const signalingDocRef = doc(db, signalingCollectionName, channelId);
    
    try {
      await setDoc(signalingDocRef, {
        createdAt: serverTimestamp(),
        status: 'initiating',
        candidates: {},
        lastActivity: {}
      });
    } catch (error) {
      console.error('Error initializing signaling channel:', error);
      throw new Error('Failed to initialize signaling channel');
    }
  }

  private listenForSignalingMessages(): void {
    if (!this.connection?.signalingChannelId) return;
    
    const signalingDocRef = doc(db, signalingCollectionName, this.connection.signalingChannelId);
    
    this.unsubscribeSignaling = onSnapshot(signalingDocRef, async (docSnap) => {
      if (!docSnap.exists() || !this.connection?.peerConnection) return;
      
      const data = docSnap.data();
      
      // Process offer
      if (data.offer && data.offer.senderId !== this.userId && this.connection.callStatus === 'receiving') {
        try {
          await this.connection.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer.sdp));
          
          // Create and send answer
          const answer = await this.connection.peerConnection.createAnswer();
          await this.connection.peerConnection.setLocalDescription(answer);
          
          await this.sendSignalingMessage({
            type: 'answer',
            sdp: answer,
            senderId: this.userId,
            timestamp: serverTimestamp()
          });
        } catch (error) {
          console.error('Error processing offer:', error);
        }
      }
      
      // Process answer
      if (data.answer && data.answer.senderId !== this.userId && this.connection.callStatus === 'dialing') {
        try {
          await this.connection.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer.sdp));
          this.connection.callStatus = 'active';
          this.notifyCallStateChange();
        } catch (error) {
          console.error('Error processing answer:', error);
        }
      }
      
      // Process ICE candidates
      if (data.candidates) {
        const otherUserIds = Object.keys(data.candidates).filter(id => id !== this.userId);
        
        for (const senderId of otherUserIds) {
          if (data.candidates[senderId] && Array.isArray(data.candidates[senderId])) {
            for (const candidate of data.candidates[senderId]) {
              try {
                await this.connection.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (error) {
                console.error('Error adding ICE candidate:', error);
              }
            }
          }
        }
      }
      
      // Process hangup
      if (data.hangup && data.hangup.senderId !== this.userId) {
        this.handleCallEnded();
      }
    }, (error) => {
      console.error('Error listening to signaling messages:', error);
    });
  }

  private async sendSignalingMessage(message: SignalingMessage): Promise<void> {
    if (!this.connection?.signalingChannelId) return;
    
    const signalingDocRef = doc(db, signalingCollectionName, this.connection.signalingChannelId);
    
    try {
      if (message.type === 'candidate') {
        await updateDoc(signalingDocRef, {
          [`candidates.${this.userId}`]: arrayUnion(message.candidate),
          [`lastActivity.${this.userId}`]: serverTimestamp()
        });
      } else {
        await updateDoc(signalingDocRef, {
          [message.type]: message,
          [`lastActivity.${this.userId}`]: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error sending signaling message:', error);
      throw new Error('Failed to send signaling message');
    }
  }

  private handleCallError(error: any): void {
    console.error('Call error:', error);
    
    if (this.connection) {
      this.connection.callStatus = 'error';
      this.notifyCallStateChange();
    }
    
    this.endCall();
  }

  private handleCallEnded(): void {
    if (!this.connection) return;
    
    this.connection.callStatus = 'ended';
    this.notifyCallStateChange();
    
    if (this.connection.onCallEnded) {
      this.connection.onCallEnded();
    }
    
    this.endCall();
  }
}