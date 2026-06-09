import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-sm">
      <div
        className={`switch ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <div className="switch-knob" />
      </div>
      {label && <span className="text-secondary">{label}</span>}
    </div>
  );
};
