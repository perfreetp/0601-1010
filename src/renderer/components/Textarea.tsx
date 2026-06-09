import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <textarea className={`input textarea ${className}`} {...props} />
    </div>
  );
};
