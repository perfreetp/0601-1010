import React, { useState, useEffect, useRef } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Select } from '@/components/Select';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, RehearsalPoint, WalkPath } from '@shared/types';

const POINT_TYPE_INFO: Record<RehearsalPoint['type'], { icon: string; label: string; color: string }> = {
  video: { icon: '📹', label: '视频点位', color: '#8b5cf6' },
  audio: { icon: '🎵', label: '音频点位', color: '#06b6d4' },
  walk: { icon: '🚶', label: '走位点位', color: '#10b981' }
};

const STATUS_INFO: Record<RehearsalPoint['status'], { variant: 'primary' | 'success' | 'warning' | 'error'; label: string }> = {
  pending: { variant: 'warning', label: '待测试' },
  testing: { variant: 'primary', label: '测试中' },
  passed: { variant: 'success', label: '通过' },
  failed: { variant: 'error', label: '失败' }
};

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'points' | 'walk' | 'config'>('points');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  const [walkProgress, setWalkProgress] = useState(0);
  const [currentWalkPoint, setCurrentWalkPoint] = useState(0);
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [newPoint, setNewPoint] = useState<Partial<RehearsalPoint>>({
    name: '',
    type: 'video',
    x: 50,
    y: 50
  });
  const walkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { rehearsalPoints, addRehearsalPoint, updateRehearsalPoint, walkPaths, initializePersistence } = useFestivalStore();

  useEffect(() => {
    initializePersistence();
  }, [initializePersistence]);

  const selectedPoint = rehearsalPoints.find((p) => p.id === selectedPointId);
  const activePath = walkPaths[0];

  const startWalk = () => {
    if (!activePath) return;
    setIsWalking(true);
    setWalkProgress(0);
    setCurrentWalkPoint(0);
    const interval = (activePath.duration * 1000) / (activePath.points.length - 1) / 100;
    let progress = 0;
    walkTimerRef.current = setInterval(() => {
      progress += 1;
      setWalkProgress(progress);
      setCurrentWalkPoint(Math.floor((progress / 100) * (activePath.points.length - 1)));
      if (progress >= 100) {
        if (walkTimerRef.current) clearInterval(walkTimerRef.current);
        setIsWalking(false);
      }
    }, interval);
  };

  const stopWalk = () => {
    if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    setIsWalking(false);
    setWalkProgress(0);
  };

  const handleTestPoint = (point: RehearsalPoint) => {
    updateRehearsalPoint(point.id, { status: 'testing' });
    setTimeout(() => {
      const passed = Math.random() > 0.2;
      updateRehearsalPoint(point.id, { status: passed ? 'passed' : 'failed' });
    }, 2000);
  };

  const handleAddPoint = () => {
    if (newPoint.name && newPoint.type) {
      addRehearsalPoint({
        name: newPoint.name,
        type: newPoint.type,
        x: Number(newPoint.x) || 100,
        y: Number(newPoint.y) || 100
      });
      setShowAddPoint(false);
      setNewPoint({ name: '', type: 'video', x: 100, y: 100 });
    }
  };

  useEffect(() => {
    return () => {
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    };
  }, []);

  const passedCount = rehearsalPoints.filter((p) => p.status === 'passed').length;
  const totalPoints = rehearsalPoints.length;

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.REHEARSAL} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">🎬 彩排模式</h1>
          <div className="topbar-actions">
            <Badge variant={passedCount === totalPoints ? 'success' : 'warning'}>
              点位进度: {passedCount}/{totalPoints}
            </Badge>
            {!isWalking ? (
              <Button variant="primary" icon="▶" onClick={startWalk}>开始走位</Button>
            ) : (
              <Button variant="danger" icon="■" onClick={stopWalk}>停止走位</Button>
            )}
          </div>
        </div>
        <div className="flex" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="sidebar" style={{ width: 280 }}>
            <div className="tabs">
              <div className={`tab ${activePanel === 'points' ? 'active' : ''}`} onClick={() => setActivePanel('points')}>点位</div>
              <div className={`tab ${activePanel === 'walk' ? 'active' : ''}`} onClick={() => setActivePanel('walk')}>走位</div>
              <div className={`tab ${activePanel === 'config' ? 'active' : ''}`} onClick={() => setActivePanel('config')}>配置</div>
            </div>
            <div className="sidebar-content">
              {activePanel === 'points' && (
                <>
                  <Button variant="primary" block icon="+" size="sm" className="mb-sm" onClick={() => setShowAddPoint(true)}>
                    添加点位
                  </Button>
                  {rehearsalPoints.map((point) => {
                    const info = POINT_TYPE_INFO[point.type];
                    const status = STATUS_INFO[point.status];
                    return (
                      <div
                        key={point.id}
                        onClick={() => setSelectedPointId(point.id)}
                        className="list-item"
                        style={{
                          padding: 'var(--spacing-sm)',
                          marginBottom: 'var(--spacing-xs)',
                          cursor: 'pointer',
                          borderColor: selectedPointId === point.id ? 'var(--accent-primary)' : undefined
                        }}
                      >
                        <div style={{
                          width: 32, height: 32,
                          background: info.color,
                          borderRadius: 'var(--radius-md)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-md)',
                          marginRight: 'var(--spacing-sm)'
                        }}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{point.name}</div>
                          <div className="text-muted text-xs">{info.label}</div>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    );
                  })}
                </>
              )}
              {activePanel === 'walk' && (
                <>
                  {walkPaths.map((path) => (
                    <Card key={path.id} className="mb-sm">
                      <div className="font-medium">{path.name}</div>
                      <div className="text-muted text-sm mt-xs">
                        {path.points.length} 个点位 · {path.duration}秒
                      </div>
                      <div className="mt-sm">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${walkProgress}%` }} />
                        </div>
                      </div>
                    </Card>
                  ))}
                  {isWalking && (
                    <Card>
                      <div className="text-sm">
                        当前位置: 点位 {currentWalkPoint + 1}/{activePath?.points.length}
                      </div>
                    </Card>
                  )}
                </>
              )}
              {activePanel === 'config' && (
                <>
                  <Card className="mb-sm">
                    <h4 className="font-medium mb-sm">音视频设置</h4>
                    <Select
                      label="视频分辨率"
                      value="1080p"
                      onChange={() => {}}
                      options={[
                        { value: '720p', label: '720p HD' },
                        { value: '1080p', label: '1080p Full HD' },
                        { value: '4k', label: '4K Ultra HD' }
                      ]}
                    />
                    <Select
                      label="音频采样率"
                      value="48000"
                      onChange={() => {}}
                      options={[
                        { value: '44100', label: '44.1 kHz' },
                        { value: '48000', label: '48 kHz' },
                        { value: '96000', label: '96 kHz' }
                      ]}
                    />
                  </Card>
                  <Card>
                    <h4 className="font-medium mb-sm">走位设置</h4>
                    <Input label="移动速度 (秒/米)" type="number" defaultValue={1.5} />
                    <Input label="停留时间 (秒)" type="number" defaultValue={2} />
                  </Card>
                </>
              )}
            </div>
          </div>
          <div className="flex-1" style={{ padding: 'var(--spacing-lg)', overflow: 'auto' }}>
            <div className="canvas-container" style={{ width: 1200, height: 700, margin: '0 auto', position: 'relative' }}>
              <div className="canvas-grid" />
              <div style={{
                position: 'absolute', left: 400, top: 100,
                width: 400, height: 180,
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600
              }}>
                🎪 主舞台
              </div>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {activePath && (
                  <polyline
                    points={activePath.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    opacity={isWalking ? 1 : 0.5}
                  />
                )}
                {activePath && isWalking && (
                  <circle
                    cx={activePath.points[currentWalkPoint]?.x || 0}
                    cy={activePath.points[currentWalkPoint]?.y || 0}
                    r="15"
                    fill="#10b981"
                    className="animate-glow"
                  />
                )}
              </svg>
              {rehearsalPoints.map((point) => {
                const info = POINT_TYPE_INFO[point.type];
                const status = STATUS_INFO[point.status];
                return (
                  <div
                    key={point.id}
                    onClick={() => setSelectedPointId(point.id)}
                    style={{
                      position: 'absolute',
                      left: point.x - 24,
                      top: point.y - 24,
                      width: 48,
                      height: 48,
                      background: info.color,
                      border: selectedPointId === point.id ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: point.status === 'testing' ? '0 0 20px rgba(139, 92, 246, 0.8)' : undefined
                    }}
                    className={point.status === 'testing' ? 'animate-pulse' : ''}
                  >
                    <span style={{ fontSize: 20 }}>{info.icon}</span>
                    <div style={{
                      position: 'absolute',
                      bottom: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '2px 6px',
                      background: point.status === 'passed' ? '#10b981' : point.status === 'failed' ? '#ef4444' : point.status === 'testing' ? '#8b5cf6' : '#f59e0b',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 10,
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {status.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {selectedPoint && (
            <div className="sidebar" style={{ width: 280 }}>
              <div className="sidebar-header">
                <h3 className="sidebar-title">点位详情</h3>
              </div>
              <div className="sidebar-content" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{
                  width: 64, height: 64,
                  background: POINT_TYPE_INFO[selectedPoint.type].color,
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--font-2xl)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  {POINT_TYPE_INFO[selectedPoint.type].icon}
                </div>
                <h3 className="font-semibold text-lg">{selectedPoint.name}</h3>
                <Badge variant={STATUS_INFO[selectedPoint.status].variant} className="mt-xs">
                  {STATUS_INFO[selectedPoint.status].label}
                </Badge>
                <div className="mt-md">
                  <div className="text-muted text-xs">类型</div>
                  <div>{POINT_TYPE_INFO[selectedPoint.type].label}</div>
                </div>
                <div className="mt-sm">
                  <div className="text-muted text-xs">坐标</div>
                  <div>X: {selectedPoint.x}, Y: {selectedPoint.y}</div>
                </div>
                {selectedPoint.notes && (
                  <div className="mt-sm">
                    <div className="text-muted text-xs">备注</div>
                    <div>{selectedPoint.notes}</div>
                  </div>
                )}
                <div className="mt-lg flex flex-col gap-sm">
                  <Button variant="primary" block icon="▶" onClick={() => handleTestPoint(selectedPoint)}
                    disabled={selectedPoint.status === 'testing'}>
                    {selectedPoint.status === 'testing' ? '测试中...' : '开始测试'}
                  </Button>
                  <Button variant="secondary" block icon="📝">编辑备注</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showAddPoint}
        title="添加测试点位"
        onClose={() => setShowAddPoint(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddPoint(false)}>取消</Button>
            <Button variant="primary" onClick={handleAddPoint}>添加</Button>
          </>
        }
      >
        <Input label="点位名称" value={newPoint.name || ''} onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })} />
        <Select
          label="点位类型"
          value={newPoint.type || 'video'}
          onChange={(e) => setNewPoint({ ...newPoint, type: e.target.value as RehearsalPoint['type'] })}
          options={[
            { value: 'video', label: '视频点位' },
            { value: 'audio', label: '音频点位' },
            { value: 'walk', label: '走位点位' }
          ]}
        />
        <div className="grid grid-cols-2 gap-md">
          <Input label="X坐标" type="number" value={newPoint.x || 0} onChange={(e) => setNewPoint({ ...newPoint, x: Number(e.target.value) })} />
          <Input label="Y坐标" type="number" value={newPoint.y || 0} onChange={(e) => setNewPoint({ ...newPoint, y: Number(e.target.value) })} />
        </div>
      </Modal>
    </div>
  );
};

export default App;
