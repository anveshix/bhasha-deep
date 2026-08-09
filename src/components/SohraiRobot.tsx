import React from 'react';

export const SohraiRobot = React.memo(({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
      </linearGradient>
      <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
         <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
         <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
      </radialGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      {/* Tribal Pattern Path Definitions */}
      <pattern id="sohraiPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M0,20 L20,0 L40,20 L20,40 Z" fill="none" stroke="#d97706" strokeWidth="2" strokeOpacity="0.3" />
        <circle cx="20" cy="20" r="3" fill="#fbbf24" fillOpacity="0.3" />
        <path d="M10,20 L30,20 M20,10 L20,30" stroke="#fef3c7" strokeWidth="1" strokeOpacity="0.2" />
      </pattern>
    </defs>

    {/* Hover animation group */}
    <g style={{ animation: 'float 6s ease-in-out infinite' }}>
      {/* Background / Halo */}
      <circle cx="200" cy="180" r="140" fill="url(#coreGlow)" opacity="0.05" filter="url(#glow)" />
      
      {/* Floating base rings (Techno-tribal) */}
      <ellipse cx="200" cy="320" rx="60" ry="15" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10, 5" opacity="0.6" style={{ animation: 'spin-slow 10s linear infinite', transformOrigin: '200px 320px' }} />
      <ellipse cx="200" cy="330" rx="80" ry="20" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />

      {/* Main Body (Curved organic shape) */}
      <path d="M 140 220 C 140 300, 260 300, 260 220 C 280 140, 120 140, 140 220 Z" fill="#8a3324" />
      <path d="M 140 220 C 140 300, 260 300, 260 220 C 280 140, 120 140, 140 220 Z" fill="url(#sohraiPattern)" />
      
      {/* Belt / Tribal Band */}
      <path d="M 145 220 Q 200 240, 255 220" fill="none" stroke="#fef3c7" strokeWidth="8" />
      <path d="M 150 220 L 160 210 L 170 225 L 180 210 L 190 225 L 200 210 L 210 225 L 220 210 L 230 225 L 240 210 L 250 220" fill="none" stroke="#fbbf24" strokeWidth="2" />

      {/* Core AI Heart */}
      <circle cx="200" cy="200" r="25" fill="url(#coreGlow)" filter="url(#glow)">
        <animate attributeName="r" values="25; 28; 25" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="200" r="10" fill="#ffffff" opacity="0.8" />
      {/* Sohrai leaf inside core */}
      <path d="M 195 200 Q 200 190, 205 200 Q 200 210, 195 200 Z" fill="#020617" />

      {/* Head */}
      <path d="M 120 120 C 120 60, 280 60, 280 120 C 280 150, 250 170, 200 170 C 150 170, 120 150, 120 120 Z" fill="#3e2723" />
      
      {/* Forehead tribal mark */}
      <path d="M 200 80 L 190 95 L 210 95 Z" fill="#fbbf24" />
      <circle cx="200" cy="70" r="3" fill="#fef3c7" />

      {/* Eyes (Glowing Amber) */}
      <g>
        <rect x="150" y="110" width="35" height="15" rx="7" fill="url(#eyeGlow)" filter="url(#glow)">
           <animate attributeName="height" values="15; 2; 15; 15; 15" dur="4s" repeatCount="indefinite" keyTimes="0; 0.05; 0.1; 0.5; 1" />
           <animate attributeName="y" values="110; 116.5; 110; 110; 110" dur="4s" repeatCount="indefinite" keyTimes="0; 0.05; 0.1; 0.5; 1" />
        </rect>
        <rect x="215" y="110" width="35" height="15" rx="7" fill="url(#eyeGlow)" filter="url(#glow)">
           <animate attributeName="height" values="15; 2; 15; 15; 15" dur="4s" repeatCount="indefinite" keyTimes="0; 0.05; 0.1; 0.5; 1" />
           <animate attributeName="y" values="110; 116.5; 110; 110; 110" dur="4s" repeatCount="indefinite" keyTimes="0; 0.05; 0.1; 0.5; 1" />
        </rect>
        {/* Pupils */}
        <circle cx="167" cy="117" r="4" fill="#ffffff" opacity="0.6" />
        <circle cx="232" cy="117" r="4" fill="#ffffff" opacity="0.6" />
      </g>

      {/* Ears/Sensors */}
      <path d="M 110 110 L 120 100 L 120 130 Z" fill="#d97706" />
      <path d="M 290 110 L 280 100 L 280 130 Z" fill="#d97706" />
      
      {/* Floating Hands */}
      <g style={{ animation: 'float 4s ease-in-out infinite reverse' }}>
        <path d="M 90 200 C 70 200, 70 240, 90 240 C 110 240, 110 200, 90 200 Z" fill="#3e2723" />
        <circle cx="90" cy="220" r="10" fill="#06b6d4" opacity="0.8" filter="url(#glow)" />
      </g>
      <g style={{ animation: 'float 4.5s ease-in-out infinite' }}>
        <path d="M 310 200 C 330 200, 330 240, 310 240 C 290 240, 290 200, 310 200 Z" fill="#3e2723" />
        <circle cx="310" cy="220" r="10" fill="#06b6d4" opacity="0.8" filter="url(#glow)" />
      </g>
      
    </g>
    
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
      @keyframes spin-slow {
        100% { transform: rotate(360deg); }
      }
    `}} />
  </svg>
));
