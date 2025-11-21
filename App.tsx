
import React, { createContext, useReducer, useContext, Dispatch, useEffect, useState } from 'react';
import type { AppState, Action, Screen, OnboardingData, GardenData } from './types';
import { GardenStateEnum } from './types';
import IntroScreen from './components/IntroScreen';
import OnboardingFlow from './components/OnboardingFlow';
import GardenDashboard from './components/GardenDashboard';
import CheckInScreen from './components/CheckInScreen';
import CheckInResponseScreen from './components/CheckInResponseScreen';
import ReportScreen from './components/ReportScreen';
import MessagesScreen from './components/MessagesScreen';
import QuestsScreen from './components/QuestsScreen';
import BottomNav from './components/BottomNav';
import AssetPreloader from './components/AssetPreloader';
import MorningRitualOnboarding from './components/MorningRitualOnboarding';
import SettingsMenu from './components/SettingsMenu';
import { useGameStore } from './stores/gameStore';
import { useGoalStore } from './stores/goalStore';
// import ChooseMushroomScreen from './components/ChooseMushroomScreen';

const initialState: AppState = {
  screen: 'onboarding', // Start with onboarding (Start Demo page)
  onboardingStep: 1, // Start at step 1 for new flow
  onboardingData: {}, // Clean slate - add data as needed
  garden: {
    state: GardenStateEnum.Healthy,
    day: 1,
    streak: 0,
    stakeLost: 0,
    lastCheckInDate: null,
    checkedInToday: false,
  },
};

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

const LOCAL_STORAGE_KEY = 'gnomeModeState';

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'START_ONBOARDING':
      return { ...state, screen: 'onboarding', onboardingStep: 1, onboardingData: {} };
    case 'NEXT_ONBOARDING_STEP':
      return { ...state, onboardingStep: state.onboardingStep + 1 };
    case 'SET_ONBOARDING_STEP':
      return { ...state, onboardingStep: action.payload };
    case 'SET_ONBOARDING_DATA':
      return {
        ...state,
        onboardingData: { ...state.onboardingData, ...action.payload },
      };
    case 'FINISH_ONBOARDING':
      return { ...state, screen: 'garden' };
    case 'NAVIGATE_TO':
      return { ...state, screen: action.payload };
    case 'CHECK_IN_SUCCESS':
      return {
        ...state,
        garden: {
          ...state.garden,
          streak: state.garden.streak + 1,
          state: GardenStateEnum.Healthy,
          lastCheckInDate: new Date().toISOString().split('T')[0],
          checkedInToday: true,
          day: state.garden.day + 1,
        },
      };
    case 'CHECK_IN_FAIL':
      return {
        ...state,
        garden: {
          ...state.garden,
          streak: 0,
          stakeLost: state.garden.stakeLost + action.payload.amount,
          state: GardenStateEnum.Failing,
          lastCheckInDate: new Date().toISOString().split('T')[0],
          checkedInToday: true,
          day: state.garden.day + 1,
        },
      };
    case 'FULFILL_PROMISE':
      // Slightly improves garden state after a failure, a small act of redemption.
      return {
        ...state,
        garden: {
          ...state.garden,
          state: GardenStateEnum.Healthy,
        },
      };
    case 'DEV_TOGGLE_GARDEN_STATE':
        return {
            ...state,
            garden: {
                ...state.garden,
                state: state.garden.state === GardenStateEnum.Healthy ? GardenStateEnum.Failing : GardenStateEnum.Healthy,
            }
        };
    case 'RESET_DAILY_CHECKIN':
        const today = new Date().toISOString().split('T')[0];
        if (state.garden.lastCheckInDate !== today) {
            return {...state, garden: {...state.garden, checkedInToday: false}};
        }
        return state;
    default:
      return state;
  }
};

