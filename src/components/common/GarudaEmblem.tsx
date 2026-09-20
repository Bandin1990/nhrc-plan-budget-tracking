import React from 'react';

interface GarudaEmblemProps {
  className?: string;
  size?: number; // in px or mm
}

export const GarudaEmblem: React.FC<GarudaEmblemProps> = ({ className = 'w-16 h-16', size }) => {
  const basePath = import.meta.env.BASE_URL || '/';
  const garudaSrc = `${basePath.endsWith('/') ? basePath : basePath + '/'}garuda.png`;

  return (
    <div className={`flex items-center justify-start ${className}`}>
      {/* Official Thai Government Garuda Emblem (ตราครุฑราชการไทยจริง) */}
      <img
        src={garudaSrc}
        alt="ตราครุฑราชการไทย"
        className="object-contain select-none pointer-events-none"
        style={size ? { height: `${size}px`, width: 'auto' } : undefined}
      />
    </div>
  );
};
