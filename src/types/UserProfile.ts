export interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
    preferences?: {
        language?: string;
        theme?: string;
        notifications?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
} 