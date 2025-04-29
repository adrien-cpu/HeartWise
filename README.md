
# **App Name**: HeartWise

## Core Features:
- [x] Geolocation Based Meeting: Enable users to find geolocated meetings in public places. (`/geolocation-meeting`)
- [x] Facial Analysis and Matching: Analyze facial morphology (with consent) and cross-reference with psychological traits to find natural affinities, considering both similarities and opposites. (`/facial-analysis-matching`, `src/services/face-analysis.ts`)
- [x] AI Conversation Coach: Analyse the messages written by the user and suggest reformulations if needed to create a good conversation. The LLM acts as a tool and will decide when to intervene. (`/ai-conversation-coach`, `src/ai/flows/conversation-coach.ts`, `src/ai/flows/style-suggestions-flow.ts`)
- [x] Blind Exchange Mode: Offer a mode of meeting without photo, profile or information. The AI proposes a profile based on facial and emotional matching, common points and opposite polarities. (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts`)
- [x] Intelligent User Dashboard: Display personalized advice and user stats. (`/dashboard`)

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
- [x] **Rencontres géolocalisées** dans des lieux publics (cafés partenaires, événements) (`/geolocation-meeting` - *Frontend*)
- [x] **Rencontres virtuelles classiques** via l'application (`/chat` - *Enhanced UI*, needs **real-time backend** & **video/audio call integration**)
- [x] **Speed Dating digital** : sessions rapides avec matching + feedback immédiat (`/speed-dating` - *Frontend UI + Feedback Simulation*, needs **backend** for matching/scheduling/feedback persistence)

### 2. 👁‍🗨️ Reconnaissance faciale + IA de Matching
- [x] Analyse morphologique faciale (avec consentement) (`/facial-analysis-matching`, `src/services/face-analysis.ts` - *Frontend Simulation*)
- [x] Croisement avec les traits psychologiques pour affinités "naturelles" (`/facial-analysis-matching`, `/blind-exchange-mode` - *Frontend Simulation/AI*)
- [x] Capacité à jouer sur les similarités ET les opposés (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts` - *Frontend AI*)

### 3. 💬 Coach IA conversationnel
Un assistant intelligent intégré au tchat pour aider à créer une vraie alchimie. (`/ai-conversation-coach`, `src/ai/flows/conversation-coach.ts` - *Frontend AI*)

#### Fonctions principales :
- [x] ✨ **Proposition de phrases d'accroche** (*Covered by AI Coach*)
- [x] 🔍 **Analyse en temps réel** du message écrit : (*Covered by AI Coach & Risky Words*)
- [x] 🌟 **Tag d'intention** en option : tendre, humour, séduction, amical... (`/chat` - *UI allows selection*, needs **backend/AI logic**)
- [x] ⚠️ **Alerte aux malentendus** : mots à double sens ou émotions contradictoires. (*Covered by Risky Words*) (`/risky-words-dictionary`)
- [x] 🤝 **Facilitateur d'échange** : reformule, relance ou clarifie au besoin. (*Covered by AI Coach*)

### 4. 🔖 Dictionnaire IA des mots à risque
Une base dynamique qui identifie les expressions ambiguës ou sensibles. (`/risky-words-dictionary`, `src/ai/flows/risky-words-dictionary.ts` - *Frontend AI*)

#### Contenu :
- [x] “Câlin”, “Je veux te voir”, “T’es sexy”, “Envie de te connaître”, etc. (*Covered by AI Flow*)
- [x] Interprétations possibles + suggestions de clarification (*Covered by AI Flow*)
- [ ] Mise à jour par : IA auto-apprenante + signalements utilisateurs (**Backend/Database/Feedback Loop**)

