import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input className={`input ${className}`} {...props} />
      {error && <div className="text-accent mt-xs" style={{ color: 'var(--accent-error)' }}>{error}</div>}
    </div>
  );
};
