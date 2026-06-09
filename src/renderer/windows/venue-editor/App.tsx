import React, { useState, useRef, useCallback } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, StageComponent, LightPreset, SponsorBooth } from '@shared/types';

const COMPONENT_LIBRARY = [
  { type: 'main-stage' as const, name: '主舞台', icon: '🎪', defaultSize: { w: 300, h: 180 } },
  { type: 'sub-stage' as const, name: '副舞台', icon: '🎭', defaultSize: { w: 200, h: 140 } },
  { type: 'dj-booth' as const, name: 'DJ台', icon: '🎧', defaultSize: { w: 100, h: 100 } },
  { type: 'led-wall' as const, name: 'LED大屏', icon: '📺', defaultSize: { w: 250, h: 100 } },
  { type: 'speaker' as const, name: '扬声器', icon: '🔊', defaultSize: { w: 40, h: 80 } },
  { type: 'light' as const, name: '灯光设备', icon: '💡', defaultSize: { w: 30, h: 30 } },
  { type: 'seat' as const, name: '观众席', icon: '💺', defaultSize: { w: 200, h: 150 } },
  { type: 'entrance' as const, name: '入口', icon: '🚪', defaultSize: { w: 80, h: 60 } },
  { type: 'vip-area' as const, name: 'VIP区', icon: '👑', defaultSize: { w: 150, h: 120 } }
];

const LIGHT_PATTERNS = [
  { value: 'static', label: '静态' },
  { value: 'pulse', label: '脉冲' },
  { value: 'wave', label: '波浪' },
  { value: 'rainbow', label: '彩虹' },
  { value: 'strobe', label: '频闪' }
];

