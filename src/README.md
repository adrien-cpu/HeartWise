# **App Name**: HeartWise

## Core Features:
- [x] Geolocation Based Meeting: Enable users to find geolocated meetings in public places. (`/geolocation-meeting`)
- [x] Facial Analysis and Matching: AI analyzes user's photo and suggests potential matches based on simulated facial and psychological traits from a mock user database. (`/facial-analysis-matching`, `src/services/face-analysis.ts`, `src/ai/flows/facial-match-suggestions.ts`)
- [x] AI Conversation Coach: Analyse the messages written by the user and suggest reformulations if needed to create a good conversation. The LLM acts as a tool and will decide when to intervene. (`/ai-conversation-coach`, `src/ai/flows/conversation-coach.ts`, `src/ai/flows/style-suggestions-flow.ts`)
- [x] Blind Exchange Mode: Offer a mode of meeting without photo, profile or information. The AI proposes a profile based on facial and emotional matching, common points and opposite polarities. (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts`)
- [x] Intelligent User Dashboard: Display personalized advice and user stats. (`/dashboard`)
- [x] Risky Words Dictionary: Identify ambiguous or sensitive expressions in messages. User feedback on suggestions is persisted. (`/risky-words-dictionary`, `src/ai/flows/risky-words-dictionary.ts`, `src/services/feedback_service.ts`)
- [x] User Profile Management: View and edit user profile details. (`/profile`, `src/services/user_profile.ts`)
- [x] Basic Chat Interface: Real-time chat with Firestore backend. Includes AI-suggested intention tagging and content moderation. (`/chat`, `src/ai/flows/intention-tagging.ts`, `src/services/moderation_service.ts`, `src/services/chat_service.ts`)
- [x] Speed Dating Interface: UI for creating, finding, registering for sessions. Feedback persisted to Firestore. Conceptual backend logic for matchmaking and session status transitions in place. (`/speed-dating`, `src/services/speed_dating_service.ts`)
- [x] General Knowledge Game: Trivia and Time's Up game modes. Persistent scores, preferences, and leaderboard via Firestore. (`/game`, `src/services/user_profile.ts`)
- [x] Rewards System: Display earned badges and points. Displays unlock status and progress for premium features. (`/rewards`, `src/services/user_profile.ts`)

## Style Guidelines:

- Primary color: Soft Lavender (#E6E6FA) for a calming effect. (Applied via HSL variables in `globals.css`)
- Secondary color: Light Gray (#D3D3D3) to provide a neutral background. (Represented by `muted` and `secondary` HSL variables in `globals.css`)
- Accent: Coral (#FF7F50) for highlights and call-to-action buttons. (Applied via HSL variables in `globals.css`)
- Clean and modern typography for readability. (Using Geist Sans/Mono)
- Simple and elegant icons to represent different features and actions. (Using Lucide icons)
- Clean and intuitive layout to provide a seamless user experience. (Leveraging ShadCN components and Tailwind)
- Subtle animations and transitions to enhance user engagement. (Provided by ShadCN/Tailwind Animate)

## Original User Request (French):
# Cahier des charges — Application de Rencontre Nouvelle Génération avec IA

## 🌟 Vision globale
Une application de rencontre à la croisee de l'humain et de l'intelligence artificielle, basée sur :
- Des modes de rencontre réels et virtuels.
- La reconnaissance faciale (avec consentement) pour analyser les affinités visuelles.
- Des principes contrastés : « Qui se ressemble s'assemble » **et** « Les contraires s'attirent ».
- Des interactions émotionnellement intelligentes.
- Une anticipation des tendances du marché relationnel.

## 🌐 Fonctionnalités principales

### 1. 📲 Rencontres hybrides (virtuelles & réelles)
- [x] **Rencontres géolocalisées** dans des lieux publics (cafés partenaires, événements) (`/geolocation-meeting` - *Frontend + Conceptual backend compatibility logic*)
- [x] **Rencontres virtuelles classiques** via l'application (`/chat` - *Enhanced UI with real-time backend via Firestore*, needs **video/audio call integration**)
- [x] **Speed Dating digital** : sessions rapides avec matching + feedback immédiat (`/speed-dating` - *Frontend UI + Feedback persisted to Firestore, session creation/registration/finding via Firestore + Conceptual advanced backend for matching & session status transitions*)

### 2. 👁‍🗨️ Reconnaissance faciale + IA de Matching
- [x] Analyse morphologique faciale (avec consentement) (`/facial-analysis-matching`, `src/services/face-analysis.ts`, `src/ai/flows/facial-match-suggestions.ts` - *AI suggests profiles based on user photo and mock database analysis.*)
- [x] Croisement avec les traits psychologiques pour affinités "naturelles" (`/facial-analysis-matching`, `/blind-exchange-mode` - *Frontend Simulation/AI*)
- [x] Capacité à jouer sur les similarités ET les opposés (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts` - *Frontend AI*)

