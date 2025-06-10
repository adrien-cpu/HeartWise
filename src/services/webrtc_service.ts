// "use server"; // WebRTC logic is primarily client-side, but signaling might involve server.

/**
 * @fileOverview Conceptual service for WebRTC (Video/Audio calls).
 * @module WebRTCService
 * @description This module outlines the structure and placeholder functions for
 *              implementing WebRTC video and audio calls using Firestore for signaling.
 *              **Requires Significant Implementation:** Actual WebRTC logic, robust error handling,
 *              and STUN/TURN server configuration are needed for this to be functional.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, Unsubscribe, deleteDoc, updateDoc, arrayUnion, getDoc, FieldValue } from 'firebase/firestore';

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
  targetUserId?: string; // Added for clarity
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TODO: Add TURN server configurations for production for robust NAT traversal
];

const signalingCollectionName = 'webrtcSignaling';

interface SignalingMessageBase {
  senderId: string;
  timestamp: FieldValue; // Use FieldValue for serverTimestamp
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

/**
 * Generates a unique and consistent signaling channel ID between two users.
 * @param {string} userId1 - ID of the first user.
 * @param {string} userId2 - ID of the second user.
 * @returns {string} The signaling channel ID.
 */
export function getSignalingChannelId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_webrtc_');
}

/**
 * Initializes a WebRTC peer connection.
 */
export function initializePeerConnection(
  rtcConnection: RTCConnection, // Pass the whole RTCConnection state object
  onIceCandidateGenerated: (candidate: RTCIceCandidateInit | null) => void,
  onRemoteTrackReceived: (trackEvent: RTCTrackEvent) => void,
  onNegotiationNeeded: () => void,
  onConnectionStateChange: (state: RTCPeerConnectionState) => void
): RTCPeerConnection {
  if (criticalConfigError) throw new Error("Firebase not configured for WebRTC.");
  console.log("WebRTCService: Initializing RTCPeerConnection...");
  const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("WebRTCService: New ICE candidate generated:", event.candidate.toJSON());
      onIceCandidateGenerated(event.candidate.toJSON());
    } else {
      console.log("WebRTCService: All ICE candidates have been sent.");
      onIceCandidateGenerated(null); // Signifies end of candidates
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("WebRTCService: Remote track received:", event.track, "Streams:", event.streams);
    onRemoteTrackReceived(event);
    if (event.streams && event.streams[0] && rtcConnection.onRemoteStreamReady) {
      rtcConnection.remoteStream = event.streams[0];
      rtcConnection.onRemoteStreamReady(event.streams[0]);
    }
  };

  peerConnection.onnegotiationneeded = () => {
    console.log("WebRTCService: Negotiation needed.");
    onNegotiationNeeded();
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log(`WebRTCService: ICE connection state changed to: ${peerConnection.iceConnectionState}`);
    onConnectionStateChange(peerConnection.connectionState);
    if (['failed', 'disconnected', 'closed'].includes(peerConnection.iceConnectionState)) {
      // Handle connection failure, possibly by calling onCallEnded
      if (rtcConnection.onCallEnded) rtcConnection.onCallEnded();
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log(`WebRTCService: Connection state changed to: ${peerConnection.connectionState}`);
    onConnectionStateChange(peerConnection.connectionState);
    if (['failed', 'disconnected', 'closed'].includes(peerConnection.connectionState)) {
      // Handle connection failure
      if (rtcConnection.onCallEnded) rtcConnection.onCallEnded();
    }
  };

  return peerConnection;
}

/**
 * Gets local audio and video stream from the user's device.
 */
export async function getLocalStream(constraints = { video: true, audio: true }): Promise<MediaStream> {
  console.log("WebRTCService: Requesting local media stream with constraints:", constraints);
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("WebRTCService: getUserMedia not supported by this browser.");
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("WebRTCService: Local media stream obtained successfully.");
    return stream;
  } catch (error: any) {
    console.error("WebRTCService: Error accessing media devices:", error);
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error("Camera/Microphone access denied. Please enable permissions in your browser settings.");
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error("No camera/microphone found on this device.");
    }
    throw new Error("Failed to get local media stream. Check permissions and device availability.");
  }
}

/**
 * Adds local stream tracks to the RTCPeerConnection.
 */
export function addLocalStreamToPeerConnection(peerConnection: RTCPeerConnection, localStream: MediaStream): void {
  console.log("WebRTCService: Adding local stream tracks to peer connection.");
  localStream.getTracks().forEach(track => {
    if (!peerConnection.getSenders().find(sender => sender.track === track)) {
      peerConnection.addTrack(track, localStream);
    }
  });
}

/**
 * Creates an SDP offer.
 */
