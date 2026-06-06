export class VideoCallService {
    async startCall(conversationId: string): Promise<void> {
        // Implémentation à venir
        console.log('Starting call for conversation:', conversationId);
    }

    async endCall(conversationId: string): Promise<void> {
        // Implémentation à venir
        console.log('Ending call for conversation:', conversationId);
    }

    async acceptCall(conversationId: string): Promise<void> {
        // Implémentation à venir
        console.log('Accepting call for conversation:', conversationId);
    }

    async rejectCall(conversationId: string): Promise<void> {
        // Implémentation à venir
        console.log('Rejecting call for conversation:', conversationId);
    }
}

export const videoCallService = new VideoCallService(); 