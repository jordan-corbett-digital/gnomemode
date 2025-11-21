
import React from 'react';
import { useAppState } from '../App';
import Card from './common/Card';
import { GNOME_QUOTES } from '../constants';

const ReportCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="mb-4">
    <h3 className="font-bold text-lg text-pink-400">{title}</h3>
    <div className="mt-2">{children}</div>
  </Card>
);

export default function ReportScreen() {
  const { state } = useAppState();
  const { garden, onboardingData } = state;
  
  const honestyPercentage = garden.day > 1 ? Math.round((garden.streak / (garden.day -1)) * 100) : 100;
  const stakeSaved = onboardingData.wager - garden.stakeLost;
  const nemesisMeter = (garden.stakeLost / onboardingData.wager) * 100;
  
  const gnomeNote = GNOME_QUOTES.report[Math.floor(Math.random() * GNOME_QUOTES.report.length)];

  return (
    <div className="h-full w-full flex flex-col p-6 bg-slate-900 overflow-y-auto">
      <h1 className="text-4xl font-bold text-white mb-6 text-center">Spite Report</h1>
      
      <ReportCard title="Streak">
        <p className="text-3xl font-bold text-white">{garden.streak} days</p>
        <p className="text-gray-400">Your current run of success.</p>
      </ReportCard>
      
      <ReportCard title="Honesty %">
        <p className="text-3xl font-bold text-white">{honestyPercentage}%</p>
        <p className="text-gray-400">How often you're sticking to it.</p>
      </ReportCard>
      
      <ReportCard title="Stake Saved vs Lost">
        <div className="space-y-2">
            <div>
                <p className="text-green-400 font-semibold">${stakeSaved.toFixed(2)} Saved</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(stakeSaved / onboardingData.wager) * 100}%` }}></div>
                </div>
            </div>
            <div>
                <p className="text-red-400 font-semibold">${garden.stakeLost.toFixed(2)} Lost</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${nemesisMeter}%` }}></div>
                </div>
            </div>
        </div>
      </ReportCard>
      
      <ReportCard title="Nemesis Meter">
        <p className="text-gray-300">How much joy you've given them:</p>
        <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div className="bg-purple-500 h-4 rounded-full text-center text-xs text-white" style={{ width: `${nemesisMeter}%` }}>
               {nemesisMeter.toFixed(0)}%
            </div>
        </div>
      </ReportCard>
      
       <ReportCard title="Gnome's Note">
        <p className="text-lg italic text-gray-300">"{gnomeNote}"</p>
      </ReportCard>

    </div>
  );
}
