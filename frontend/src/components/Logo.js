import React from 'react';
import { GraduationCap } from 'lucide-react';

const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', wrap: 'w-8 h-8' },
    md: { icon: 'w-5 h-5', text: 'text-xl', wrap: 'w-9 h-9' },
    lg: { icon: 'w-8 h-8', text: 'text-2xl', wrap: 'w-14 h-14' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3" data-testid="studyvault-logo">
      <div
        className={`${s.wrap} rounded-md bg-gradient-to-br from-[#00f0ff] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#00f0ff]/20`}
      >
        <GraduationCap className={`${s.icon} text-white`} strokeWidth={2.5} />
      </div>
      {showText && (
        <div className={`${s.text} font-bold tracking-tight`}>
          <span className="text-white">Study</span>
          <span className="bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] bg-clip-text text-transparent">Vault</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
