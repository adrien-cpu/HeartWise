# Guide de décision pour la refactorisation de fichiers

Ce guide présente des critères objectifs et subjectifs pour déterminer quand un fichier devrait être refactorisé, ainsi que des recommandations pour aborder cette refactorisation.

## 1. Indicateurs quantitatifs

Ces métriques fournissent des signaux d'alerte clairs et faciles à mesurer:

| Métrique | Seuil d'alerte | Seuil critique | Notes |
|----------|----------------|----------------|-------|
| **Longueur du fichier** | > 300 lignes | > 500 lignes | Hors commentaires et lignes vides |
| **Longueur des fonctions/méthodes** | > 30 lignes | > 50 lignes | Envisager d'extraire des méthodes |
| **Nombre de méthodes par classe** | > 10 | > 20 | Indication d'une classe qui fait trop de choses |
| **Profondeur d'imbrication** | > 3 niveaux | > 4 niveaux | Structures conditionnelles ou boucles imbriquées |
| **Nombre de paramètres** | > 4 | > 6 | Par fonction/méthode |
| **Nombre de dépendances** | > 10 | > 15 | Imports/modules requis |

## 2. Indicateurs de complexité et maintenabilité

Ces métriques requièrent des outils d'analyse statique mais offrent une vision plus approfondie:

| Métrique | Seuil d'alerte | Seuil critique | Notes |
|----------|----------------|----------------|-------|
| **Complexité cyclomatique** | > 10 par fonction | > 15 par fonction | Mesure les chemins d'exécution possibles |
| **Dette technique** | Score moyen | Score élevé | Mesurée par SonarQube ou outils similaires |
| **Indice de maintenabilité** | < 65 | < 50 | Sur une échelle de 0-100 |
| **Couplage afférent** | > 10 | > 20 | Nombre de modules dépendant de ce fichier |
| **Couplage efférent** | > 15 | > 25 | Nombre de modules dont ce fichier dépend |
| **Duplication de code** | > 10% | > 20% | Pourcentage de code dupliqué dans le fichier |

## 3. Indicateurs de conception et d'architecture

Ces signaux d'alerte sont plus qualitatifs but tout aussi importants:

### Violations de principes SOLID
- **Responsabilité unique**: Le fichier gère plusieurs préoccupations distinctes
- **Ouvert/fermé**: Modifications fréquentes pour ajouter des fonctionnalités
- **Substitution de Liskov**: Sous-classes qui ne peuvent pas remplacer leurs classes de base
- **Ségrégation d'interface**: Interfaces trop larges ou monolithiques
- **Inversion de dépendance**: Dépendances vers des modules concrets plutôt qu'abstraits

### Autres indicateurs architecturaux
- Fichier difficile à tester unitairement
- Violations des frontières architecturales
- Présence de "code sentinelle" (flags et variables de contrôle)
- Utilisation excessive de valeurs globales ou singletons
- Couplage temporel (dépendances d'ordre d'exécution)

## 4. Indicateurs d'utilisation et d'évolution

Ces facteurs sont basés sur l'utilisation réelle et l'historique du fichier:

| Indicateur | Description | Notes |
|------------|-------------|-------|
| **Fréquence de modification** | Changé plus de 2 fois par mois | Indique une instabilité ou une mauvaise conception |
| **Fréquence des bugs** | > 2 bugs par trimestre | Signale un code fragile |
| **Temps de compréhension** | > 15 minutes pour un développeur expérimenté | Mesure subjective mais importante |
| **Impact sur les performances** | Impliqué dans > 10% des problèmes de performance | Identifié via le profilage |
| **Expansion constante** | Croissance de > 20% en 3 mois | Fichier qui grossit régulièrement |
| **Conflits de fusion** | > 3 conflits par mois | Indique un point de contention |

## 5. Contexte à considérer

Avant de décider de refactoriser, prenez en compte:

