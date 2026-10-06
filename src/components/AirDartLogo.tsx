'use client';

import React from 'react';

interface AirDartLogoProps {
  height?: number;
  textColor?: string;
  dartColor?: string;
  className?: string;
}

export const AirDartLogo: React.FC<AirDartLogoProps> = ({
  height = 36,
  textColor = '#3B2A2A',
  dartColor = '#FF6363',
  className = '',
}) => {
  const width = (height * 920) / 260;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 920 260"
      width={width}
      height={height}
      className={className}
    >
      {/* 45-Degree Rotated Paper-Dart "A" Icon */}
      <g transform="translate(145, 130) rotate(42) translate(-115, -115)">
        <path
          d="M 115 12
             C 118 12 121 15 123 19
             L 190 178
             L 158 164
             L 144 196
             L 126 136
             L 104 136
             L 86 196
             L 72 164
             L 40 178
             C 38 174 39 169 42 164
             L 107 19
             C 109 15 112 12 115 12 Z
             M 115 48
             L 138 112
             L 92 112 Z"
          fill={dartColor}
          fillRule="evenodd"
        />
      </g>

      {/* "irDart" Wordmark */}
      <text
        x="250"
        y="172"
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: '138px',
          fill: textColor,
          letterSpacing: '-3px',
        }}
      >
        irDart
      </text>
    </svg>
  );
};

export const AirDartIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 28,
  color = '#FF6363',
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 230 230"
      width={size}
      height={size}
      className={className}
    >
      <g transform="translate(115, 115) rotate(42) translate(-115, -115)">
        <path
          d="M 115 12
             C 118 12 121 15 123 19
             L 190 178
             L 158 164
             L 144 196
             L 126 136
             L 104 136
             L 86 196
             L 72 164
             L 40 178
             C 38 174 39 169 42 164
             L 107 19
             C 109 15 112 12 115 12 Z
             M 115 48
             L 138 112
             L 92 112 Z"
          fill={color}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
};
