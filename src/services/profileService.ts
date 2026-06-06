import { UserProfile } from '../types/UserProfile';

class ProfileService {
    async getUserProfile(userId: string): Promise<UserProfile> {
        // TODO: Implémenter l'appel API réel
        return {
            id: userId,
            username: 'user',
            email: 'user@example.com',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
        // TODO: Implémenter l'appel API réel
        return {
            id: userId,
            username: profile.username || 'user',
            email: profile.email || 'user@example.com',
            ...profile,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}

export const profileService = new ProfileService(); 