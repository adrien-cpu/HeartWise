import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface Location {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
    accuracy?: number;
}

class LocationService {
    private readonly locationsCollection = 'locations';

    async updateUserLocation(userId: string, location: Location): Promise<void> {
        try {
            const locationRef = doc(db, this.locationsCollection, userId);
            await setDoc(locationRef, {
                ...location,
                lastUpdated: new Date(),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la position:', error);
            throw error;
        }
    }

    async getUserLocation(userId: string): Promise<Location | null> {
        try {
            const locationRef = doc(db, this.locationsCollection, userId);
            const locationDoc = await getDoc(locationRef);

            if (locationDoc.exists()) {
                const data = locationDoc.data();
                return {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    lastUpdated: data.lastUpdated.toDate(),
                    accuracy: data.accuracy,
                };
            }

            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération de la position:', error);
            throw error;
        }
    }

    async getNearbyUsers(userId: string, radius: number): Promise<string[]> {
        try {
            const userLocation = await this.getUserLocation(userId);
            if (!userLocation) return [];

            // TODO: Implémenter la logique de recherche des utilisateurs à proximité
            // Cette fonctionnalité nécessitera une indexation géospatiale dans Firestore
            return [];
        } catch (error) {
            console.error('Erreur lors de la recherche des utilisateurs à proximité:', error);
            throw error;
        }
    }
}

export const locationService = new LocationService(); 