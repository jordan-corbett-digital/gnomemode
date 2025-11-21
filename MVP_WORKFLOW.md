# SpiteGarden MVP Build Workflow

## Current State Assessment
✅ **Completed:**
- Project setup (Vite + React + TypeScript)
- Tailwind CSS configured
- Onboarding flow (9 steps)
- Basic state management (Context + useReducer)
- UI components (Button, Card, Chip)
- Garden dashboard
- Check-in screen
- Navigation structure

❌ **Missing:**
- Firebase integration
- Zustand state management
- RPG systems (XP, Coins, Leveling)
- Quests system
- Shop page
- Inventory/Bag
- Gnome Profile
- AI integration
- Gnome tone selection

---

## Phase 1: Foundation & Data Model (Priority: HIGH)

### Step 1.1: Install Dependencies
- [ ] Install Zustand for state management
- [ ] Install Firebase SDK (auth, firestore)
- [ ] Install any missing UI dependencies
- [ ] Set up environment variables structure

### Step 1.2: Update Data Models
- [ ] Extend `types.ts` with:
  - User model (id, coins, level, xp, streak, gnomeTone, etc.)
  - Quest model (id, type, title, description, rewards, completed)
  - Inventory model (items, equipped, quantity)
  - Shop items model
- [ ] Update OnboardingData to include `gnomeTone`

### Step 1.3: Firebase Setup
- [ ] Create Firebase project (or configure existing)
- [ ] Set up Firebase config file
- [ ] Configure Firestore database
- [ ] Set up Firebase Auth (anonymous + email)
- [ ] Create Firestore security rules
- [ ] Initialize Firebase in app

---

## Phase 2: State Management Migration (Priority: HIGH)

### Step 2.1: Create Zustand Stores
- [ ] Create `stores/userStore.ts` (user data, gnome info)
- [ ] Create `stores/questStore.ts` (quests, completion)
- [ ] Create `stores/shopStore.ts` (shop items, purchases)
- [ ] Create `stores/inventoryStore.ts` (owned items, equipped)
- [ ] Create `stores/gameStore.ts` (XP, coins, level, streak)

### Step 2.2: Migrate Existing State
- [ ] Migrate onboarding data to Zustand
- [ ] Migrate garden data to Zustand
- [ ] Update components to use Zustand hooks
- [ ] Keep Context for navigation only (or migrate to Zustand)

---

## Phase 3: Core RPG Systems (Priority: HIGH)

### Step 3.1: XP & Leveling System
- [ ] Add XP calculation logic
- [ ] Add level calculation (XP → Level formula)
- [ ] Update check-in success to award XP
- [ ] Display XP bar and level on dashboard
- [ ] Add level-up animations/notifications

### Step 3.2: Coins & Economy
- [ ] Initialize coins on user creation
- [ ] Award coins on quest completion
- [ ] Award coins on check-in success
- [ ] Display coin balance on dashboard
- [ ] Update shop to use coins

---

## Phase 4: Onboarding Updates (Priority: MEDIUM)

### Step 4.1: Add Gnome Tone Selection
- [ ] Add tone selection step (Soft / Spicy / Cursed)
- [ ] Update onboarding data model
- [ ] Save tone to Firebase
- [ ] Use tone in AI prompts

### Step 4.2: Firebase Integration
- [ ] Save onboarding data to Firestore
- [ ] Create user document on onboarding completion
- [ ] Initialize quests, inventory, shop data
- [ ] Handle auth state (anonymous or email)

---

## Phase 5: Quests System (Priority: HIGH)

### Step 5.1: Quest Data Structure
- [ ] Create quest templates (daily quests)
- [ ] Create special quests JSON file
- [ ] Define quest reward structure

### Step 5.2: Quest Generation
- [ ] Build daily quest generator
- [ ] Load special quests from JSON
- [ ] Display quests on quests page
- [ ] Track quest progress

### Step 5.3: Quest Completion
- [ ] Add quest completion logic
- [ ] Award XP and coins on completion
- [ ] Update quest status in Firestore
- [ ] Show completion animations

---

## Phase 6: Shop & Inventory (Priority: MEDIUM)