### 3. 💬 Coach IA conversationnel
Un assistant intelligent intégré au tchat pour aider à créer une vraie alchimie. (`/ai-conversation-coach`, `src/ai/flows/conversation-coach.ts` - *Frontend AI*)

#### Fonctions principales :
- [x] ✨ **Proposition de phrases d'accroche** (*Covered by AI Coach*)
- [x] 🔍 **Analyse en temps réel** du message écrit : (*Covered by AI Coach & Risky Words*)
- [x] 🌟 **Tag d'intention** en option : tendre, humour, séduction, amical... (`/chat`, `src/ai/flows/intention-tagging.ts` - *UI allows selection, AI suggests tags*)
- [x] ⚠️ **Alerte aux malentendus** : mots à double sens ou émotions contradictoires. (*Covered by Risky Words*) (`/risky-words-dictionary`)
- [x] 🤝 **Facilitateur d'échange** : reformule, relance ou clarifie au besoin. (*Covered by AI Coach*)

### 4. 🔖 Dictionnaire IA des mots à risque
Une base dynamique qui identifie les expressions ambiguës ou sensibles. (`/risky-words-dictionary`, `src/ai/flows/risky-words-dictionary.ts`, `src/services/feedback_service.ts` - *Frontend AI + User Feedback via Firestore*)

#### Contenu :
- [x] “Câlin”, “Je veux te voir”, “T’es sexy”, “Envie de te connaître”, etc. (*Covered by AI Flow*)
- [x] Interprétations possibles + suggestions de clarification (*Covered by AI Flow*)
- [x] Mise à jour par : signalements utilisateurs (feedback sur mots signalés et signalement de mots manqués implémentés, stockage Firestore)
- [~] Mise à jour par : IA auto-apprenante (nécessite pipeline de fine-tuning/mise à jour de listes dynamiques - *Feedback data collected, conceptual backend processing outlined in `feedback_service.ts`*)

