import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface Booking {
    id: string;
    placeId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BookingRequest {
    placeId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    participants: string[];
}

class BookingService {
    private readonly BOOKINGS_COLLECTION = 'bookings';

    async createBooking(request: BookingRequest): Promise<Booking> {
        try {
            const bookingData = {
                ...request,
                status: 'pending',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.BOOKINGS_COLLECTION), bookingData);

            return {
                id: docRef.id,
                ...bookingData,
                createdAt: bookingData.createdAt.toDate(),
                updatedAt: bookingData.updatedAt.toDate(),
            };
        } catch (error) {
            console.error('Erreur lors de la création de la réservation:', error);
            throw new Error('Impossible de créer la réservation');
        }
    }

    async getBooking(bookingId: string): Promise<Booking | null> {
        try {
            const docRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                startTime: data.startTime.toDate(),
                endTime: data.endTime.toDate(),
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
            } as Booking;
        } catch (error) {
            console.error('Erreur lors de la récupération de la réservation:', error);
            throw new Error('Impossible de récupérer la réservation');
        }
    }

    async getUserBookings(userId: string): Promise<Booking[]> {
        try {
            const q = query(
                collection(db, this.BOOKINGS_COLLECTION),
                where('participants', 'array-contains', userId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startTime: doc.data().startTime.toDate(),
                endTime: doc.data().endTime.toDate(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            })) as Booking[];
        } catch (error) {
            console.error('Erreur lors de la récupération des réservations:', error);
            throw new Error('Impossible de récupérer les réservations');
        }
    }

    async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
        try {
            const docRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
            await updateDoc(docRef, {
                status,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            throw new Error('Impossible de mettre à jour le statut de la réservation');
        }
    }

    async checkAvailability(placeId: string, startTime: Date, endTime: Date): Promise<boolean> {
        try {
            const q = query(
                collection(db, this.BOOKINGS_COLLECTION),
                where('placeId', '==', placeId),
                where('status', '==', 'confirmed')
            );

            const querySnapshot = await getDocs(q);
            const bookings = querySnapshot.docs.map(doc => ({
                startTime: doc.data().startTime.toDate(),
                endTime: doc.data().endTime.toDate(),
            }));

            // Vérifier les chevauchements
            return !bookings.some(booking =>
                (startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime) ||
                (startTime <= booking.startTime && endTime >= booking.endTime)
            );
        } catch (error) {
            console.error('Erreur lors de la vérification de la disponibilité:', error);
            throw new Error('Impossible de vérifier la disponibilité');
        }
    }
}

export const bookingService = new BookingService(); 