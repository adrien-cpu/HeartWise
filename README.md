# **App Name**: HeartWise

## Core Features:
- [x] Geolocation Based Meeting: Enable users to find geolocated meetings in public places. (`/geolocation-meeting`)
- [x] Facial Analysis and Matching: Analyze facial morphology (with consent) and cross-reference with psychological traits to find natural affinities, considering both similarities and opposites. (`/facial-analysis-matching`, `src/services/face-analysis.ts`)
- [x] AI Conversation Coach: Analyse the messages written by the user and suggest reformulations if needed to create a good conversation. The LLM acts as a tool and will decide when to intervene. (`/ai-conversation-coach`, `src/ai/flows/conversation-coach.ts`)
- [x] Blind Exchange Mode: Offer a mode of meeting without photo, profile or information. The AI proposes a profile based on facial and emotional matching, common points and opposite polarities. (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts`)

## Style Guidelines:

- Primary color: Soft Lavender (#E6E6FA) for a calming effect.
- Secondary color: Light Gray (#D3D3D3) to provide a neutral background.
- Accent: Coral (#FF7F50) for highlights and call-to-action buttons.
- Clean and modern typography for readability.
- Simple and elegant icons to represent different features and actions.
- Clean and intuitive layout to provide a seamless user experience.
- Subtle animations and transitions to enhance user engagement.

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
- [x] **Rencontres géolocalisées** dans des lieux publics (cafés partenaires, événements) (`/geolocation-meeting`)
- [ ] **Rencontres virtuelles classiques** via l'application (`/chat` exists but is basic)
- [x] **Speed Dating digital** : sessions rapides avec matching + feedback immédiat (`/speed-dating`)

### 2. 👁‍🗨️ Reconnaissance faciale + IA de Matching
- [x] Analyse morphologique faciale (avec consentement) (`/facial-analysis-matching`, `src/services/face-analysis.ts`)
- [x] Croisement avec les traits psychologiques pour affinités "naturelles" (`/facial-analysis-matching`, `src/services/face-analysis.ts`)
- [x] Capacité à jouer sur les similarités ET les opposés (Implemented in Blind Exchange AI flow) (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts`)

### 3. 💬 Coach IA conversationnel
Un assistant intelligent intégré au tchat pour aider à créer une vraie alchimie. (`/ai-conversation-coach`, `src/ai/flows/conversation-coach.ts`)

#### Fonctions principales :
- [x] ✨ **Proposition de phrases d'accroche** selon les caractéristiques du partenaire. (Covered by AI Coach)
- [x] 🔍 **Analyse en temps réel** du message écrit : (Covered by AI Coach & Risky Words)
  - Ambiguïté ? Ton trop agressif ? Maladresse ?
  - Suggestion de reformulations douces ou plus claires.
- [ ] 🌟 **Tag d'intention** en option : tendre, humour, séduction, amical... (Not Implemented)
- [x] ⚠️ **Alerte aux malentendus** : mots à double sens ou émotions contradictoires. (Covered by Risky Words) (`/risky-words-dictionary`)
- [x] 🤝 **Facilitateur d'échange** : reformule, relance ou clarifie au besoin. (Covered by AI Coach)

### 4. 🔖 Dictionnaire IA des mots à risque
Une base dynamique qui identifie les expressions ambiguës ou sensibles. (`/risky-words-dictionary`, `src/ai/flows/risky-words-dictionary.ts`)

#### Contenu :
- [x] “Câlin”, “Je veux te voir”, “T’es sexy”, “Envie de te connaître”, etc.
- [x] Interprétations possibles + suggestions de clarification
- [ ] Mise à jour par : IA auto-apprenante + signalements utilisateurs (Backend)

### 5. 🥶 Echanges à l’aveugle
Un mode novateur de rencontre **sans photo, sans profil, sans informations**. (`/blind-exchange-mode`, `src/ai/flows/blind-exchange-profile.ts`)

#### Déroulé :
- L'IA propose un profil compatible basé sur :
  - [x] Matching facial et émotionnel
  - [x] Points communs et polarités contraires
- L'utilisateur ne voit que :
  - [x] Un pourcentage de compatibilité
  - [x] Une bulle de discussion neutre
- [ ] Les infos se dévoilent **progressivement** selon l'engagement mutuel (Requires chat interaction logic)

