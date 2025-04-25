# Application Specifications

## Fonctionnalités

1.  **Rencontres Hybrides (Virtuel & Réel) :**
    *   Rencontres géolocalisées dans des lieux publics (cafés partenaires, événements)
    *   Rencontres virtuelles classiques via l'application
    *   Speed Dating digital : sessions rapides avec matching + feedback immédiat
2.  **Reconnaissance Faciale + Matching IA :**
    *   Analyse morphologique faciale (avec consentement)
    *   Croisement avec des traits psychologiques pour des affinités "naturelles"
    *   Possibilité de jouer sur les similarités ET les opposés
3. **Coach Conversationnel IA :**
    *   Suggère des phrases d'accroche en fonction des caractéristiques du partenaire.
    *   Analyse en temps réel des messages écrits :
        *   Ambiguité ? Ton trop agressif ? Maladresse ?
        *   Propositions de reformulations plus douces ou claires.
    *   "Tag d'intention" optionnel : tendre, humour, séduction, amical...
    *   Alerte sur les malentendus : mots à double sens ou émotions contradictoires.
    *   Facilitateur d'échange : reformule, relance ou clarifie si besoin.
4.  **Dictionnaire IA des Mots à Risque :**
    *   Base de données dynamique qui repère les expressions ambiguës ou sensibles.
    *   Contenu : "Faire un câlin", "J'ai envie de te voir", "T'es sexy", "Envie de te connaître"...
    *   Interprétations possibles + suggestions de clarification
    *   Mis à jour par : IA auto-apprenante + signalements utilisateurs
5.  **Échanges à l'Aveugle :**
    *   Une manière innovante de se rencontrer sans photos, profils, ni informations.
    *   L'IA propose un profil compatible en se basant sur :
        *   Matching facial et émotionnel
        *   Points communs et polarités opposées
    *   L'utilisateur ne voit que :
        *   Un pourcentage de compatibilité
        *   Une bulle de discussion neutre
    *   Les informations se dévoilent progressivement au fil de l'engagement mutuel.
6.  **Jeux Simples :**
    *   Possibilité de lancer un jeu simple directement dans la conversation.
    *   Inspiré de "Tim's Up" : des mini-jeux pour mieux se connaître.
    *   Des jeux de type "questions générales", "culture générale" ou autres.
    *   Système de points et de classements optionnel.



## Nouvelles fonctionnalités et améliorations

* **AI Conversation Coach:** Offering real-time feedback and suggestions on your messages.
* **Blind Exchange Mode:** Innovative meeting mode without photos, profiles, or information.
* **Style Bonus :** Suggestions personnalisées du coach IA en fonction de votre niveau de confort et de votre style.
* **Système de récompenses :** Badges, accès à des modes cachés, speed dating premium, etc.
* **Dictionnaire IA des Mots à Risque :** Base de données dynamique qui repère les expressions ambiguës ou sensibles.
* **Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer des fonctionnalités d'appel.
* **Améliorations des Jeux:** Ajouter plus de jeux, de la variété, des scores persistants et des classements.
* **Feedback Post-Speed Dating:** Permettre aux utilisateurs de donner un feedback après les sessions.

### Implemented Features:

*   **Correspondance par Analyse Faciale :** Les utilisateurs peuvent télécharger leurs photos de profil. L'application analyse les traits du visage pour trouver des sosies potentiels et affiche une liste de profils avec des traits similaires, classés par similitude.
*   **Mode d'Échange à l'Aveugle :** Les utilisateurs sont mis en relation avec d'autres personnes en fonction de leurs intérêts ou critères communs, sans voir leurs profils au départ. Facilite l'interaction et la révélation du profil après une période ou une action spécifique.
*   **Coach Conversationnel IA :** Fournit des conseils et des suggestions basés sur l'IA pour améliorer les conversations des utilisateurs et offre un retour d'information en temps réel sur la qualité et l'engagement de la conversation.
*   **Dictionnaire IA des Mots à Risque :** Base de données dynamique qui repère les expressions ambiguës ou sensibles, fournit des interprétations et des suggestions de clarification.
*   **Game:** L'utilisateur peut jouer à un jeu de culture générale avec un partenaire aléatoire ou un match, inspiré de Tim's Up.
*   **Speed Dating:** Users can select interests and schedule speed dating sessions (mock implementation).
*   **Rencontre Géolocalisée :** Permet aux utilisateurs de voir leur position et des lieux de rencontre / utilisateurs suggérés à proximité (utilisation de l'API de géolocalisation du navigateur, données simulées pour les lieux/utilisateurs).
*   **Gestion Améliorée des Profils :** Les utilisateurs peuvent créer et modifier des profils détaillés avec nom, bio, intérêts, photo de profil (upload simulé) et paramètres de confidentialité.
*   **Outils de Communication Intégrés à l'Application (Chat):** Fonctionnalité de messagerie directe de base entre utilisateurs (données simulées).

### Features to Implement:

*   **Intégration Backend Réelle:** Remplacer les données et services simulés par des appels API réels (Base de données utilisateurs, stockage d'images, API de géolocalisation tierce, logique de matchmaking réelle, persistance du chat).
*   **Authentification Utilisateur:** Implémenter un système de connexion/inscription sécurisé.
*   **Système de récompenses :** Badges, accès à des modes cachés, speed dating premium, etc.
*   **Style Bonus :** Suggestions personnalisées du coach IA en fonction de votre niveau de confort et de votre style.
*   **Modération de Contenu:** Ajouter une modération pour le texte et les médias.
*   **Notifications:** Mettre en place des notifications push pour les nouveaux messages, matchs, etc.
*   **Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer des fonctionnalités d'appel.
*   **Améliorations des Jeux:** Ajouter plus de jeux, de la variété, des scores persistants et des classements.
*   **Feedback Post-Speed Dating:** Permettre aux utilisateurs de donner un feedback après les sessions.


