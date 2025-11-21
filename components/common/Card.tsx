
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-slate-700/50 p-6 rounded-xl shadow-lg border border-slate-600 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
