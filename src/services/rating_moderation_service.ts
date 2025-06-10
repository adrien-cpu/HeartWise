import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface RatingReport {
    id: string;
    ratingId: string;
    reporterId: string;
    reason: string;
    details: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
}

export interface ModerationAction {
    id: string;
    ratingId: string;
    moderatorId: string;
    action: 'approve' | 'reject' | 'edit';
    reason: string;
    changes?: {
        rating?: number;
        comment?: string;
        tags?: string[];
    };
    createdAt: Date;
}

class RatingModerationService {
    private readonly REPORTS_COLLECTION = 'rating_reports';
    private readonly ACTIONS_COLLECTION = 'moderation_actions';

    async reportRating(report: Omit<RatingReport, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<RatingReport> {
        try {
            const reportData = {
                ...report,
                status: 'pending',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.REPORTS_COLLECTION), reportData);

            return {
                id: docRef.id,
                ...reportData,
                createdAt: reportData.createdAt.toDate(),
                updatedAt: reportData.updatedAt.toDate(),
            };
        } catch (error) {
            console.error('Erreur lors de la création du signalement:', error);
            throw new Error('Impossible de créer le signalement');
        }
    }

    async getPendingReports(): Promise<RatingReport[]> {
        try {
            const q = query(
                collection(db, this.REPORTS_COLLECTION),
                where('status', '==', 'pending')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            })) as RatingReport[];
        } catch (error) {
            console.error('Erreur lors de la récupération des signalements:', error);
            throw new Error('Impossible de récupérer les signalements');
        }
    }

    async takeModerationAction(action: Omit<ModerationAction, 'id' | 'createdAt'>): Promise<ModerationAction> {
        try {
            const actionData = {
                ...action,
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.ACTIONS_COLLECTION), actionData);

            // Mettre à jour le statut du signalement
            const reportQuery = query(
                collection(db, this.REPORTS_COLLECTION),
                where('ratingId', '==', action.ratingId)
            );
            const reportSnapshot = await getDocs(reportQuery);

            if (!reportSnapshot.empty) {
                const reportDoc = reportSnapshot.docs[0];
                await updateDoc(doc(db, this.REPORTS_COLLECTION, reportDoc.id), {
                    status: 'resolved',
                    updatedAt: Timestamp.now(),
                });
            }

            return {
                id: docRef.id,
                ...actionData,
                createdAt: actionData.createdAt.toDate(),
            };
        } catch (error) {
            console.error('Erreur lors de la prise de mesure:', error);
            throw new Error('Impossible de prendre une mesure de modération');
        }
    }

    async getModerationHistory(ratingId: string): Promise<ModerationAction[]> {
        try {
            const q = query(
                collection(db, this.ACTIONS_COLLECTION),
                where('ratingId', '==', ratingId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            })) as ModerationAction[];
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            throw new Error('Impossible de récupérer l\'historique de modération');
        }
    }

    async getReportStats(): Promise<{
        totalReports: number;
        pendingReports: number;
        resolvedReports: number;
        averageResolutionTime: number;
    }> {
        try {
            const reports = await this.getPendingReports();
            const totalReports = reports.length;
            const pendingReports = reports.filter(r => r.status === 'pending').length;
            const resolvedReports = reports.filter(r => r.status === 'resolved').length;

            // Calculer le temps moyen de résolution
            const resolvedReportTimes = reports
                .filter(r => r.status === 'resolved')
                .map(r => r.updatedAt.getTime() - r.createdAt.getTime());

            const averageResolutionTime = resolvedReportTimes.length > 0
                ? resolvedReportTimes.reduce((a, b) => a + b, 0) / resolvedReportTimes.length
                : 0;

            return {
                totalReports,
                pendingReports,
                resolvedReports,
                averageResolutionTime,
            };
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            throw new Error('Impossible de calculer les statistiques de modération');
        }
    }
}

export const ratingModerationService = new RatingModerationService(); 