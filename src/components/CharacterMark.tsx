import React from 'react';

export type CharacterType = 'thinker' | 'creator' | 'reader' | 'focus' | 'sparkle' | 'coffee';

interface CharacterMarkProps {
  type?: CharacterType;
  color?: 'blue' | 'coral' | 'yellow' | 'sky';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CharacterMark: React.FC<CharacterMarkProps> = ({
  type = 'thinker',
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const borderColorMap = {
    blue: '#097fe8',
    coral: '#f64932',
    yellow: '#ffb110',
    sky: '#62aef0',
  };

  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const borderColor = borderColorMap[color];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-white shrink-0 shadow-none transition-transform hover:scale-105 select-none ${sizeMap[size]} ${className}`}
      style={{
        border: `2px solid ${borderColor}`,
      }}
      title={`Notion Companion: ${type}`}
    >
      {type === 'thinker' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Glasses & face doodle */}
          <circle cx="9" cy="11" r="2.5" />
          <circle cx="15" cy="11" r="2.5" />
          <path d="M11.5 11h1" />
          <path d="M9 16c1.5 1 4.5 1 6 0" />
          <path d="M7 6c2-1.5 8-1.5 10 0" />
        </svg>
      )}
      {type === 'creator' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Pencil & creative wink */}
          <path d="M18 4l2 2L7 19l-4 1 1-4L18 4z" />
          <path d="M15 7l2 2" />
        </svg>
      )}
      {type === 'reader' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Open Notebook */}
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
      )}
      {type === 'focus' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Calm smile doodle */}
          <circle cx="9" cy="10" r="1" fill="currentColor" />
          <circle cx="15" cy="10" r="1" fill="currentColor" />
          <path d="M8 14.5c2 2 6 2 8 0" />
        </svg>
      )}
      {type === 'sparkle' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
        </svg>
      )}
      {type === 'coffee' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      )}
    </div>
  );
};

export const HandDrawnSquiggle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 64 12" fill="none" className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6C9 1.5 15 10.5 22 6C29 1.5 35 10.5 42 6C49 1.5 55 10.5 62 6" stroke="#ffb110" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
