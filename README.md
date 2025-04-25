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

## Nouvelles fonctionnalités et améliorations (Prévues)

*   **Style Bonus :** Suggestions personnalisées du coach IA en fonction de votre niveau de confort et de votre style.
*   **Système de récompenses :** Badges, accès à des modes cachés, speed dating premium, etc.
*   **Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer des fonctionnalités d'appel.
*   **Améliorations des Jeux:** Ajouter plus de jeux, de la variété, des scores persistants et des classements.
*   **Feedback Post-Speed Dating:** Permettre aux utilisateurs de donner un feedback après les sessions.
*   **Intégration Backend Réelle:** Remplacer les données et services simulés par des appels API réels (Base de données utilisateurs, stockage d'images, API de géolocalisation tierce, logique de matchmaking réelle, persistance du chat).
*   **Authentification Utilisateur:** Implémenter un système de connexion/inscription sécurisé.
*   **Modération de Contenu:** Ajouter une modération plus robuste pour le texte et les médias.
*   **Notifications:** Mettre en place des notifications push pour les nouveaux messages, matchs, etc.


### Implemented Features (Frontend Simulation):

*   **Correspondance par Analyse Faciale :** Les utilisateurs peuvent entrer des URL d'images. L'application simule l'analyse des traits du visage pour trouver des correspondances et affiche une liste de profils avec des traits similaires, classés par similitude (`/facial-analysis-matching`).
*   **Mode d'Échange à l'Aveugle :** Simule la mise en relation d'utilisateurs en fonction de leurs intérêts et traits faciaux/émotionnels, sans voir leurs profils initiaux (`/blind-exchange-mode`).
*   **Coach Conversationnel IA :** Fournit des conseils et suggestions basés sur l'IA (via Genkit) pour améliorer les conversations des utilisateurs en analysant l'historique et les profils (`/ai-conversation-coach`).
*   **Dictionnaire IA des Mots à Risque :** Analyse le texte fourni par l'utilisateur pour repérer les expressions ambiguës ou sensibles, fournit des interprétations et des suggestions de clarification (via Genkit) (`/risky-words-dictionary`).
*   **Jeu :** L'utilisateur peut jouer à un jeu de culture générale simple avec des questions/réponses prédéfinies. Permet de simuler le jeu avec un partenaire aléatoire ou un match (`/game`).
*   **Speed Dating :** Les utilisateurs peuvent sélectionner des intérêts et simuler la planification de sessions de speed dating. Affiche une liste simulée de sessions à venir (`/speed-dating`).
*   **Rencontre Géolocalisée :** Utilise l'API de géolocalisation du navigateur pour obtenir la position de l'utilisateur. Affiche la position et simule des lieux de rencontre et des utilisateurs à proximité (`/geolocation-meeting`).
*   **Gestion Améliorée des Profils :** Les utilisateurs peuvent créer et modifier (via une simulation) des profils détaillés avec nom, bio, intérêts, photo de profil (upload simulé localement) et paramètres de confidentialité (`/profile`).
*   **Outils de Communication Intégrés à l'Application (Chat):** Fonctionnalité de messagerie directe de base entre utilisateurs simulés avec une interface de chat (`/chat`).

### Features to Implement (Backend & Advanced):

*   **Intégration Backend Réelle:** Remplacer toutes les données et services simulés par des appels API réels (Base de données utilisateurs, stockage d'images cloud, API de géolocalisation tierce, logique de matchmaking réelle, persistance du chat via base de données, etc.).
*   **Authentification Utilisateur:** Implémenter un système de connexion/inscription sécurisé (e.g., Firebase Auth, NextAuth).
*   **Système de récompenses :** Concevoir et implémenter le système de badges, modes cachés, accès premium (logique backend + UI).
*   **Style Bonus :** Développer le flux Genkit et l'interface pour les suggestions de style personnalisées.
*   **Modération de Contenu:** Intégrer un service de modération externe (API) pour le texte et les médias générés par les utilisateurs.
*   **Notifications:** Mettre en place des notifications push (e.g., via Firebase Cloud Messaging) pour les nouveaux messages, matchs, etc.
*   **Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer une solution WebRTC (e.g., Twilio, Agora) pour les appels vidéo/audio.
*   **Améliorations des Jeux:** Ajouter plus de jeux, de la variété, un système de scores persistant et des classements (backend requis).
*   **Feedback Post-Speed Dating:** Créer l'interface et la logique (backend) pour collecter et afficher le feedback après les sessions de speed dating.
