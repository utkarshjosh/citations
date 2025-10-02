import React from 'react';
import logoIcon from '@assets/logo.svg';

const LogoIcon = ({ size = 24, color = '#333', style = {} }) => {
  return (
    <div style={style}>
      <img
        src={logoIcon}
        alt="Logo"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    </div>
  );
};

export default LogoIcon;
