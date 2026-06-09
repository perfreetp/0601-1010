import React, { useState, useEffect, useRef } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, HeatZone } from '@shared/types';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'playback' | 'schemes'>('heatmap');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showSaveScheme, setShowSaveScheme] = useState(false);
  const [schemeName, setSchemeName] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { heatZones, components, sponsorBooths, schemes, saveScheme, loadScheme } = useFestivalStore();

  const totalVisitors = heatZones.reduce((sum, z) => sum + z.visitorCount, 0);
  const maxVisitors = Math.max(...heatZones.map((z) => z.visitorCount));

  const playbackDuration = 3600;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setPlaybackTime((t) => {
          if (t >= playbackDuration) {
            setIsPlaying(false);
            return playbackDuration;
          }
          return t + 10;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (playbackTime >= playbackDuration) {
      setPlaybackTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveScheme = () => {
    if (schemeName.trim()) {
      saveScheme(schemeName.trim());
      setSchemeName('');
      setShowSaveScheme(false);
    }
  };

  const getHeatIntensity = (visitorCount: number) => {
    return (visitorCount / maxVisitors) * 0.8 + 0.2;
  };

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.PLAYBACK} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">📊 数据回放</h1>
          <div className="topbar-actions">
            <Button variant="secondary" icon="💾" onClick={() => setShowSaveScheme(true)}>保存方案</Button>
            <Button variant="primary" icon="📤">导出报告</Button>
          </div>
        </div>
        <div className="content-area">
          <div className="tabs" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className={`tab ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>热区查看</div>
            <div className={`tab ${activeTab === 'playback' ? 'active' : ''}`} onClick={() => setActiveTab('playback')}>数据回放</div>
            <div className={`tab ${activeTab === 'schemes' ? 'active' : ''}`} onClick={() => setActiveTab('schemes')}>方案管理</div>
          </div>

          {activeTab === 'heatmap' && (
            <>
              <div className="grid grid-cols-4 gap-lg mb-lg">
                <div className="stat-card">
                  <div className="stat-value">{totalVisitors.toLocaleString()}</div>
                  <div className="stat-label">总访问人次</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{heatZones.length}</div>
                  <div className="stat-label">热点区域</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.round(heatZones.reduce((s, z) => s + z.averageDuration, 0) / heatZones.length)}s
                  </div>
                  <div className="stat-label">平均停留时长</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">89.2%</div>
                  <div className="stat-label">观众满意度</div>
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: 'var(--spacing-lg)' }}>
                <Card>
                  <h3 className="card-title mb-md">热力图</h3>
                  <div className="canvas-container" style={{ width: '100%', height: 600, position: 'relative' }}>
                    <div className="canvas-grid" />
                    <div style={{
                      position: 'absolute', left: 400, top: 100,
                      width: 400, height: 180,
                      background: 'rgba(139, 92, 246, 0.6)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600
                    }}>
                      🎪 主舞台
                    </div>
                    {heatZones.map((zone) => (
                      <div
                        key={zone.id}
                        style={{
                          position: 'absolute',
                          left: zone.x,
                          top: zone.y,
                          width: zone.width,
                          height: zone.height,
                          background: zone.color,
                          opacity: getHeatIntensity(zone.visitorCount),
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{zone.name}</div>
                        <div style={{ fontSize: 'var(--font-xs)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          {zone.visitorCount.toLocaleString()} 人
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-md mt-md">
                    <div className="flex items-center gap-xs">
                      <div style={{ width: 20, height: 20, background: '#44AA44', borderRadius: 4 }} />
                      <span className="text-sm text-secondary">低热度</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <div style={{ width: 20, height: 20, background: '#FFAA00', borderRadius: 4 }} />
                      <span className="text-sm text-secondary">中热度</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <div style={{ width: 20, height: 20, background: '#FF4444', borderRadius: 4 }} />
                      <span className="text-sm text-secondary">高热度</span>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col gap-md">
                  <Card>
                    <h3 className="card-title mb-md">热区排行</h3>
                    <div className="flex flex-col gap-sm">
                      {[...heatZones].sort((a, b) => b.visitorCount - a.visitorCount).map((zone, idx) => (
                        <div key={zone.id} className="flex items-center gap-sm">
                          <div style={{
                            width: 28, height: 28,
                            background: idx < 3 ? 'var(--gradient-secondary)' : 'var(--bg-tertiary)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 'var(--font-sm)'
                          }}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{zone.name}</div>
                            <div className="text-muted text-xs">{zone.averageDuration}s 平均停留</div>
                          </div>
                          <Badge variant="info">{zone.visitorCount.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="card-title mb-md">时间分布</h3>
                    <div style={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                      {Array.from({ length: 24 }, (_, i) => {
                        const height = 30 + Math.sin(i * 0.5) * 30 + Math.random() * 40;
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: `${height}%`,
                              background: i >= 18 && i <= 23 ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                              borderRadius: '4px 4px 0 0',
                              minHeight: 10
                            }}
                            title={`${i}:00`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-xs">
                      <span>00:00</span>
                      <span>12:00</span>
                      <span>23:00</span>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeTab === 'playback' && (
            <Card>
              <h3 className="card-title mb-md">活动回放</h3>
              <div className="canvas-container" style={{ width: '100%', height: 500, position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
                <div className="canvas-grid" />
                <div style={{
                  position: 'absolute', left: 400, top: 100,
                  width: 400, height: 180,
                  background: 'rgba(139, 92, 246, 0.6)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600
                }}>
                  🎪 主舞台
                </div>
                {Array.from({ length: 50 }).map((_, i) => {
                  const t = playbackTime / playbackDuration;
                  const baseX = 100 + (i * 20) % 800;
                  const baseY = 350 + Math.sin(i) * 100;
                  const x = baseX + Math.sin(t * Math.PI * 2 + i) * 50;
                  const y = baseY + Math.cos(t * Math.PI * 2 + i * 0.5) * 30;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        width: 12,
                        height: 12,
                        background: '#06b6d4',
                        borderRadius: '50%',
                        opacity: 0.8,
                        transition: 'all 0.1s linear'
                      }}
                    />
                  );
                })}
                <div style={{
                  position: 'absolute', top: 'var(--spacing-md)', left: 'var(--spacing-md)',
                  background: 'rgba(0,0,0,0.7)', padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: 'var(--font-lg)'
                }}>
                  {formatTime(playbackTime)}
                </div>
              </div>

              <div className="flex items-center gap-md">
                <Button variant="secondary" size="lg" icon="⏮" onClick={() => setPlaybackTime(0)} disabled={isPlaying}>重置</Button>
                <Button variant="primary" size="lg" icon={isPlaying ? '⏸' : '▶'} onClick={togglePlay}>
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <div className="flex-1">
                  <input
                    type="range"
                    className="slider"
                    min={0}
                    max={playbackDuration}
                    value={playbackTime}
                    onChange={(e) => setPlaybackTime(Number(e.target.value))}
                  />
                </div>
                <span className="font-mono text-secondary">{formatTime(playbackTime)} / {formatTime(playbackDuration)}</span>
                <select className="select" style={{ width: 100 }} defaultValue="1x">
                  <option value="0.5x">0.5x</option>
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="4x">4x</option>
                </select>
              </div>

              <div className="mt-lg">
                <h4 className="font-medium mb-sm">事件日志</h4>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {[
                    { time: '01:00:23', event: '🎤 DJ Phoenix 开始演出', type: 'primary' },
                    { time: '00:58:15', event: '🔥 观众表情峰值', type: 'warning' },
                    { time: '00:45:30', event: '🗳️ 投票 #1 结束', type: 'info' },
                    { time: '00:30:00', event: '👥 入场人数突破 5000', type: 'success' },
                    { time: '00:15:42', event: '💡 灯光切换至「霓虹紫夜」', type: 'primary' }
                  ].map((log, i) => (
                    <div key={i} className="flex gap-sm py-sm border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="font-mono text-muted" style={{ minWidth: 80 }}>{log.time}</span>
                      <Badge variant={log.type as any}>事件</Badge>
                      <span>{log.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'schemes' && (
            <>
              <div className="grid grid-cols-3 gap-lg">
                {schemes.map((scheme) => (
                  <Card key={scheme.id}>
                    <div style={{
                      height: 160,
                      background: 'var(--gradient-primary)',
                      borderRadius: 'var(--radius-md)',
                      margin: '-var(--spacing-md)',
                      marginBottom: 'var(--spacing-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-3xl)'
                    }}>
                      🎪
                    </div>
                    <h3 className="font-semibold text-lg">{scheme.name}</h3>
                    <div className="flex gap-xs mt-xs flex-wrap">
                      <Badge variant="info">{scheme.components.length} 组件</Badge>
                      <Badge variant="info">{scheme.booths.length} 展位</Badge>
                      <Badge variant="info">{scheme.lights.length} 灯光</Badge>
                    </div>
                    <div className="text-muted text-sm mt-sm">
                      更新于 {format(new Date(scheme.updatedAt), 'yyyy-MM-dd HH:mm')}
                    </div>
                    <div className="flex gap-sm mt-md">
                      <Button variant="primary" block size="sm" onClick={() => loadScheme(scheme.id)}>加载方案</Button>
                      <Button variant="secondary" size="sm">编辑</Button>
                    </div>
                  </Card>
                ))}
              </div>
              {schemes.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">暂无保存的方案</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={showSaveScheme}
        title="保存方案"
        onClose={() => setShowSaveScheme(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSaveScheme(false)}>取消</Button>
            <Button variant="primary" onClick={handleSaveScheme}>保存</Button>
          </>
        }
      >
        <Input
          label="方案名称"
          value={schemeName}
          onChange={(e) => setSchemeName(e.target.value)}
          placeholder="输入方案名称以便后续识别"
        />
      </Modal>
    </div>
  );
};

export default App;