const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, (defaultInitialState) => {
        try {
            const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                // If saved state has screen as 'garden', user completed onboarding - use saved state
                // Otherwise, always start at onboarding step 1
                if (savedState.screen === 'garden') {
                    return { ...defaultInitialState, ...savedState };
                } else {
                    // Force onboarding step 1 for new users or incomplete onboarding
                    return { ...defaultInitialState, ...savedState, screen: 'onboarding', onboardingStep: 1 };
                }
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultInitialState;
        }
        return defaultInitialState;
    });

    useEffect(() => {
        // Save state to localStorage whenever it changes
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [state]);

    useEffect(() => {
        // Check if a new day has started and reset check-in status on mount
        dispatch({ type: 'RESET_DAILY_CHECKIN' });
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppState = () => useContext(AppContext);

const ScreenRenderer = () => {
    const { state } = useAppState();
    const goalStore = useGoalStore();

    switch (state.screen) {
        case 'intro':
            return <IntroScreen />;
        case 'onboarding':
            return <OnboardingFlow />;
        case 'garden':
            return <GardenDashboard />;
            case 'checkin':
                return <CheckInScreen />;
            case 'checkin-response':
                return <CheckInResponseScreen />;
            case 'goals':
                // Route to appropriate onboarding flow based on selected goal
                if (goalStore.selectedGoalId === 'morning-ritual') {
                    return <MorningRitualOnboarding />;
                }
                // Add other goal flows here (evening-ritual, daily-goals, etc.)
                return <div className="h-full w-full flex items-center justify-center p-6 bg-slate-800 text-white">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Goals</h1>
                        <p className="text-gray-400">Goals page coming soon...</p>
                    </div>
                </div>;
        case 'report':
            return <ReportScreen />;
        case 'quests':
            return <QuestsScreen />;
        case 'shop':
            return <div className="h-full w-full flex items-center justify-center p-6 bg-slate-800 text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Shop</h1>
                    <p className="text-gray-400">Shop page coming soon...</p>
                </div>
            </div>;
        case 'inventory':
            return <div className="h-full w-full flex items-center justify-center p-6 bg-slate-800 text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Inventory</h1>
                    <p className="text-gray-400">Inventory page coming soon...</p>
                </div>
            </div>;
        case 'nemesis':
            return <div className="h-full w-full text-white relative overflow-hidden">
                {/* Nemesis Background */}
                <img 
                    src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis%20background%20(1).png?alt=media&token=46f4d50b-1ba7-4806-963d-d6635f6ff66f"
                    alt=""
                    className="absolute w-full object-cover"
                    style={{
                        top: '-50px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                    }}
                    loading="eager"
                    decoding="async"
                />
                {/* Nemesis Award */}
                <img 
                    src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis%20award.png?alt=media&token=823cc19e-13b8-4953-ab13-42635e1ca46d"
                    alt=""
                    className="absolute w-full object-cover"
                    style={{
                        top: '-50px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                    }}
                    loading="eager"
                    decoding="async"
                />
                {/* Nemesis Animation */}
                <div 
                    className="absolute"
                    style={{
                        zIndex: 2,
                        top: 'calc(50% - 140px)',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '350px',
                        height: '350px',
                    }}
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-contain"
                        style={{
                            transform: 'translateZ(0)',
                            willChange: 'transform',
                        }}
                    >
                        <source src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis-cocky.webm?alt=media&token=7b486f18-bbff-43dd-ace7-6713bec082f5" type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>;
        case 'profile':
            return <div className="h-full w-full flex items-center justify-center p-6 bg-slate-800 text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Profile</h1>
                    <p className="text-gray-400">Profile page coming soon...</p>
                </div>
            </div>;
        case 'messages':
            return <MessagesScreen />;
        default:
            console.warn('Unknown screen:', state.screen);
            return <IntroScreen />;
    }
}

const AppUI: React.FC = () => {
  const { state } = useAppState();
  const gameStore = useGameStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Show menu icon on all screens except intro and onboarding
  const showMenuIcon = state.screen !== 'intro' && state.screen !== 'onboarding';
  // Show flower icon on all screens except intro, onboarding, and profile
  const showFlowerIcon = state.screen !== 'intro' && state.screen !== 'onboarding' && state.screen !== 'profile';
  
  return (
    <div className="w-full min-h-screen bg-gray-900 font-sans flex items-center justify-center p-4" style={{ minHeight: '100vh' }}>
      <div className="relative w-full max-w-sm h-[95vh] max-h-[844px] bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Menu Icon - Top Left */}
        {showMenuIcon && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-4 left-4 z-50 p-2 hover:opacity-80 transition-opacity"
            style={{ zIndex: 50 }}
          >
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/menu-icon.png?alt=media&token=4e703bed-7e09-49f1-b663-386ba7513c7c" 
              alt="Menu" 
              className="w-8 h-8"
              loading="eager"
              decoding="async"
            />
          </button>
        )}
        
        {/* Settings Menu */}
        <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        
        {/* Flower Icon - Top Right */}
        {showFlowerIcon && (
          <div
            className="absolute top-4 right-4 z-50"
            style={{ zIndex: 50, width: '42px', height: '42px' }}
          >
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/flower%20(1).png?alt=media&token=af1a559d-e037-4ae1-a68a-0e0c7e7aaf68"
              alt="Level"
              className="absolute inset-0 w-full h-full object-contain"
              loading="eager"
              decoding="async"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs pointer-events-none">
              {gameStore.level}
            </span>
          </div>
        )}
        <main 
          className={`flex-grow hide-scrollbar ${state.screen === 'onboarding' && state.onboardingStep === 1 ? 'overflow-hidden' : 'overflow-y-auto'}`} 
          style={{ minHeight: 0, position: state.screen === 'onboarding' && state.onboardingStep === 1 ? 'relative' : 'static' }}
        >
          <ScreenRenderer />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AssetPreloader />
      <AppUI />
    </AppStateProvider>
  );
}