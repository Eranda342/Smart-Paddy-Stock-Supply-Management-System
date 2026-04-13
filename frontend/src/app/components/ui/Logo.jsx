import React from 'react';
import logo from '../../../assets/navbar.svg';

export const Logo = ({ layout = "sidebar" }) => {
  return (
    <div className="flex items-center shrink-0">
      <img 
        src={logo} 
        alt="AgroBridge" 
        className={`${
          layout === 'navbar' ? 'h-10 md:h-12 scale-[1.75]' : 'h-10 w-auto scale-[1.8]'
        } object-contain drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] mx-2`}
      />
      <span className={`text-white font-bold tracking-wide ml-2 ${
        layout === 'navbar' ? 'text-xl md:text-2xl' : 'text-lg'
      }`}>
        AgroBridge
      </span>
    </div>
  );
};
