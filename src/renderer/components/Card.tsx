import React from 'react';

interface CardProps {
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, actions, className = '', children }) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="flex gap-sm">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