### 5. 🥶 Echanges à l’aveugle
Un mode novateur de rencontre **sans photo, sans profil, sans informations**. (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts` - *Frontend AI/Simulation*)

#### Déroulé :
- L'IA propose un profil compatible basé sur :
  - [x] Matching facial et émotionnel (*Frontend AI/Simulation*)
  - [x] Points communs et polarités contraires (*Frontend AI*)
- L'utilisateur ne voit que :
  - [x] Un pourcentage de compatibilité (*Frontend AI*)
  - [x] Une bulle de discussion neutre (*Frontend UI*)
- [ ] Les infos se dévoilent **progressivement** selon l'engagement mutuel (**Requires complex chat interaction logic + backend/state management**)

### 6. 🚀 Bonus et gamification
- [x] 🌟 **Bonus de style** : suggestions personnalisées du coach IA selon ton niveau de confort, ton style (romantique, direct, poétique, etc.) (`/ai-conversation-coach`, `src/ai/flows/style-suggestions-flow.ts` - *Frontend AI*)
- [x] 🎖️ Système de récompenses : badges, accès à des modes cachés, speed-dating premium, etc. (`/rewards` - *Frontend UI*, needs **backend logic**)

## 🌐 Anticipation marché et différenciation
- App centrée sur **la compréhension émotionnelle** et **l'humain avant l'apparence**
- Positionnement éthique : pas d'objectification des utilisateurs, consentement clair
- IA au service des **valeurs de respect, d'authenticité et de lien vrai**

## 🚧 Modules à développer (Frontend Simulation Status)
- [x] 1. Moteur de matching (IA émotionnelle + reconnaissance faciale + logique "semblable/contraire") (`/facial-analysis-matching`, `/blind-exchange-mode` - *Frontend AI/Simulation*)
- [x] 2. Coach IA conversationnel temps réel (`/ai-conversation-coach` - *Frontend AI*)
- [x] 3. Dictionnaire d'expressions sensibles (`/risky-words-dictionary` - *Frontend AI*)
- [x] 4. Mode "Rencontre à l'aveugle" (`/blind-exchange-mode` - *Frontend AI/Simulation*)
- [x] 5. Système de gamification (`/rewards` - *Frontend UI*, needs backend logic)
- [x] 6. Interface speed dating dynamique (`/speed-dating` - *Frontend UI + Feedback Simulation*)
- [x] 7. Tableau de bord utilisateur intelligent (conseils personnalisés) (`/dashboard` - *Frontend UI/Mock Data*)

## 💼 Pour le développement IA
Le cahier des charges est prêt à être transmis à une IA spécialisée dans le code afin de générer :
- L'architecture de l'application
- Les modules IA conversationnels
- Le moteur de matching avancé
- Le système de chat augmenté avec filtre émotionnel

---

## Implemented Features (Frontend Simulation):

*   **[x] Correspondance par Analyse Faciale :** (`/facial-analysis-matching` - *Simulation*)
*   **[x] Mode d'Échange à l'Aveugle :** (`/blind-exchange-mode` - *AI/Simulation*)
*   **[x] Coach Conversationnel IA (avec Bonus de Style):** (`/ai-conversation-coach` - *AI*)
*   **[x] Dictionnaire IA des Mots à Risque :** (`/risky-words-dictionary` - *AI*)
*   **[x] Jeu :** (`/game` - *UI/Basic Logic*, needs backend for preferences/points persistence)
*   **[x] Speed Dating :** (`/speed-dating` - *UI + Feedback Simulation*, needs backend for scheduling/matching/feedback persistence)
*   **[x] Rencontre Géolocalisée :** (`/geolocation-meeting` - *Uses Browser Geolocation API*)
*   **[x] Gestion Améliorée des Profils :** (`/profile` - *UI/Mock Data*)
*   **[x] Outils de Communication Intégrés à l'Application (Chat):** (`/chat` - *Enhanced UI/Mock Data*, needs backend for real-time/persistence/calls)
*   **[x] Système de récompenses (basique) :** (`/rewards` - *Displays Mock Points/Badges*, needs backend)
*   **[x] Tableau de bord utilisateur intelligent :** (`/dashboard` - *Displays Mock Advice/Stats*, needs backend)

## Features to Implement / Enhance (Requires Backend & Advanced Logic):

*   **[ ] Intégration Backend Réelle:** Remplacer toutes les données et services simulés par des appels API réels (Base de données utilisateurs, stockage d'images cloud, API de géolocalisation tierce, logique de matchmaking réelle, persistance du chat via base de données, etc.).
*   **[ ] Authentification Utilisateur:** Implémenter un système de connexion/inscription sécurisé (e.g., Firebase Auth, NextAuth).
*   **[ ] Système de récompenses (avancé):** Concevoir et implémenter le système de points, modes cachés, accès premium (logique backend + UI).
*   **[ ] Modération de Contenu:** Intégrer un service de modération externe (API) pour le texte et les médias générés par les utilisateurs.
*   **[ ] Notifications:** Mettre en place des notifications push (e.g., via Firebase Cloud Messaging) pour les nouveaux messages, matchs, etc.
*   **[ ] Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer une solution WebRTC (e.g., Twilio, Agora) pour les appels vidéo/audio dans `/chat`.
*   **[ ] Améliorations des Jeux:** Ajouter plus de jeux (comme Times Up), de la variété, un système de scores persistant et des classements (backend requis).
*   **[ ] Feedback Post-Speed Dating (Persistance):** Connecter l'interface de feedback (`/speed-dating`) à un backend pour stocker les avis.
*   **[ ] Dévoilement progressif (Blind Exchange):** Implémenter la logique pour révéler les informations progressivement dans le chat (`/blind-exchange-mode`).
*   **[ ] Mise à jour IA (Risky Words):** Implémenter l'auto-apprentissage et le signalement utilisateur (`/risky-words-dictionary`).
*   **[ ] Tags d'intention (Chat - Avancé):** Implémenter la logique IA backend pour analyser/suggérer des tags d'intention (`/chat`).


*Note: Features marked with *Simulation*, *AI*, or *UI* have frontend representations but may require backend logic for full functionality.*

    