const getComponentColor = (type: StageComponent['type']): string => {
  const colors: Record<string, string> = {
    'main-stage': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    'sub-stage': 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'dj-booth': 'linear-gradient(135deg, #f43f5e, #ec4899)',
    'led-wall': 'linear-gradient(135deg, #10b981, #14b8a6)',
    'speaker': 'linear-gradient(135deg, #f59e0b, #ef4444)',
    'light': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    'seat': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'entrance': 'linear-gradient(135deg, #14b8a6, #06b6d4)',
    'vip-area': 'linear-gradient(135deg, #f43f5e, #f59e0b)',
    'booth': 'linear-gradient(135deg, #8b5cf6, #ec4899)'
  };
  return colors[type] || 'var(--bg-card)';
};

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'components' | 'lights' | 'booths' | 'schemes'>('components');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddPresetModal, setShowAddPresetModal] = useState(false);
  const [showAddBoothModal, setShowAddBoothModal] = useState(false);
  const [showSaveSchemeModal, setShowSaveSchemeModal] = useState(false);
  const [schemeName, setSchemeName] = useState('');
  const [dragging, setDragging] = useState<{ type: string; offsetX: number; offsetY: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newPreset, setNewPreset] = useState<Partial<LightPreset>>({
    name: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4',
    ambientColor: '#0a0a1a',
    intensity: 0.8,
    pattern: 'static'
  });
  const [newBooth, setNewBooth] = useState<Partial<SponsorBooth>>({
    sponsorName: '',
    description: '',
    x: 100,
    y: 100,
    width: 120,
    height: 80
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    components,
    addComponent,
    updateComponent,
    removeComponent,
    lightPresets,
    activeLightPreset,
    addLightPreset,
    setActiveLightPreset,
    sponsorBooths,
    addSponsorBooth,
    updateSponsorBooth,
    removeSponsorBooth,
    schemes,
    saveScheme,
    loadScheme
  } = useFestivalStore();

  const activePreset = lightPresets.find((p) => p.id === activeLightPreset);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('componentType', type);
    setDragging({ type, offsetX: 0, offsetY: 0 });
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleCanvasDragLeave = () => {
    setIsDragOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const type = e.dataTransfer.getData('componentType') as StageComponent['type'];
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 40;

    const libItem = COMPONENT_LIBRARY.find((c) => c.type === type);
    if (!libItem) return;

    addComponent({
      type,
      name: libItem.name,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: libItem.defaultSize.w,
      height: libItem.defaultSize.h,
      rotation: 0,
      properties: {}
    });
    setDragging(null);
  };

  const handleComponentMouseDown = (e: React.MouseEvent, comp: StageComponent) => {
    e.stopPropagation();
    setSelectedId(comp.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startCompX = comp.x;
    const startCompY = comp.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateComponent(comp.id, {
        x: Math.max(0, startCompX + dx),
        y: Math.max(0, startCompY + dy)
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleExportMap = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.exportMap();
      if (!result.canceled) {
        alert(`活动地图已导出到: ${result.filePath}`);
      }
    }
  };

  const handleSaveScheme = () => {
    if (schemeName.trim()) {
      saveScheme(schemeName.trim());
      setSchemeName('');
      setShowSaveSchemeModal(false);
    }
  };

  const handleAddPreset = () => {
    if (newPreset.name) {
      addLightPreset(newPreset as Omit<LightPreset, 'id'>);
      setNewPreset({
        name: '',
        primaryColor: '#8b5cf6',
        secondaryColor: '#06b6d4',
        ambientColor: '#0a0a1a',
        intensity: 0.8,
        pattern: 'static'
      });
      setShowAddPresetModal(false);
    }
  };

  const handleAddBooth = () => {
    if (newBooth.sponsorName) {
      addSponsorBooth(newBooth as Omit<SponsorBooth, 'id'>);
      setNewBooth({ sponsorName: '', description: '', x: 100, y: 100, width: 120, height: 80 });
      setShowAddBoothModal(false);
    }
  };

  const selectedComponent = components.find((c) => c.id === selectedId);
  const selectedBooth = sponsorBooths.find((b) => b.id === selectedId);

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.VENUE_EDITOR} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">🏗️ 场地编辑器</h1>
          <div className="topbar-actions">
            <Button variant="secondary" icon="📤" onClick={handleExportMap}>导出地图</Button>
            <Button variant="primary" icon="💾" onClick={() => setShowSaveSchemeModal(true)}>保存方案</Button>
          </div>
        </div>
        <div className="flex" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="sidebar" style={{ width: 260 }}>
            <div className="tabs">
              <div className={`tab ${selectedTab === 'components' ? 'active' : ''}`} onClick={() => setSelectedTab('components')}>组件</div>
              <div className={`tab ${selectedTab === 'lights' ? 'active' : ''}`} onClick={() => setSelectedTab('lights')}>灯光</div>
              <div className={`tab ${selectedTab === 'booths' ? 'active' : ''}`} onClick={() => setSelectedTab('booths')}>展位</div>
              <div className={`tab ${selectedTab === 'schemes' ? 'active' : ''}`} onClick={() => setSelectedTab('schemes')}>方案</div>
            </div>
            <div className="sidebar-content">
              {selectedTab === 'components' && (
                <div className="grid grid-cols-2 gap-sm">
                  {COMPONENT_LIBRARY.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type)}
                      className="card"
                      style={{ padding: 'var(--spacing-sm)', cursor: 'grab', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--spacing-xs)' }}>{item.icon}</div>
                      <div style={{ fontSize: 'var(--font-xs)' }}>{item.name}</div>
                    </div>
                  ))}
                </div>
              )}
              {selectedTab === 'lights' && (
                <div>
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-secondary text-sm">预设方案</span>
                    <Button variant="primary" size="sm" icon="+" onClick={() => setShowAddPresetModal(true)}>新建</Button>
                  </div>
                  {lightPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setActiveLightPreset(preset.id)}
                      className="list-item"
                      style={{
                        borderColor: activeLightPreset === preset.id ? 'var(--accent-primary)' : undefined,
                        cursor: 'pointer',
                        padding: 'var(--spacing-sm)',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px', marginRight: 'var(--spacing-sm)' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: preset.primaryColor }} />
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: preset.secondaryColor }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
                          {LIGHT_PATTERNS.find((p) => p.value === preset.pattern)?.label} · {Math.round(preset.intensity * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedTab === 'booths' && (
                <div>
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-secondary text-sm">赞助展位</span>
                    <Button variant="primary" size="sm" icon="+" onClick={() => setShowAddBoothModal(true)}>添加</Button>
                  </div>
                  {sponsorBooths.map((booth) => (
                    <div
                      key={booth.id}
                      onClick={() => setSelectedId(booth.id)}
                      className="list-item"
                      style={{
                        borderColor: selectedId === booth.id ? 'var(--accent-primary)' : undefined,
                        cursor: 'pointer',
                        padding: 'var(--spacing-sm)',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{booth.sponsorName}</div>
                        <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>{booth.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedTab === 'schemes' && (
                <div>
                  <div className="text-secondary text-sm mb-sm">已保存方案</div>
                  {schemes.map((scheme) => (
                    <div key={scheme.id} className="list-item" style={{ padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                      <div className="flex-1">
                        <div className="font-medium">{scheme.name}</div>
                        <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
                          {new Date(scheme.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => loadScheme(scheme.id)}>加载</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" style={{ padding: 'var(--spacing-lg)', overflow: 'auto' }}>
            <div
              ref={canvasRef}
              className={`canvas-container drop-target ${isDragOver ? 'drag-over' : ''}`}
              style={{ width: 1200, height: 800, margin: '0 auto', position: 'relative' }}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              onClick={() => setSelectedId(null)}
            >
              <div className="canvas-grid" />
              {activePreset && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 30%, ${activePreset.primaryColor}40, ${activePreset.ambientColor}80 70%)`,
                    pointerEvents: 'none',
                    transition: 'all 0.5s ease'
                  }}
                />
              )}
              {components.map((comp) => (
                <div
                  key={comp.id}
                  onMouseDown={(e) => handleComponentMouseDown(e, comp)}
                  className="draggable-item"
                  style={{
                    position: 'absolute',
                    left: comp.x,
                    top: comp.y,
                    width: comp.width,
                    height: comp.height,
                    background: getComponentColor(comp.type),
                    border: selectedId === comp.id ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    fontWeight: 600,
                    boxShadow: selectedId === comp.id ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                    zIndex: selectedId === comp.id ? 10 : 1
                  }}
                >
                  <div style={{ fontSize: Math.min(comp.width, comp.height) * 0.3 }}>
                    {COMPONENT_LIBRARY.find((c) => c.type === comp.type)?.icon}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', marginTop: '2px' }}>{comp.name}</div>
                </div>
              ))}
              {sponsorBooths.map((booth) => (
                <div
                  key={booth.id}
                  onClick={() => setSelectedId(booth.id)}
                  style={{
                    position: 'absolute',
                    left: booth.x,
                    top: booth.y,
                    width: booth.width,
                    height: booth.height,
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    border: selectedId === booth.id ? '3px solid #fff' : '2px dashed rgba(255,255,255,0.5)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    zIndex: selectedId === booth.id ? 10 : 1
                  }}
                >
                  <div style={{ fontSize: 'var(--font-md)' }}>🏢</div>
                  <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>{booth.sponsorName}</div>
                </div>
              ))}
            </div>
          </div>
          {selectedComponent && (
            <div className="sidebar" style={{ width: 280 }}>
              <div className="sidebar-header">
                <h3 className="sidebar-title">属性设置</h3>
              </div>
              <div className="sidebar-content" style={{ padding: 'var(--spacing-md)' }}>
                <Input label="名称" value={selectedComponent.name} onChange={(e) => updateComponent(selectedComponent.id, { name: e.target.value })} />
                <div className="grid grid-cols-2 gap-sm">
                  <Input label="X" type="number" value={selectedComponent.x} onChange={(e) => updateComponent(selectedComponent.id, { x: Number(e.target.value) })} />
                  <Input label="Y" type="number" value={selectedComponent.y} onChange={(e) => updateComponent(selectedComponent.id, { y: Number(e.target.value) })} />
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <Input label="宽度" type="number" value={selectedComponent.width} onChange={(e) => updateComponent(selectedComponent.id, { width: Number(e.target.value) })} />
                  <Input label="高度" type="number" value={selectedComponent.height} onChange={(e) => updateComponent(selectedComponent.id, { height: Number(e.target.value) })} />
                </div>
                <Input label="旋转角度" type="number" value={selectedComponent.rotation} onChange={(e) => updateComponent(selectedComponent.id, { rotation: Number(e.target.value) })} />
                <div className="mt-lg">
                  <Button variant="danger" block icon="🗑️" onClick={() => { removeComponent(selectedComponent.id); setSelectedId(null); }}>
                    删除组件
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedBooth && !selectedComponent && (
            <div className="sidebar" style={{ width: 280 }}>
              <div className="sidebar-header">
                <h3 className="sidebar-title">展位设置</h3>
              </div>
              <div className="sidebar-content" style={{ padding: 'var(--spacing-md)' }}>
                <Input
                  label="赞助商名称"
                  value={selectedBooth.sponsorName}
                  onChange={(e) => updateSponsorBooth(selectedBooth.id, { sponsorName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-sm">
                  <Input label="X" type="number" value={selectedBooth.x} onChange={(e) => updateSponsorBooth(selectedBooth.id, { x: Number(e.target.value) })} />
                  <Input label="Y" type="number" value={selectedBooth.y} onChange={(e) => updateSponsorBooth(selectedBooth.id, { y: Number(e.target.value) })} />
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <Input label="宽度" type="number" value={selectedBooth.width} onChange={(e) => updateSponsorBooth(selectedBooth.id, { width: Number(e.target.value) })} />
                  <Input label="高度" type="number" value={selectedBooth.height} onChange={(e) => updateSponsorBooth(selectedBooth.id, { height: Number(e.target.value) })} />
                </div>
                <div className="mt-lg">
                  <Button variant="danger" block icon="🗑️" onClick={() => { removeSponsorBooth(selectedBooth.id); setSelectedId(null); }}>
                    删除展位
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={showAddPresetModal} title="新建灯光预设" onClose={() => setShowAddPresetModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddPresetModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleAddPreset}>创建</Button>
          </>
        }
      >
        <Input label="预设名称" value={newPreset.name || ''} onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })} />
        <div className="grid grid-cols-3 gap-md">
          <div>
            <label className="label">主色调</label>
            <input type="color" className="color-input w-full" value={newPreset.primaryColor} onChange={(e) => setNewPreset({ ...newPreset, primaryColor: e.target.value })} />
          </div>
          <div>
            <label className="label">辅助色</label>
            <input type="color" className="color-input w-full" value={newPreset.secondaryColor} onChange={(e) => setNewPreset({ ...newPreset, secondaryColor: e.target.value })} />
          </div>
          <div>
            <label className="label">环境色</label>
            <input type="color" className="color-input w-full" value={newPreset.ambientColor} onChange={(e) => setNewPreset({ ...newPreset, ambientColor: e.target.value })} />
          </div>
        </div>
        <div className="form-group mt-md">
          <label className="label">光效模式</label>
          <select className="select" value={newPreset.pattern} onChange={(e) => setNewPreset({ ...newPreset, pattern: e.target.value as LightPreset['pattern'] })}>
            {LIGHT_PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">亮度强度: {Math.round((newPreset.intensity || 0) * 100)}%</label>
          <input type="range" className="slider" min={0} max={1} step={0.05} value={newPreset.intensity} onChange={(e) => setNewPreset({ ...newPreset, intensity: Number(e.target.value) })} />
        </div>
      </Modal>

      <Modal open={showAddBoothModal} title="添加赞助展位" onClose={() => setShowAddBoothModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddBoothModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleAddBooth}>添加</Button>
          </>
        }
      >
        <Input label="赞助商名称" value={newBooth.sponsorName || ''} onChange={(e) => setNewBooth({ ...newBooth, sponsorName: e.target.value })} />
        <div className="form-group">
          <label className="label">描述</label>
          <textarea className="input textarea" value={newBooth.description || ''} onChange={(e) => setNewBooth({ ...newBooth, description: e.target.value })} />
        </div>
      </Modal>

      <Modal open={showSaveSchemeModal} title="保存方案" onClose={() => setShowSaveSchemeModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSaveSchemeModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSaveScheme}>保存</Button>
          </>
        }
      >
        <Input label="方案名称" value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="输入方案名称..." />
      </Modal>
    </div>
  );
};

export default App;
