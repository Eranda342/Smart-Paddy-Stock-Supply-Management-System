import React from 'react';
import logoUrl from '../../../assets/logo.svg';

export default function Logo({ size = 'md', showText = true, subtitle, className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-base', // Specifically for dashboards with subtitles text-base looks neat
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // Adjust text sizes if there is a subtitle (usually smaller logo text)
  const mainTextSize = subtitle && size === 'md' ? 'text-base' : textClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        bg-green-500 rounded-lg p-1.5 
        flex items-center justify-center shrink-0 
        shadow-[0_0_16px_rgba(34,197,94,0.35)]
      `}>
        <img src={logoUrl} alt="AgroBridge Logo" className="w-full h-full object-contain" />
      </div>
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`${mainTextSize} font-bold tracking-tight text-white/90 leading-tight`}>
            AgroBridge
          </span>
          {subtitle && (
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
