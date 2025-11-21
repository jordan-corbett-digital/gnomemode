# Onboarding Flow - Development Guide

## Overview
The onboarding flow has been cleared and is ready for a fresh implementation. All infrastructure (navigation, dev tools, state management) is in place and ready to use.

## File Structure

### `components/OnboardingFlow.tsx`
Main onboarding component. This is where you'll:
- Render your onboarding steps
- Handle step navigation logic
- Manage the overall flow structure

**Current State:** Placeholder component ready for your implementation.

### `components/OnboardingDevPanel.tsx`
Development navigation panel. This provides:
- Step configuration array (`ONBOARDING_STEPS`)
- Dev panel UI for navigating between steps
- Keyboard shortcuts (Shift + ←/→, Shift + D)

**To add steps:** Edit the `ONBOARDING_STEPS` array in this file.

### State Management (`App.tsx`, `types.ts`)
- `onboardingStep`: Current step number (starts at 1)
- `onboardingData`: Flexible data object for storing onboarding responses
- Actions: `START_ONBOARDING`, `NEXT_ONBOARDING_STEP`, `SET_ONBOARDING_STEP`, `SET_ONBOARDING_DATA`, `FINISH_ONBOARDING`

## How to Build Your New Flow

### Step 1: Define Your Steps
Edit `components/OnboardingDevPanel.tsx` and add steps to the `ONBOARDING_STEPS` array:

```typescript
export const ONBOARDING_STEPS = [
  { number: 1, name: 'Welcome', component: 'WelcomeStep' },
  { number: 2, name: 'Get Started', component: 'GetStartedStep' },
  // ... add more steps
];
```

### Step 2: Create Step Components
Create individual step components (e.g., `components/onboarding/WelcomeStep.tsx`):

```typescript
import React from 'react';
import { useAppState } from '../../App';
import Button from '../common/Button';

export default function WelcomeStep() {
  const { dispatch } = useAppState();

  const handleNext = () => {
    dispatch({ type: 'NEXT_ONBOARDING_STEP' });
  };

  return (
    <div className="flex flex-col items-center">
      <h1>Welcome!</h1>
      <Button onClick={handleNext}>Continue</Button>
    </div>
  );
}
```

### Step 3: Wire Up Steps in OnboardingFlow
Edit `components/OnboardingFlow.tsx` and update the `renderStep()` function:

```typescript
const renderStep = () => {
  switch (onboardingStep) {
    case 1:
      return <WelcomeStep />;
    case 2:
      return <GetStartedStep />;
    // ... add more cases
    default:
      return null;
  }
};
```

### Step 4: Store Data (Optional)
If you need to collect data during onboarding, use the `SET_ONBOARDING_DATA` action:

```typescript
dispatch({ 
  type: 'SET_ONBOARDING_DATA', 
  payload: { userName: 'John', favoriteColor: 'blue' } 
});
```

Access it via:
```typescript
const { state } = useAppState();
const { onboardingData } = state;
```

### Step 5: Complete Onboarding
When the user finishes, dispatch:

```typescript
dispatch({ type: 'FINISH_ONBOARDING' });
```

This will navigate them to the garden screen.

## Dev Tools

### Accessing the Flow
- From **Settings Menu**: Click menu icon (top-left) → "Access Onboarding Flow"
- From **Intro Screen**: Click "Awaken Your Gnome"

### Dev Panel Features
- **Toggle**: Click "Dev Panel" button (bottom-right) or press `Shift + D`
- **Navigate**: 
  - Click step numbers in the panel
  - Use Previous/Next buttons
  - Use `Shift + ←/→` keyboard shortcuts
- **Current Step**: Always visible in the panel

## Best Practices

1. **One Component Per Step**: Keep each step as a separate component for maintainability
2. **Use the Dev Panel**: Always test navigation between steps during development
3. **Validate Before Proceeding**: Add validation logic before calling `NEXT_ONBOARDING_STEP`
4. **Store Data Incrementally**: Use `SET_ONBOARDING_DATA` to save responses as users progress
5. **Progress Indicator**: The progress bar automatically updates based on `ONBOARDING_STEPS.length`

## Example: Complete Step Implementation

```typescript
// components/onboarding/NameStep.tsx
import React, { useState } from 'react';
import { useAppState } from '../../App';
import Button from '../common/Button';

export default function NameStep() {
  const { dispatch, state } = useAppState();
  const [name, setName] = useState(state.onboardingData.name || '');

  const handleNext = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    dispatch({ 
      type: 'SET_ONBOARDING_DATA', 
      payload: { name } 
    });
    dispatch({ type: 'NEXT_ONBOARDING_STEP' });
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold">What's your name?</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 border rounded-lg"
        placeholder="Enter your name"
      />
      <Button onClick={handleNext} disabled={!name.trim()}>
        Continue
      </Button>
    </div>
  );
}
```

## Notes

- The old onboarding flow has been completely removed
- All infrastructure is ready and working
- You can start building immediately
- The dev panel will help you navigate while building




