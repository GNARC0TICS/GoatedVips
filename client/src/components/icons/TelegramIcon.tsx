import React, { useState } from "react";

interface TelegramIconProps {
  className?: string;
  size?: number;
}

export const TelegramIcon: React.FC<TelegramIconProps> = ({ 
  className = "", 
  size = 24 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <g 
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2"
      >
        <path 
          strokeDasharray="20" 
          strokeDashoffset={isHovered ? "0" : "20"} 
          d="M21 5l-2.5 15M21 5l-12 8.5"
        >
          {isHovered && (
            <animate 
              fill="freeze" 
              attributeName="stroke-dashoffset" 
              dur="1s" 
              values="20;0" 
            />
          )}
        </path>
        <path 
          strokeDasharray="24" 
          strokeDashoffset={isHovered ? "0" : "24"} 
          d="M21 5l-19 7.5"
        >
          {isHovered && (
            <animate 
              fill="freeze" 
              attributeName="stroke-dashoffset" 
              dur="1s" 
              values="24;0" 
            />
          )}
        </path>
        <path 
          strokeDasharray="14" 
          strokeDashoffset={isHovered ? "0" : "14"} 
          d="M18.5 20l-9.5 -6.5"
        >
          {isHovered && (
            <animate 
              fill="freeze" 
              attributeName="stroke-dashoffset" 
              begin="1s" 
              dur="0.75s" 
              values="14;0" 
            />
          )}
        </path>
        <path 
          strokeDasharray="10" 
          strokeDashoffset={isHovered ? "0" : "10"} 
          d="M2 12.5l7 1"
        >
          {isHovered && (
            <animate 
              fill="freeze" 
              attributeName="stroke-dashoffset" 
              begin="1s" 
              dur="0.75s" 
              values="10;0" 
            />
          )}
        </path>
        <path 
          strokeDasharray="8" 
          strokeDashoffset={isHovered ? "0" : "8"} 
          d="M12 16l-3 3M9 13.5l0 5.5"
        >
          {isHovered && (
            <animate 
              fill="freeze" 
              attributeName="stroke-dashoffset" 
              begin="1.75s" 
              dur="0.75s" 
              values="8;0" 
            />
          )}
        </path>
      </g>
    </svg>
  );
};

export default TelegramIcon;