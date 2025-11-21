import React, { useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';

// Updated colors to match the new vibrant design reference
const MUSHROOM_COLORS = [
    { name: 'gray', base: '#E0E0E0', spot: '#BDBDBD', ring: '#9E9E9E' },
    { name: 'orange', base: '#FFCC80', spot: '#FFA726', ring: '#FB8C00' },
    { name: 'purple', base: '#CE93D8', spot: '#BA68C8', ring: '#AB47BC' },
    { name: 'pink', base: '#F48FB1', spot: '#F06292', ring: '#EC407A' },
    { name: 'green', base: '#A5D6A7', spot: '#81C784', ring: '#66BB6A' },
    { name: 'blue', base: '#90CAF9', spot: '#64B5F6', ring: '#42A5F5' },
];

// Re-styled component to better match the new design reference
const CentralMushroom: React.FC<{ color: typeof MUSHROOM_COLORS[0] }> = ({ color }) => (
    <div className="relative w-36 h-36 flex flex-col items-center justify-end drop-shadow-xl">
        {/* Cap */}
        <div 
            className="absolute top-0 w-full h-28 rounded-t-full z-10 overflow-hidden" 
            style={{ 
                background: `linear-gradient(180deg, ${color.spot} 0%, ${color.base} 100%)`,
                boxShadow: `inset 0 -10px 12px -5px rgba(0,0,0,0.15)`
            }}
        >
            {/* Spots with a slight glow */}
            <div className="absolute w-7 h-7 rounded-full" style={{ top: '25%', left: '20%', backgroundColor: 'rgba(255,255,255,0.7)', boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}></div>
            <div className="absolute w-4 h-4 rounded-full" style={{ top: '55%', left: '10%', backgroundColor: 'rgba(255,255,255,0.7)', boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}></div>
            <div className="absolute w-6 h-6 rounded-full" style={{ top: '45%', right: '15%', backgroundColor: 'rgba(255,255,255,0.7)', boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}></div>
             <div className="absolute w-4 h-4 rounded-full" style={{ bottom: '15%', left: '40%', backgroundColor: 'rgba(255,255,255,0.7)', boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}></div>
        </div>
        {/* Stem */}
        <div 
            className="w-14 h-20 rounded-b-2xl"
            style={{
                 background: `linear-gradient(to top, ${color.base}, #FFFFFF)`,
                 filter: 'brightness(0.95)',
                 boxShadow: `inset 4px 0 10px -4px rgba(0,0,0,0.2)`
            }}
        ></div>
    </div>
);


export default function ChooseMushroomScreen() {
    const { dispatch } = useAppState();
    const [selectedMushroom, setSelectedMushroom] = useState(MUSHROOM_COLORS[5]); // default to blue

    const radius = 120; // Increased radius for a wider circle

    return (
        // Increased vertical padding to py-24 to make the content block more compact on tall screens
        <div className="h-full w-full flex flex-col justify-between px-8 py-24 text-center bg-gradient-to-b from-blue-200 to-blue-100">
            
            {/* Item 1: Header Text Block */}
            <div>
                <h1 className="text-5xl font-bold text-slate-900">Pick Your Mushroom</h1>
                <p className="text-lg text-slate-600 mt-3">Each mushroom carries its own strange energy. Pick your poison.</p>
            </div>
            
            {/* Item 2: Mushroom Selection Wheel */}
            <div className="relative w-80 h-80 flex items-center justify-center mx-auto">
                {/* Central Mushroom */}
                <div className="absolute z-10 transition-transform duration-300">
                    <CentralMushroom color={selectedMushroom} />
                </div>

                {/* Mushrooms in a circle */}
                {MUSHROOM_COLORS.map((color, index) => {
                    const angle = (index / MUSHROOM_COLORS.length) * 2 * Math.PI - (Math.PI / 2); // Start from top
                    const x = Math.round(radius * Math.cos(angle));
                    const y = Math.round(radius * Math.sin(angle));
                    const isSelected = selectedMushroom.name === color.name;

                    return (
                        <div
                            key={color.name}
                            className="absolute top-1/2 left-1/2 transition-transform duration-300"
                            style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${isSelected ? 1.15 : 1})` }}
                        >
                            <button
                                onClick={() => setSelectedMushroom(color)}
                                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? `ring-4 ring-offset-2 ring-offset-blue-100` : 'shadow-lg'}`}
                                // FIX: 'ringColor' is not a valid CSS property. Using '--tw-ring-color' CSS custom property to work with Tailwind's ring utilities.
                                // The style object is cast to React.CSSProperties to allow for custom CSS properties.
                                style={{ '--tw-ring-color': isSelected ? color.ring : 'transparent' } as React.CSSProperties}
                                aria-label={`Select ${color.name} mushroom`}
                            >
                                <div 
                                    className="w-full h-full rounded-full relative overflow-hidden"
                                    style={{ backgroundColor: color.base }}
                                >
                                    {/* Spots */}
                                    <div className="absolute w-3 h-3 rounded-full" style={{ top: '25%', left: '30%', backgroundColor: color.spot }}></div>
                                    <div className="absolute w-2 h-2 rounded-full" style={{ bottom: '30%', left: '60%', backgroundColor: color.spot }}></div>
                                    <div className="absolute w-3.5 h-3.5 rounded-full" style={{ bottom: '45%', right: '20%', backgroundColor: color.spot }}></div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {/* Item 3: CTA Button Block */}
            <div className="w-full">
                <Button 
                    // FIX: Replaced non-existent 'SET_GNOME_COLOR_AND_PROCEED' action with existing actions to set data and advance the onboarding flow. This also resolves the payload type error.
                    onClick={() => {
                        dispatch({ type: 'SET_ONBOARDING_DATA', payload: { gnomeColor: selectedMushroom.name } });
                        dispatch({ type: 'NEXT_ONBOARDING_STEP' });
                    }} 
                    fullWidth
                    className="text-xl"
                >
                    Eat it
                </Button>
            </div>
        </div>
    );
}