### 5. 🥶 Echanges à l’aveugle
Un mode novateur de rencontre **sans photo, sans profil, sans informations**. (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts` - *Frontend AI/Simulation*)

#### Déroulé :
- L'IA propose un profil compatible basé sur :
  - [x] Matching facial et émotionnel (*Frontend AI/Simulation*)
  - [x] Points communs et polarités contraires (*Frontend AI*)
- L'utilisateur ne voit que :
  - [x] Un pourcentage de compatibilité (*Frontend AI*)
  - [x] Une bulle de discussion neutre (*Frontend UI*)
- [x] Les infos se dévoilent **progressivement** selon l'engagement mutuel (*Progressive reveal for interests, bio snippets, and photo implemented via message count milestones.*)

### 6. 🚀 Bonus et gamification
- [x] 🌟 **Bonus de style** : suggestions personnalisées du coach IA selon ton niveau de confort, ton style (romantique, direct, poétique, etc.) (`/ai-conversation-coach`, `src/ai/flows/style-suggestions-flow.ts` - *Frontend AI*)
- [x] 🎖️ Système de récompenses : badges, accès à des modes cachés, speed-dating premium, etc. (`/rewards` - *Frontend UI + Backend Logic for points/badges via Firestore, premium feature unlocking implemented and displayed*)

## 🌐 Anticipation marché et différenciation
- App centrée sur **la compréhension émotionnelle** et **l'humain avant l'apparence**
- Positionnement éthique : pas d'objectification des utilisateurs, consentement clair
- IA au service des **valeurs de respect, d'authenticité et de lien vrai**

## 🚧 Modules à développer (Frontend Simulation Status)
- [x] 1. Moteur de matching (IA émotionnelle + reconnaissance faciale + logique "semblable/contraire") (`/facial-analysis-matching`, `/blind-exchange-mode` - *AI suggests profiles based on user photo and mock database analysis.*)
- [x] 2. Coach IA conversationnel temps réel (`/ai-conversation-coach` - *Frontend AI*)
- [x] 3. Dictionnaire d'expressions sensibles (`/risky-words-dictionary`, `src/ai/flows/risky-words-dictionary.ts` - *Frontend AI + User Feedback via Firestore*)
- [x] 4. Mode "Rencontre à l'aveugle" (`/blind-exchange-mode` - *Frontend AI/Simulation + Progressive Reveal*)
- [x] 5. Système de gamification (`/rewards` - *Frontend UI + Backend Logic via Firestore for points/badges, premium feature unlocking implemented and displayed*)
- [x] 6. Interface speed dating dynamique (`/speed-dating` - *Frontend UI + Feedback persisted to Firestore, session creation/registration/finding via Firestore, conceptual matchmaking & session status logic in service layer*)
- [x] 7. Tableau de bord utilisateur intelligent (conseils personnalisés) (`/dashboard` - *Frontend UI/Firebase Data*)

## Implemented Features (Frontend Simulation):

*   **[x] Correspondance par Analyse Faciale :** (`/facial-analysis-matching` - *AI suggests profiles from mock data based on user photo analysis.*)
*   **[x] Mode d'Échange à l'Aveugle :** (`/blind-exchange-mode` - *AI/Simulation + Progressive Reveal*)
*   **[x] Coach Conversationnel IA (avec Bonus de Style):** (`/ai-conversation-coach` - *AI*)
*   **[x] Dictionnaire IA des Mots à Risque :** (`/risky-words-dictionary` - *AI + User Feedback via Firebase, input text moderation*)
*   **[x] Jeu :** (`/game` - *General Knowledge and Times Up games use Firebase for preferences/points/rewards/leaderboard.*)
*   **[x] Speed Dating :** (`/speed-dating` - *UI + Feedback persisted to Firestore, session creation/registration/finding via Firestore, conceptual matchmaking & session status logic in service layer*)
*   **[x] Rencontre Géolocalisée :** (`/geolocation-meeting` - *Uses Browser Geolocation API + Conceptual backend compatibility logic*)
*   **[x] Gestion Améliorée des Profils :** (`/profile` - *UI/Data now uses Firebase Firestore, content moderation for bio/images integrated*)
*   **[x] Outils de Communication Intégrés à l'Application (Chat avec Tag d'Intention IA):** (`/chat`, `src/ai/flows/intention-tagging.ts` - *Enhanced UI/Real-time via Firestore/AI Suggestion, content moderation integrated, local notification on new message*)
*   **[x] Système de récompenses :** (`/rewards` - *Displays Points/Badges from Firebase Firestore, premium feature unlocking implemented and displayed, local notification on badge/feature unlock*)
*   **[x] Tableau de bord utilisateur intelligent :** (`/dashboard` - *Displays Advice/Stats from Firebase Firestore*)

## Features to Implement / Enhance (Requires Backend & Advanced Logic):

*   **[~] Intégration Backend Réelle:** User profiles, rewards, points, game preferences/scores, risky word feedback, speed dating feedback/sessions, chat messages use Firebase Firestore. *Geolocation matching (advanced), Speed Dating advanced matchmaking, and real-time updates for some features still need full backend integration or Cloud Functions.*
*   **[x] Authentification Utilisateur:** Firebase Auth implemented (Email/Password, Profile Creation, Password Reset). Enhanced error handling and API key configuration guidance.
*   **[x] Système de récompenses (avancé):** Points and badges stored in Firestore. Premium feature unlocking logic based on points/badges implemented and displayed on rewards page. Local notification on badge/feature unlock.
*   **[~] Modération de Contenu:** Structure for real moderation API in place via `src/services/moderation_service.ts`. Simulated moderation for chat, bio, images, risky word input, and facial analysis photo upload integrated. *Requires actual external API integration for production.*
*   **[~] Notifications:** Local browser notifications implemented for new chat messages, new badges, speed dating registration/creation. *Full push notifications (e.g., Firebase Cloud Messaging) for offline/background activity require backend setup.*
*   **[ ] Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer une solution WebRTC (e.g., Twilio, Agora) pour les appels vidéo/audio dans `/chat`. (*UI placeholders added with "coming soon" messages and informational dialog.*)
*   **[~] Speed Dating (Advanced Backend):** Session creation/registration/finding via Firestore. Feedback persisted. *Advanced matchmaking algorithms and robust session status transitions (e.g., automated start/end via backend triggers like Cloud Functions) are conceptualized in the service layer.*
*   **[~] Mise à jour IA (Risky Words):** Feedback sur mots signalés et signalement de mots manqués implémentés (stockage Firestore). *L'aspect auto-apprentissage (fine-tuning IA ou mise à jour de listes dynamiques) est conceptualisé dans `feedback_service.ts` et nécessite un pipeline backend.*


*Note: Features marked with *Simulation*, *AI*, or *UI* have frontend representations but may require backend logic for full functionality. Features marked with *~* are partially implemented or conceptualized at the backend/service layer.*