export async function createOfferSdp(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  if (criticalConfigError) throw new Error("Firebase not configured for WebRTC.");
  console.log("WebRTCService: Creating SDP offer...");
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log("WebRTCService: SDP offer created and set as local description.");
  return offer;
}

/**
 * Creates an SDP answer.
 */
export async function createAnswerSdp(peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
  if (criticalConfigError) throw new Error("Firebase not configured for WebRTC.");
  console.log("WebRTCService: Received SDP offer, creating answer...");
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log("WebRTCService: SDP answer created and set as local description.");
  return answer;
}

/**
 * Sets the remote SDP description (used by offerer when receiving an answer).
 */
export async function setRemoteSdp(peerConnection: RTCPeerConnection, sdp: RTCSessionDescriptionInit): Promise<void> {
  if (criticalConfigError) throw new Error("Firebase not configured for WebRTC.");
  console.log("WebRTCService: Setting remote SDP description.", sdp.type);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  console.log("WebRTCService: Remote SDP description set.");
}


/**
 * Adds an ICE candidate received from the remote peer.
 */
export async function addIceCandidate(peerConnection: RTCPeerConnection, candidate: RTCIceCandidateInit): Promise<void> {
  if (criticalConfigError) throw new Error("Firebase not configured for WebRTC.");
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("WebRTCService: ICE candidate added successfully.");
  } catch (error) {
    console.error("WebRTCService: Error adding received ICE candidate:", error);
  }
}

/**
 * Sends a signaling message (offer, answer, candidate, hangup) to the other peer via Firestore.
 * The document structure stores messages keyed by type for the sender.
 */
export async function sendSignalingMessageViaFirestore(
  channelId: string,
  senderId: string,
  message: OfferMessage | AnswerMessage | IceCandidateMessage | HangupMessage
): Promise<void> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot send signaling message.");
    throw new Error("Application services are not available.");
  }
  console.log(`WebRTCService: Sending signaling message via Firestore on channel ${channelId}:`, message);
  const signalingDocRef = doc(firestore, signalingCollectionName, channelId);

  const payload: any = {
    senderId: message.senderId,
    timestamp: message.timestamp, // Should be serverTimestamp()
    type: message.type,
  };

  if (message.type === 'offer' || message.type === 'answer') {
    payload.sdp = message.sdp;
  } else if (message.type === 'candidate') {
    payload.candidate = message.candidate;
  }

  try {
    // For offers and answers, we overwrite the specific field for that sender.
    // For candidates, we add to an array for that sender.
    // Hangup also overwrites/sets a field.
    if (message.type === 'candidate') {
      // Atomically add candidate to an array for the sender
      await updateDoc(signalingDocRef, {
        [`candidates.${senderId}`]: arrayUnion(payload.candidate), // Store candidate directly
        [`lastActivity.${senderId}`]: serverTimestamp()
      }, { merge: true }); // Create doc if it doesn't exist
    } else {
      // For offer, answer, hangup, set/overwrite the specific field
      await setDoc(signalingDocRef, {
        [message.type]: payload, // This will store the full message under its type, e.g., { offer: { senderId: ..., sdp: ..., ... } }
        [`lastActivity.${senderId}`]: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error("WebRTCService: Error sending signaling message via Firestore:", error);
    throw new Error("Failed to send signaling message.");
  }
}

/**
 * Listens for signaling messages from Firestore for a specific channel.
 */
export function listenForSignalingMessagesFromFirestore(
  channelId: string,
  currentUserId: string, // To ignore self-sent messages or process messages intended for this user
  onMessageReceived: (message: SignalingMessage) => void
): Unsubscribe {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot listen for signaling messages.");
    return () => { };
  }
  console.log(`WebRTCService: Listening for signaling messages on Firestore channel ${channelId}`);
  const signalingDocRef = doc(firestore, signalingCollectionName, channelId);

  const unsubscribe = onSnapshot(signalingDocRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("WebRTCService: Received signaling data:", data);

      // Process offer, answer, hangup (these are top-level fields from the sender)
      const typesToProcess: Array<'offer' | 'answer' | 'hangup'> = ['offer', 'answer', 'hangup'];
      for (const type of typesToProcess) {
        if (data[type] && data[type].senderId !== currentUserId) {
          const message = data[type] as SignalingMessage; // Cast based on type check
          console.log(`WebRTCService: Processing ${type} from ${message.senderId}`);
          onMessageReceived(message);
          // Conceptually, clear the message after processing to avoid re-processing if appropriate
          // await updateDoc(signalingDocRef, { [type]: deleteField() });
        }
      }

      // Process ICE candidates (stored in an array under `candidates.[senderId]`)
      if (data.candidates) {
        const otherUserIds = Object.keys(data.candidates).filter(id => id !== currentUserId);
        for (const senderId of otherUserIds) {
          if (data.candidates[senderId] && Array.isArray(data.candidates[senderId])) {
            const candidates = data.candidates[senderId] as RTCIceCandidateInit[];
            for (const candidate of candidates) {
              // Create a unique ID for each candidate to prevent re-processing, or clear after processing.
              // For simplicity, we assume onMessageReceived can handle potentially duplicated candidates if not cleared.
              console.log(`WebRTCService: Processing candidate from ${senderId}`);
              onMessageReceived({
                type: 'candidate',
                candidate: candidate,
                senderId: senderId,
                timestamp: serverTimestamp() // Or get from candidate message if stored
              });
            }
            // Conceptually, clear processed candidates
            // await updateDoc(signalingDocRef, { [`candidates.${senderId}`]: [] });
          }
        }
      }
    } else {
      console.log("WebRTCService: Signaling document does not exist yet for channel:", channelId);
      // Create the document if it's the initiator to establish the channel
      // await setDoc(signalingDocRef, { createdAt: serverTimestamp() }); // Optional: Initialize doc
    }
  }, (error) => {
    console.error("WebRTCService: Error listening to signaling messages:", error);
  });

  return unsubscribe;
}