## 🚀 Bonus et gamification
- [ ] 🌟 Bonus de style : suggestions personnalisées du coach IA selon ton niveau de confort, ton style (romantique, direct, poétique, etc.) (Enhancement to AI Coach)
- [x] 🎖️ Système de récompenses : badges, accès à des modes cachés, speed-dating premium, etc. (`/rewards` exists but basic)

## 🌐 Anticipation marché et différenciation
- App centrée sur **la compréhension émotionnelle** et **l'humain avant l'apparence**
- Positionnement éthique : pas d'objectification des utilisateurs, consentement clair
- IA au service des **valeurs de respect, d'authenticité et de lien vrai**

## 🚧 Modules à développer
- [x] 1. Moteur de matching (IA émotionnelle + reconnaissance faciale + logique "semblable/contraire") (`/facial-analysis-matching`, `/blind-exchange-mode`)
- [x] 2. Coach IA conversationnel temps réel (`/ai-conversation-coach`)
- [x] 3. Dictionnaire d'expressions sensibles (`/risky-words-dictionary`)
- [x] 4. Mode "Rencontre à l'aveugle" (`/blind-exchange-mode`)
- [x] 5. Système de gamification (`/rewards` - basic)
- [x] 6. Interface speed dating dynamique (`/speed-dating`)
- [ ] 7. Tableau de bord utilisateur intelligent (conseils personnalisés) (Partially covered by AI Coach)

## 💼 Pour le développement IA
Le cahier des charges est prêt à être transmis à une IA spécialisée dans le code afin de générer :
- L'architecture de l'application
- Les modules IA conversationnels
- Le moteur de matching avancé
- Le système de chat augmenté avec filtre émotionnel

---

## Implemented Features (Frontend Simulation):

*   **[x] Correspondance par Analyse Faciale :** (`/facial-analysis-matching`)
*   **[x] Mode d'Échange à l'Aveugle :** (`/blind-exchange-mode`)
*   **[x] Coach Conversationnel IA :** (`/ai-conversation-coach`)
*   **[x] Dictionnaire IA des Mots à Risque :** (`/risky-words-dictionary`)
*   **[x] Jeu :** (`/game`)
*   **[x] Speed Dating :** (`/speed-dating`)
*   **[x] Rencontre Géolocalisée :** (`/geolocation-meeting`)
*   **[x] Gestion Améliorée des Profils :** (`/profile`)
*   **[x] Outils de Communication Intégrés à l'Application (Chat):** (`/chat`)
*   **[x] Système de récompenses (basique) :** (`/rewards`)

## Features to Implement / Enhance (Backend & Advanced):

*   **Intégration Backend Réelle:** Remplacer toutes les données et services simulés par des appels API réels (Base de données utilisateurs, stockage d'images cloud, API de géolocalisation tierce, logique de matchmaking réelle, persistance du chat via base de données, etc.).
*   **Authentification Utilisateur:** Implémenter un système de connexion/inscription sécurisé (e.g., Firebase Auth, NextAuth).
*   **Système de récompenses (avancé) :** Concevoir et implémenter le système de points, modes cachés, accès premium (logique backend + UI).
*   **Style Bonus (AI Coach) :** Développer le flux Genkit et l'interface pour les suggestions de style personnalisées.
*   **Modération de Contenu:** Intégrer un service de modération externe (API) pour le texte et les médias générés par les utilisateurs.
*   **Notifications:** Mettre en place des notifications push (e.g., via Firebase Cloud Messaging) pour les nouveaux messages, matchs, etc.
*   **Rencontres Virtuelles (Appels Vidéo/Audio):** Intégrer une solution WebRTC (e.g., Twilio, Agora) pour les appels vidéo/audio.
*   **Améliorations des Jeux:** Ajouter plus de jeux, de la variété, un système de scores persistant et des classements (backend requis).
*   **Feedback Post-Speed Dating:** Créer l'interface et la logique (backend) pour collecter et afficher le feedback après les sessions de speed dating.
*   **Dévoilement progressif (Blind Exchange):** Implémenter la logique pour révéler les informations progressivement dans le chat.
*   **Mise à jour IA (Risky Words):** Implémenter l'auto-apprentissage et le signalement utilisateur.
*   **Tableau de bord intelligent:** Créer un tableau de bord personnalisé avec des conseils.
