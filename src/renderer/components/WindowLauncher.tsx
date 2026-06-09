import React from 'react';
import { WindowType } from '@shared/types';

interface WindowLauncherProps {
  currentWindow?: WindowType;
}

const WINDOW_ITEMS: { type: WindowType; label: string; icon: string }[] = [
  { type: WindowType.VENUE_EDITOR, label: '场地编辑', icon: '🏗️' },
  { type: WindowType.STAGE_LIBRARY, label: '舞台库', icon: '🎭' },
  { type: WindowType.SCHEDULE, label: '节目排程', icon: '📅' },
  { type: WindowType.AUDIENCE, label: '观众互动', icon: '💬' },
  { type: WindowType.TICKETING, label: '票务入口', icon: '🎫' },
  { type: WindowType.REHEARSAL, label: '彩排模式', icon: '🎬' },
  { type: WindowType.PLAYBACK, label: '数据回放', icon: '📊' }
];

export const WindowLauncher: React.FC<WindowLauncherProps> = ({ currentWindow }) => {
  const handleOpenWindow = async (type: WindowType) => {
    if (window.electronAPI) {
      await window.electronAPI.openWindow(type);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">🎵 Metaverse Festival</h1>
        <p className="text-muted mt-xs" style={{ fontSize: 'var(--font-xs)' }}>
          元宇宙音乐节控制台
        </p>
      </div>
      <div className="sidebar-content">
        {WINDOW_ITEMS.map((item) => (
          <div
            key={item.type}
            className={`nav-item ${currentWindow === item.type ? 'active' : ''}`}
            onClick={() => handleOpenWindow(item.type)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
        <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
          v1.0.0 · 2026 音乐节
        </div>
      </div>
    </aside>
  );
};
