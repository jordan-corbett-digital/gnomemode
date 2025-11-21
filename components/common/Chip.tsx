
import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`inline-block bg-green-500/20 text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full ${className}`}
    >
      {children}
    </div>
  );
};

export default Chip;
