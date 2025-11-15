import { Question, Difficulty, Answer } from './questionnaire_structure';

export const THEMES = [
  "Intelligence Émotionnelle",
  "Style de Communication",
  "Valeurs Personnelles",
  "Loisirs et Passions",
  "Scénarios Relationnels",
];

const questionsBank: { [theme: string]: { [difficulty in Difficulty]: Partial<Pick<Question, 'question' | 'answers'>>[] } } = {
  "Intelligence Émotionnelle": {
    [Difficulty.easy]: [
      {
        question: "Quand vous sentez-vous le plus énergisé(e) ?",
        answers: [
          { text: "En passant du temps avec d'autres", traits: ['Extraverti', 'Social'] },
          { text: "En ayant un moment tranquille seul(e)", traits: ['Introverti', 'Réfléchi'] },
          { text: "En réalisant une activité créative", traits: ['Créatif', 'Artiste'] },
          { text: "En étant dans la nature", traits: ['Aime la nature', 'Serein'] },
        ],
      },
      {
        question: "Comment réagissez-vous face à une critique inattendue ?",
        answers: [
          { text: "Je la prends personnellement", traits: ['Sensible', 'Réactif'] },
          { text: "J'essaie de comprendre le point de vue de l'autre", traits: ['Empathique', 'Ouvert d\'esprit'] },
          { text: "Je l'ignore et passe à autre chose", traits: ['Pragmatique', 'Indépendant'] },
          { text: "Je demande plus de détails pour clarifier", traits: ['Analytique', 'Logique'] },
        ],
      },
    ],
    [Difficulty.medium]: [
       {
        question: "Face à un échec, quelle est votre première réaction ?",
        answers: [
          { text: "Analyser ce qui n'a pas fonctionné", traits: ['Logique', 'Orienté solution'] },
          { text: "Me sentir découragé(e)", traits: ['Émotif', 'Vulnérable'] },
          { text: "Chercher le soutien de mes amis", traits: ['Social', 'Collaboratif'] },
          { text: "Voir cela comme une opportunité d'apprendre", traits: ['Optimiste', 'Résilient'] },
        ],
      },
    ],
    [Difficulty.hard]: [
      {
        question: "Vous devez annoncer une mauvaise nouvelle à un ami. Comment vous y prenez-vous ?",
        answers: [
          { text: "J\'y vais directement, sans détour", traits: ['Direct', 'Honnête'] },
          { text: "Je cherche le bon moment et le bon endroit", traits: ['Prévenant', 'Empathique'] },
          { text: "J\'adoucis les choses pour ne pas blesser", traits: ['Protecteur', 'Gentil'] },
          { text: "Je repousse le moment le plus possible", traits: ['Évitant le conflit', 'Prudent'] },
        ],
      },
    ],
  },
  "Style de Communication": {
      [Difficulty.easy]: [
        {
            question: "Lors d'un désaccord, vous avez tendance à :",
            answers: [
                { text: "Exprimer clairement votre point de vue", traits: ['Assertif', 'Communicatif'] },
                { text: "Écouter l'autre avant de répondre", traits: ['Patient', 'Bon auditeur'] },
                { text: "Chercher un compromis à tout prix", traits: ['Conciliant', 'Harmonieux'] },
                { text: "Vous retirer pour éviter le conflit", traits: ['Pacifique', 'Non-confrontationnel'] },
            ],
        },
      ],
      [Difficulty.medium]: [
        {
            question: "Pour vous, une conversation profonde signifie :",
            answers: [
                { text: "Parler de ses rêves et aspirations", traits: ['Rêveur', 'Idéaliste'] },
                { text: "Partager ses vulnérabilités", traits: ['Authentique', 'Introspectif'] },
                { text: "Débattre d\'idées complexes", traits: ['Intellectuel', 'Analytique'] },
                { text: "Rire ensemble de tout et de rien", traits: ['Joyeux', 'Simple'] },
            ],
        },
      ],
      [Difficulty.hard]: [
        {
            question: "Votre partenaire est en colère, mais ne veut pas dire pourquoi. Que faites-vous ?",
            answers: [
                { text: "J'insiste pour qu'il/elle m'explique", traits: ['Persévérant', 'Direct'] },
                { text: "Je lui laisse de l'espace et attends", traits: ['Patient', 'Respectueux'] },
                { text: "J'essaie de deviner ce qui ne va pas", traits: ['Intuitif', 'Proactif'] },
                { text: "Je propose une activité pour détendre l'atmosphère", traits: ['Léger', 'Positif'] },
            ],
        },
      ]
  }
};

export function generateQuestions(
  theme: string,
  difficulty: Difficulty,
  numberOfQuestions: number
): Question[] {
  const source = questionsBank[theme]?.[difficulty];

  if (!source) {
    return [];
  }

  const shuffled = [...source].sort(() => 0.5 - Math.random());
  const selectedQuestions: Question[] = [];

  for (let i = 0; i < Math.min(numberOfQuestions, shuffled.length); i++) {
    const q = shuffled[i];
    if (q.question && q.answers) {
       selectedQuestions.push({
        question: q.question,
        answers: q.answers as Answer[],
        difficulty,
        theme,
      });
    }
  }

  return selectedQuestions;
}
