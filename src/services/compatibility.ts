import { UserProfile } from "@/types/UserProfile";
import { personalityTraits, Trait } from "./traits_data";

// --- Trait Calculation Logic ---

const getUserTraitScores = (user: UserProfile): Map<string, number> => {
    const scores = new Map<string, number>();
    personalityTraits.forEach(trait => scores.set(trait.name, 0));

    if (!user.questionnaireAnswers) return scores;

    const answeredTraits: string[] = [];
    Object.values(user.questionnaireAnswers).forEach(answer => {
        if (answer.traits) {
            answeredTraits.push(...answer.traits);
        }
    });

    const traitCounts = answeredTraits.reduce((acc, trait) => {
        acc.set(trait, (acc.get(trait) || 0) + 1);
        return acc;
    }, new Map<string, number>());

    traitCounts.forEach((count, trait) => {
        // Normalize score to a 0-100 scale. Max possible count is number of questions.
        const maxCount = Object.keys(user.questionnaireAnswers!).length;
        const normalizedScore = (count / maxCount) * 100;
        scores.set(trait, normalizedScore);
    });

    return scores;
};

export const calculateTraitCompatibility = (user1: UserProfile, user2: UserProfile): number => {
    if (!user1.questionnaireAnswers || !user2.questionnaireAnswers) return 0;

    const scores1 = getUserTraitScores(user1);
    const scores2 = getUserTraitScores(user2);

    let totalDifference = 0;
    let traitCount = 0;

    scores1.forEach((score1, trait) => {
        const score2 = scores2.get(trait);
        if (score2 !== undefined) {
            totalDifference += Math.abs(score1 - score2);
            traitCount++;
        }
    });

    if (traitCount === 0) return 0;

    const averageDifference = totalDifference / traitCount;
    const compatibility = 100 - averageDifference;

    return Math.round(Math.max(0, compatibility));
};

// --- Compatibility Breakdown Logic ---

export interface CompatibilityBreakdown {
    overallScore: number;
    traitBreakdowns: TraitBreakdown[];
}

export interface TraitBreakdown {
    trait: Trait;
    user1Score: number;
    user2Score: number;
    compatibility: number;
    explanation: string;
}

export const getCompatibilityBreakdown = (user1: UserProfile, user2: UserProfile): CompatibilityBreakdown => {
    const overallScore = calculateTraitCompatibility(user1, user2);
    const scores1 = getUserTraitScores(user1);
    const scores2 = getUserTraitScores(user2);

    const traitBreakdowns: TraitBreakdown[] = personalityTraits.map(trait => {
        const user1Score = scores1.get(trait.name) || 0;
        const user2Score = scores2.get(trait.name) || 0;
        const difference = Math.abs(user1Score - user2Score);
        const compatibility = 100 - difference;
        
        let explanation = ``;
        if (compatibility > 80) {
            explanation = `Vous êtes très similaires sur ce point ! Vous partagez une vision et des réactions communes en ce qui concerne l'${trait.name.toLowerCase()}.`;
        } else if (compatibility > 60) {
            explanation = `Vous avez une bonne compatibilité ici. Il y a suffisamment de points communs pour une bonne entente, et assez de différences pour vous stimuler.`;
        } else if (compatibility > 40) {
            explanation = `Vos approches concernant l'${trait.name.toLowerCase()} diffèrent un peu. Cela pourrait être une source de découverte mutuelle.`;
        } else {
            explanation = `C'est un domaine où vous êtes assez différents. Comprendre le point de vue de l'autre sera la clé.`;
        }

        return { trait, user1Score, user2Score, compatibility, explanation };
    });

    return { overallScore, traitBreakdowns };
};

// --- Blind Exchange Description Logic ---

export const generateBlindExchangeDescription = (user1: UserProfile, user2: UserProfile): string => {
    const breakdown = getCompatibilityBreakdown(user1, user2);
    
    const topMatch = breakdown.traitBreakdowns.reduce((max, current) => current.compatibility > max.compatibility ? current : max);
    const lowestMatch = breakdown.traitBreakdowns.reduce((min, current) => current.compatibility < min.compatibility ? current : min);

    const intro = `Basé sur vos profils, vous et votre partenaire mystère semblez avoir une compatibilité intrigante de ${breakdown.overallScore}%. `;
    const highPoint = `Votre plus grand point commun réside dans votre approche de l'**${topMatch.trait.name}**. Attendez-vous à des conversations fluides et une compréhension mutuelle sur ce sujet. `;
    const interestingDifference = `Là où les choses deviennent intéressantes, c'est votre vision de l'**${lowestMatch.trait.name}**. C'est une opportunité parfaite pour apprendre l'un de l'autre et voir le monde sous un nouvel angle.`;

    return intro + highPoint + interestingDifference;
}; 