- **Criticité du code**: Le risque associé à la modification est-il acceptable?
- **Ressources disponibles**: Avez-vous le temps et l'expertise nécessaires?
- **Planification**: Y a-t-il une fenêtre appropriée pour cette refactorisation?
- **Valeur métier**: Quelle est la durée de vie prévue de cette partie du code?
- **Tests**: Avez-vous une couverture de tests suffisante pour refactoriser en sécurité?
- **Documentation**: Est-elle disponible pour comprendre l'intention originale?

## 6. Processus de décision

Suivez ce processus pour décider objectivement:

1. **Collecte des métriques**: Utilisez des outils automatisés pour mesurer les indicateurs quantitatifs
2. **Évaluation qualitative**: Examinez le code à la recherche des indicateurs de conception
3. **Matrice d'impact/effort**:
   - Impact élevé + Effort faible = **Refactorisation prioritaire**
   - Impact élevé + Effort élevé = **Planifier avec soin**
   - Impact faible + Effort faible = **Refactoriser opportunément**
   - Impact faible + Effort élevé = **Reportez ou ignorez**
4. **Planification**: Définissez clairement l'objectif et les limites de la refactorisation
5. **Validation**: Consultez les parties prenantes sur les risques et avantages

## 7. Comment aborder la refactorisation

Une fois la décision prise:

1. **Isoler le périmètre**: Définissez clairement ce qui est inclus et exclu
2. **Stratégies progressives**:
   - Refactorisation "étranglement" (strangler pattern) pour les systèmes critiques
   - Refactorisation "Boy Scout" (laisser le code plus propre qu'à l'arrivée) pour les améliorations progressives
   - Refactorisation "bulles" pour isoler et remplacer des portions spécifiques
3. **Tests first**: Assurez-vous d'avoir des tests avant de commencer
4. **Commits atomiques**: Faites de petits changements avec des messages clairs
5. **Revue incrémentale**: Obtenez des retours au fur et à mesure

## 8. Indicateurs spécifiques par type de fichier

### Fichiers de composants UI
- Plus de 3 responsabilités distinctes (rendu, logique d'affaires, état, etc.)
- JSX/HTML imbriqué à plus de 4 niveaux
- Logique de rendu conditionnel complexe

### Fichiers de services/API
- Mélange de logique métier et de gestion d'API
- Manque d'abstraction sur les sources de données
- Gestion d'erreur incohérente ou insuffisante

### Fichiers de modèles/schémas
- Entités devenues trop larges (modèle "god object")
- Relations complexes entre entités définies au même endroit
- Validation et logique métier mélangées avec la définition

### Utilitaires/Helpers
- Collection de fonctions non reliées (fichier "fourre-tout")
- Fonctions qui partagent peu de contexte ou de dépendances
- Croissance sans limite claire

## Conclusion

La refactorisation est une discipline qui allie mesures objectives et jugement pragmatique. Utilisez ce guide comme point de départ, mais adaptez-le à la culture et aux contraintes spécifiques de votre équipe et de votre projet.

N'oubliez pas: le meilleur moment pour refactoriser est souvent lorsque vous travaillez déjà sur le code concerné, selon le principe "Boy Scout" - laissez le code un peu plus propre que vous ne l'avez trouvé.

---

**Instructions pour l'IA:**

Ce guide doit être consulté à chaque modification et/ou création de fichier. Portez une attention particulière aux points suivants lors de vos actions:

*   Accessibilité
*   Design thinking
*   Bonnes pratiques de développement
*   Refactorisation si le fichier dépasse les 300 lignes et/ou s'il gère trop de choses en même temps.
*   Avant de modifier un fichier, demandez-vous si celui-ci doit être refactorisé en premier lieu, en vous basant sur ce guide.
*   Ces principes doivent être appliqués tout au long du projet.
* Lancer npm run lint && npm run typecheck && npm run build à chaques modifications ou créations de fichiers.