### Step 6.1: Shop Page
- [ ] Create shop items JSON (cosmetics + powerups)
- [ ] Build shop UI
- [ ] Implement purchase flow
- [ ] Deduct coins on purchase
- [ ] Add items to inventory

### Step 6.2: Inventory/Bag
- [ ] Create inventory page
- [ ] Display owned items
- [ ] Add equip functionality (cosmetics)
- [ ] Add use functionality (powerups)
- [ ] Implement powerup effects (skip day, XP boost, etc.)

---

## Phase 7: Gnome Profile (Priority: MEDIUM)

### Step 7.1: Profile Page
- [ ] Display gnome name, level, XP
- [ ] Show mood history (derived from streak)
- [ ] Display streak history
- [ ] Show "Nemesis damage avoided" stat
- [ ] Add tone selector (updates AI prompt)

### Step 7.2: Stats & History
- [ ] Calculate and display stats
- [ ] Show progress charts/graphs
- [ ] Display achievement badges (optional)

---

## Phase 8: AI Integration (Priority: HIGH)

### Step 8.1: AI Helper Functions
- [ ] Create `utils/ai.ts` with `generateGnomeMessage()`
- [ ] Set up Google GenAI client
- [ ] Create prompt templates based on tone
- [ ] Handle API errors gracefully

### Step 8.2: AI Integration Points
- [ ] Generate gnome dialogue on dashboard
- [ ] Generate reactions to check-in success/failure
- [ ] Generate quest flavor text (optional)
- [ ] Generate micro-story unlocks (optional MVP)

---

## Phase 9: Home Screen (Gnome Hub) Enhancement (Priority: HIGH)

### Step 9.1: Dashboard Updates
- [ ] Display Gnome portrait/avatar
- [ ] Show XP bar, level, mood
- [ ] Add daily check-in button/status
- [ ] Display AI-generated dialogue bubble
- [ ] Add story progression indicator

### Step 9.2: Daily To-Do List
- [ ] Create static to-do list for MVP
- [ ] Display on dashboard
- [ ] Mark items as complete
- [ ] Link to quests (optional)

---

## Phase 10: Firebase Hosting & Deployment (Priority: MEDIUM)

### Step 10.1: Build Configuration
- [ ] Optimize build settings
- [ ] Test production build locally
- [ ] Fix any build errors

### Step 10.2: Firebase Hosting
- [ ] Initialize Firebase Hosting
- [ ] Configure hosting rules
- [ ] Deploy to Firebase
- [ ] Set up custom domain (optional)

---

## Phase 11: Polish & Testing (Priority: LOW for MVP)

### Step 11.1: Mobile Responsiveness
- [ ] Test on mobile devices
- [ ] Fix layout issues
- [ ] Optimize touch interactions

### Step 11.2: Animations & Polish
- [ ] Add micro-animations
- [ ] Improve transitions
- [ ] Add loading states
- [ ] Error handling improvements

### Step 11.3: Testing
- [ ] Test onboarding flow
- [ ] Test check-in flow
- [ ] Test quest completion
- [ ] Test shop purchases
- [ ] Test inventory usage

---

## Quick Start Commands

```bash
# Install dependencies
npm install zustand firebase

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

---

## Notes & Decisions Needed

1. **Theme**: Keep mushroom/garden or pivot to traditional gnome?
2. **Firebase**: New project or existing?
3. **AI**: Google GenAI or OpenAI GPT-4o?
4. **State**: Full Zustand migration or hybrid?
5. **Demo Date**: Target completion date?

---

## Recommended Build Order for MVP Demo

1. **Foundation** (Steps 1-2): Data models + Zustand + Firebase setup
2. **Core Systems** (Step 3): XP, Coins, Leveling
3. **Quests** (Step 5): Daily quests + completion
4. **AI** (Step 8): Basic gnome dialogue
5. **Dashboard** (Step 9): Enhanced home screen
6. **Shop/Inventory** (Step 6): Basic functionality
7. **Profile** (Step 7): Basic stats display
8. **Deploy** (Step 10): Get it live

**Optional for MVP:**
- Advanced quests
- Powerup effects
- Story progression
- Animations/polish







