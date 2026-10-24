'use client';

import React, { useMemo } from 'react';
import { createQrMatrix } from './qrEngine';

interface QrCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  color?: string;
  bgColor?: string;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({
  value,
  size = 200,
  className = '',
  color = '#000000',
  bgColor = '#FFFFFF',
}) => {
  const matrix = useMemo(() => {
    try {
      return createQrMatrix(value, 'M', 2);
    } catch (e) {
      console.warn('QR matrix generation error:', e);
      return [];
    }
  }, [value]);

  if (!matrix || matrix.length === 0) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-white rounded-xl flex items-center justify-center animate-pulse ${className}`}
      >
        <span className="text-xs text-[#7A6363] font-medium">Generating QR...</span>
      </div>
    );
  }

  const moduleCount = matrix.length;
  const cellSize = size / moduleCount;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`rounded-2xl ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <rect width={size} height={size} fill={bgColor} rx={12} />
      {matrix.map((row, r) =>
        row.map((isDark, c) => {
          if (!isDark) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.05}
              height={cellSize + 0.05}
              fill={color}
            />
          );
        })
      )}
    </svg>
  );
};
