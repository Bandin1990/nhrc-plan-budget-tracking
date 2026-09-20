import React from 'react';

interface NhrcLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * ตราสัญลักษณ์ทางการ สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ (กสม.)
 * Office of the National Human Rights Commission of Thailand (NHRC)
 */
export const NhrcLogo: React.FC<NhrcLogoProps> = ({ 
  className = 'w-10 h-10', 
  size,
  alt = 'ตราสัญลักษณ์ สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ' 
}) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;
  
  return (
    <img 
      src="/nhrc-logo.png" 
      alt={alt}
      style={style}
      className={`object-contain shrink-0 ${className}`}
      loading="eager"
    />
  );
};
