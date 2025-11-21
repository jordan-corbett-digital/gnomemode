# SpiteGarden Setup Guide

## Quick Start

### 1. Environment Variables

Create a `.env` file in the root directory with:

```env
# Google Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (optional for MVP - can add later)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Get Your Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy it to your `.env` file as `VITE_GEMINI_API_KEY`

### 3. Firebase Setup (Optional for MVP)

If you want to set up Firebase:

1. Go to https://console.firebase.google.com/
2. Create a new project (or use existing)
3. Enable Authentication (Anonymous + Email)
4. Create a Firestore database
5. Get your config from Project Settings > General > Your apps
6. Add the config to your `.env` file

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## What's Built

### ✅ Completed Features

- **Onboarding Flow**: 10-step onboarding including gnome tone selection
- **Zustand State Management**: All stores set up (user, game, quests, shop, inventory)
- **RPG Systems**: XP, leveling, coins, streaks
- **AI Integration**: Gnome dialogue generation using Google Gemini
- **Enhanced Dashboard**: Shows XP bar, level, coins, AI-generated gnome messages
- **Check-in Screen**: Integrated with AI and RPG rewards
- **Data Models**: Complete type definitions for all features

### 🚧 Ready to Build

- **Quests Page**: Store is ready, just need UI
- **Shop Page**: Store is ready, just need UI
- **Inventory Page**: Store is ready, just need UI
- **Profile Page**: Data available, just need UI
- **Firebase Integration**: Config ready, needs connection

## Project Structure

```
spitegarden/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   └── ...
├── stores/             # Zustand state stores
│   ├── userStore.ts
│   ├── gameStore.ts
│   ├── questStore.ts
│   ├── shopStore.ts
│   └── inventoryStore.ts
├── utils/              # Utility functions
│   └── ai.ts          # AI dialogue generation
├── config/             # Configuration
│   └── firebase.ts    # Firebase setup
└── types.ts           # TypeScript types
```

## Next Steps for Demo

1. **Add Gnome Character**: Replace mushroom placeholder with your gnome character
2. **Test AI**: Make sure Gemini API key works
3. **Build Quests Page**: Create UI for daily quests
4. **Build Shop Page**: Create UI for purchasing items
5. **Polish Dashboard**: Add animations, improve UX
6. **Firebase (Optional)**: Connect for persistence if needed

## Troubleshooting

### AI Not Working
- Check that `VITE_GEMINI_API_KEY` is set in `.env`
- Make sure the key is valid and has API access enabled
- Check browser console for errors

### State Not Persisting
- Zustand stores use localStorage by default
- Check browser DevTools > Application > Local Storage
- Clear localStorage if you need to reset

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Clear node_modules and reinstall if needed







