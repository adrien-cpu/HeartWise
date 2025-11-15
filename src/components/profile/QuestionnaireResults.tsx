import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { UserProfile } from "@/types/UserProfile";
import { personalityTraits } from "@/services/traits_data";
import { useMemo } from "react";

interface QuestionnaireResultsProps {
  userProfile: UserProfile;
}

// Calculate scores based on user answers
const calculateTraitScores = (userProfile: UserProfile) => {
  const scores: { [key: string]: number } = {};
  personalityTraits.forEach(trait => scores[trait.name] = 0);
  let answeredQuestions = 0;

  if (userProfile.questionnaireAnswers) {
    Object.values(userProfile.questionnaireAnswers).forEach(answer => {
      if(answer.traits) {
        answeredQuestions++;
        answer.traits.forEach(traitName => {
          if (scores.hasOwnProperty(traitName)) {
            scores[traitName] += 1;
          }
        });
      }
    });
  }

  // Normalize scores to a 0-100 scale. Assuming each trait could be picked a max of 5 times for this example.
  const maxScorePerTrait = Math.max(1, Math.ceil(answeredQuestions / personalityTraits.length)); 
  const chartData = personalityTraits.map(trait => ({
    trait: trait.name,
    score: (scores[trait.name] / maxScorePerTrait) * 100,
  }));

  return chartData;
};

export const QuestionnaireResults = ({ userProfile }: QuestionnaireResultsProps) => {
  const data = useMemo(() => calculateTraitScores(userProfile), [userProfile]);
  const hasData = userProfile.questionnaireAnswers && Object.keys(userProfile.questionnaireAnswers).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats du Questionnaire</CardTitle>
        <CardDescription>
          Visualisation de vos traits de personnalité principaux basés sur vos réponses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="trait" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name={userProfile.name || 'Vous'} dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Vous n'avez pas encore répondu au questionnaire.</p>
            <p className="text-sm text-muted-foreground">Complétez-le pour voir votre profil de personnalité ici.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
