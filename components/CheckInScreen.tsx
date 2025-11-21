import React, { useState, useEffect } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';
import Card from './common/Card';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';
import { useCheckInStore } from '../stores/checkInStore';
import { generateGnomeMessage } from '../utils/ai';
import CheckInScheduleSetup from './CheckInScheduleSetup';
import CheckInFlow from './CheckInFlow';

const Confetti: React.FC = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#f43f5e', '#34d399', '#60a5fa'][i % 3],
                };
                return <div key={i} className="confetti" style={style}></div>;
            })}
        </div>
    );
};

export default function CheckInScreen() {
    const checkInStore = useCheckInStore();
    
    // If schedule not set up, show setup flow
    if (!checkInStore.schedule || !checkInStore.schedule.setupCompleted) {
        return <CheckInScheduleSetup />;
    }
    
    // Show standard check-in flow
    return <CheckInFlow />;
}

// Legacy check-in screen (keeping for reference, but CheckInFlow is now the main flow)
export function LegacyCheckInScreen() {
    const { state, dispatch } = useAppState();
    const userStore = useUserStore();
    const gameStore = useGameStore();
    
    const [view, setView] = useState<'initial' | 'success' | 'fail' | 'promise'>(gameStore.checkedInToday ? 'success' : 'initial');
    const [promiseText, setPromiseText] = useState('');
    const [gnomeMessage, setGnomeMessage] = useState<string>('');
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [leveledUp, setLeveledUp] = useState(false);

    const handleYes = async () => {
        const wasLevelUp = gameStore.checkInSuccess();
        setLeveledUp(wasLevelUp);
        
        // Generate AI message
        setIsLoadingMessage(true);
        try {
            const message = await generateGnomeMessage({
                tone: userStore.gnomeTone,
                gnomeName: userStore.gnomeName,
                context: wasLevelUp ? 'level_up' : 'checkin_success',
                userData: {
                    streak: gameStore.streak,
                    level: gameStore.level,
                    day: gameStore.day,
                },
            });
            setGnomeMessage(message);
        } catch (error) {
            console.error('Error generating message:', error);
            setGnomeMessage('Boom. Consistency is the best revenge.');
        } finally {
            setIsLoadingMessage(false);
        }
        
        setView('success');
        // Sync with old state for compatibility
        dispatch({ type: 'CHECK_IN_SUCCESS' });
    };

    const handleNo = async () => {
        const sliceAmount = userStore.wager / userStore.duration;
        gameStore.checkInFail(parseFloat(sliceAmount.toFixed(2)));
        setView('fail');
        
        // Generate AI message
        setIsLoadingMessage(true);
        try {
            const message = await generateGnomeMessage({
                tone: userStore.gnomeTone,
                gnomeName: userStore.gnomeName,
                context: 'checkin_fail',
                userData: {
                    streak: gameStore.streak,
                    day: gameStore.day,
                    nemesis: userStore.nemesis,
                },
            });
            setGnomeMessage(message);
        } catch (error) {
            console.error('Error generating message:', error);
            setGnomeMessage('Oof. Right in the wallet. Your nemesis sends their thanks.');
        } finally {
            setIsLoadingMessage(false);
        }
        
        // Sync with old state for compatibility
        dispatch({ type: 'CHECK_IN_FAIL', payload: { amount: parseFloat(sliceAmount.toFixed(2)) } });
    };
    
    const handlePromise = () => {
        if(promiseText.toLowerCase() === 'i will do better tomorrow') {
            gameStore.setGardenState('healthy' as any);
            dispatch({ type: 'FULFILL_PROMISE' });
            setView('promise');
        }
    };

    if (gameStore.checkedInToday && view !== 'fail' && view !== 'promise') {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-800 text-center">
                <Card>
                    <h2 className="text-2xl font-bold text-white">All done for today!</h2>
                    <p className="text-gray-300 mt-2">Your garden is tended. Come back tomorrow to check in again.</p>
                     <p className="mt-4 text-5xl">👍</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-800 text-center">
            {view === 'initial' && (
                <>
                    <h1 className="text-3xl font-bold text-white">Did you stick with it today?</h1>
                    <p className="text-gray-400 mt-2 text-xl">{userStore.intention.join(', ') || 'Your habits'}</p>
                    <div className="flex space-x-4 mt-12">
                        <Button onClick={handleYes} className="bg-green-500 hover:bg-green-600 text-white text-2xl px-12 py-6">YES</Button>
                        <Button onClick={handleNo} className="bg-red-500 hover:bg-red-600 text-white text-2xl px-12 py-6">NO</Button>
                    </div>
                </>
            )}

            {view === 'success' && (
                <div className="relative w-full h-full flex items-center justify-center">
                    <Confetti />
                    <Card className="text-center">
                        {leveledUp && (
                            <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border-2 border-yellow-500">
                                <h3 className="text-2xl font-bold text-yellow-400">LEVEL UP! 🎉</h3>
                                <p className="text-yellow-200">You're now Level {gameStore.level}!</p>
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-green-400">Success!</h2>
                        {isLoadingMessage ? (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400">Your gnome is reacting...</p>
                            </div>
                        ) : (
                            <p className="text-gray-300 mt-2 text-lg">"{gnomeMessage}"</p>
                        )}
                        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                            <div className="text-sm text-gray-400 mb-2">Rewards:</div>
                            <div className="flex justify-center gap-4 text-lg">
                                <span>+50 XP</span>
                                <span>+10 💰</span>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                            <img src={`https://picsum.photos/300/200?random=${gameStore.day}`} alt="Funny reward" className="rounded-lg" />
                        </div>
                    </Card>
                </div>
            )}
            
            {view === 'fail' && (
                <Card className="w-full max-w-sm">
                    <h2 className="text-3xl font-bold text-red-400">A Setback...</h2>
                    {isLoadingMessage ? (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400">Your gnome is reacting...</p>
                        </div>
                    ) : (
                        <p className="text-gray-300 mt-2 text-lg">"{gnomeMessage}"</p>
                    )}
                    
                    <div className="my-6 p-4 bg-slate-900 rounded-lg">
                        <p className="text-gray-400">Nemesis gets ${ (userStore.wager / userStore.duration).toFixed(2) } today (simulated).</p>
                        <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                            <div className="bg-red-500 h-4 rounded-full" style={{ width: `${(gameStore.stakeLost / userStore.wager) * 100}%` }}></div>
                        </div>
                        <p className="text-right text-sm text-gray-400 mt-1">${gameStore.stakeLost.toFixed(2)} / ${userStore.wager} lost</p>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-white">Promise Ritual</h3>
                    <p className="text-gray-400 text-sm mb-4">Type "I will do better tomorrow" to revive a sprout.</p>
                    <input
                        type="text"
                        value={promiseText}
                        onChange={(e) => setPromiseText(e.target.value)}
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-cyan-400"
                    />
                    <Button onClick={handlePromise} fullWidth className="mt-4" disabled={promiseText.toLowerCase() !== 'i will do better tomorrow'}>
                        Make the Promise
                    </Button>
                </Card>
            )}
            
            {view === 'promise' && (
                 <Card className="text-center">
                    <h2 className="text-3xl font-bold text-cyan-400">Promise Made.</h2>
                    <p className="text-gray-300 mt-2 text-lg">A single sprout revives. The garden has hope.</p>
                    <p className="mt-4 text-5xl">🌱</p>
                    <p className="text-gray-400 mt-4">See you tomorrow.</p>
                </Card>
            )}
        </div>
    );
}
