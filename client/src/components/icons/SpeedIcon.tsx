import React from 'react';

interface SpeedIconProps extends React.SVGProps<SVGSVGElement> {
  isAnimating?: boolean;
}

/**
 * SpeedIcon Component
 * 
 * A custom speed/gauge icon with animation capabilities
 */
export const SpeedIcon: React.FC<SpeedIconProps> = ({ isAnimating = false, ...svgProps }) => {
  const maskId = "lineMdSpeedTwotoneLoop" + Math.random().toString(36).substr(2, 5); // Generate unique ID

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...svgProps}>
      <mask id={maskId}>
        <path 
          fill="#fff" 
          fillOpacity="0" 
          stroke="#fff" 
          strokeDasharray="56" 
          strokeDashoffset="56" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M5 19v0c-0.3 0 -0.59 -0.15 -0.74 -0.41c-0.8 -1.34 -1.26 -2.91 -1.26 -4.59c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 1.68 -0.46 3.25 -1.26 4.59c-0.15 0.26 -0.44 0.41 -0.74 0.41Z"
        >
          {isAnimating && (
            <>
              <animate 
                fill="freeze" 
                attributeName="fill-opacity" 
                begin="0.3s" 
                dur="0.15s" 
                values="0;0.3"
              />
              <animate 
                fill="freeze" 
                attributeName="stroke-dashoffset" 
                dur="0.6s" 
                values="56;0"
              />
            </>
          )}
        </path>
        <g transform="rotate(-100 12 14)">
          <path d="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z">
            {isAnimating && (
              <animate 
                fill="freeze" 
                attributeName="d" 
                begin="0.4s" 
                dur="0.2s" 
                values="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z;M16 14C16 16.21 14.21 18 12 18C9.79 18 8 16.21 8 14C8 11.79 12 0 12 0C12 0 16 11.79 16 14Z"
              />
            )}
          </path>
          <path fill="#fff" d="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z">
            {isAnimating && (
              <animate 
                fill="freeze" 
                attributeName="d" 
                begin="0.4s" 
                dur="0.2s" 
                values="M12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14C12 14 12 14 12 14Z;M14 14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14C10 12.9 12 4 12 4C12 4 14 12.9 14 14Z"
              />
            )}
          </path>
          {isAnimating && (
            <animateTransform 
              attributeName="transform" 
              begin="0.4s" 
              dur="6s" 
              repeatCount="indefinite" 
              type="rotate" 
              values="-100 12 14;45 12 14;45 12 14;45 12 14;20 12 14;10 12 14;0 12 14;35 12 14;45 12 14;55 12 14;50 12 14;15 12 14;-20 12 14;-100 12 14"
            />
          )}
        </g>
      </mask>
      <rect width="24" height="24" fill="currentColor" mask={`url(#${maskId})`}/>
    </svg>
  );
};