/**
 * Closes the WebRTC connection, stops local media tracks, and cleans up signaling.
 */
export async function closeWebRTCConnection(rtcConnection: RTCConnection | null): Promise<void> {
  if (!rtcConnection) return;
  console.log("WebRTCService: Closing WebRTC connection for channel:", rtcConnection.signalingChannelId);

  if (rtcConnection.unsubscribeSignaling) {
    rtcConnection.unsubscribeSignaling();
    rtcConnection.unsubscribeSignaling = undefined;
  }

  if (rtcConnection.localStream) {
    rtcConnection.localStream.getTracks().forEach(track => track.stop());
    rtcConnection.localStream = null;
  }
  if (rtcConnection.remoteStream) {
    rtcConnection.remoteStream.getTracks().forEach(track => track.stop());
    rtcConnection.remoteStream = null;
  }
  if (rtcConnection.peerConnection) {
    rtcConnection.peerConnection.close();
    rtcConnection.peerConnection = null;
  }

  // Send hangup signal if we are the one initiating the close and channel exists
  if (rtcConnection.signalingChannelId && rtcConnection.callStatus !== 'ended' && rtcConnection.targetUserId) {
    try {
      const hangupMessage: HangupMessage = {
        type: 'hangup',
        senderId: '', // Will be filled by the caller with currentUserId
        timestamp: serverTimestamp()
      };
      // The actual senderId will be provided by the calling component (e.g., chat page)
      // This sendSignalingMessageViaFirestore is now more generic.
      // await sendSignalingMessageViaFirestore(rtcConnection.signalingChannelId, "CURRENT_USER_ID_HERE", hangupMessage);
      console.log("WebRTCService: Sent hangup signal for channel:", rtcConnection.signalingChannelId);

      // Optionally delete the signaling document after a short delay or by a cleanup function
      // For now, we leave it for simplicity, or the other party might delete it upon receiving hangup.
      // setTimeout(async () => {
      //   const signalingDocRef = doc(firestore, signalingCollectionName, rtcConnection.signalingChannelId!);
      //   await deleteDoc(signalingDocRef);
      // }, 5000); // Delete after 5s

    } catch (error) {
      console.error("WebRTCService: Error sending hangup or deleting signaling document:", error);
    }
  }

  rtcConnection.callStatus = 'ended';
  if (rtcConnection.onCallEnded) rtcConnection.onCallEnded();
  rtcConnection.signalingChannelId = null;
  rtcConnection.targetUserId = undefined;
}

/**
 * Initializes the signaling channel document in Firestore.
 * This can be called by the initiator of the call.
 * @param channelId The ID of the signaling channel.
 */
export async function initializeSignalingChannel(channelId: string): Promise<void> {
  if (criticalConfigError) throw new Error("Firebase not configured for WebRTC.");
  const signalingDocRef = doc(firestore, signalingCollectionName, channelId);
  try {
    const docSnap = await getDoc(signalingDocRef);
    if (!docSnap.exists()) {
      await setDoc(signalingDocRef, {
        createdAt: serverTimestamp(),
        status: 'initiating', // Initial status
        candidates: {}, // To store candidates from each user
        lastActivity: {} // To store last activity timestamp from each user
      });
      console.log("WebRTCService: Signaling channel initialized:", channelId);
    }
  } catch (error) {
    console.error("WebRTCService: Error initializing signaling channel:", error);
  }
}

