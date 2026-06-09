import React, { useState } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, Artist } from '@shared/types';

const STAGE_TEMPLATES = [
  { id: 't1', name: '经典四面台', icon: '🎪', tags: ['流行', '摇滚'], capacity: 5000 },
  { id: 't2', name: '沉浸式360°', icon: '🔮', tags: ['电子', 'DJ'], capacity: 3000 },
  { id: 't3', name: '剧场式舞台', icon: '🎭', tags: ['古典', '爵士'], capacity: 1500 },
  { id: 't4', name: '户外主舞台', icon: '🌅', tags: ['音乐节', '大型'], capacity: 10000 },
  { id: 't5', name: '地下Livehouse', icon: '🎸', tags: ['独立', '摇滚'], capacity: 500 },
  { id: 't6', name: '云端悬浮台', icon: '☁️', tags: ['电子', '未来感'], capacity: 2000 }
];

const GENRE_OPTIONS = [
  'Electronic', 'Rock', 'Pop', 'Hip-Hop', 'Jazz', 'Classical', 'Indie', 'Metal', 'R&B', 'Folk'
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stages' | 'artists'>('stages');
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [artistForm, setArtistForm] = useState<Partial<Artist>>({
    name: '',
    genre: '',
    bio: '',
    socialLinks: []
  });
  const [newSocial, setNewSocial] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ artist: Artist; slots: { id: string; startTime: string; endTime: string; stage: string }[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { artists, addArtist, updateArtist, removeArtist, schedule } = useFestivalStore();

  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleOpenArtist = (artist?: Artist) => {
    if (artist) {
      setEditingArtist(artist);
      setArtistForm({ ...artist });
    } else {
      setEditingArtist(null);
      setArtistForm({ name: '', genre: '', bio: '', socialLinks: [] });
    }
    setShowArtistModal(true);
  };

  const handleSaveArtist = () => {
    if (!artistForm.name) return;
    if (editingArtist) {
      updateArtist(editingArtist.id, artistForm);
    } else {
      addArtist(artistForm as Omit<Artist, 'id'>);
    }
    setShowArtistModal(false);
  };

  const addSocialLink = () => {
    if (newSocial.trim()) {
      setArtistForm({
        ...artistForm,
        socialLinks: [...(artistForm.socialLinks || []), newSocial.trim()]
      });
      setNewSocial('');
    }
  };

  const removeSocialLink = (index: number) => {
    setArtistForm({
      ...artistForm,
      socialLinks: (artistForm.socialLinks || []).filter((_, i) => i !== index)
    });
  };

  const handleDeleteClick = (artist: Artist) => {
    const affectedSlots = schedule
      .filter((s) => s.artistId === artist.id)
      .map((s) => ({ id: s.id, startTime: s.startTime, endTime: s.endTime, stage: s.stage }));
    setShowDeleteConfirm({ artist, slots: affectedSlots });
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      const affected = removeArtist(showDeleteConfirm.artist.id);
      setToast({
        message: affected.length > 0
          ? `已删除「${showDeleteConfirm.artist.name}」及关联的 ${affected.length} 场排程`
          : `已删除「${showDeleteConfirm.artist.name}」`,
        type: 'success'
      });
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.STAGE_LIBRARY} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">🎭 舞台库</h1>
          <div className="topbar-actions">
            {activeTab === 'artists' && (
              <Button variant="primary" icon="+" onClick={() => handleOpenArtist()}>添加艺人</Button>
            )}
          </div>
        </div>
        <div className="content-area">
          <div className="tabs" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className={`tab ${activeTab === 'stages' ? 'active' : ''}`} onClick={() => setActiveTab('stages')}>
              舞台模板
            </div>
            <div className={`tab ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
              艺人管理
            </div>
          </div>

          {activeTab === 'stages' && (
            <>
              <div className="section">
                <h2 className="section-title">推荐舞台模板</h2>
                <div className="grid grid-cols-3 gap-md">
                  {STAGE_TEMPLATES.map((tpl) => (
                    <Card key={tpl.id} className="stage-template-card">
                      <div className="flex items-center gap-md">
                        <div style={{
                          width: 64, height: 64,
                          background: 'var(--gradient-primary)',
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-2xl)'
                        }}>
                          {tpl.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{tpl.name}</h3>
                          <div className="flex gap-xs mt-xs flex-wrap">
                            {tpl.tags.map((tag) => (
                              <Badge key={tag} variant="info">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-md">
                        <span className="text-muted text-sm">容纳人数: {tpl.capacity.toLocaleString()}</span>
                        <Button variant="primary" size="sm">使用模板</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">自定义组件库</h2>
                <div className="grid grid-cols-4 gap-md">
                  {[
                    { icon: '🎤', name: '麦克风阵列', count: 12 },
                    { icon: '🖥️', name: 'LED屏幕', count: 8 },
                    { icon: '🔦', name: '摇头灯', count: 24 },
                    { icon: '📢', name: '线阵列音响', count: 16 },
                    { icon: '🎸', name: '乐器架', count: 6 },
                    { icon: '🪑', name: '舞台道具', count: 20 },
                    { icon: '🎬', name: '摄像机位', count: 8 },
                    { icon: '💨', name: '特效设备', count: 10 }
                  ].map((item) => (
                    <Card key={item.name}>
                      <div className="text-center">
                        <div style={{ fontSize: 'var(--font-3xl)', marginBottom: 'var(--spacing-sm)' }}>{item.icon}</div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted text-sm mt-xs">{item.count} 件可用</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'artists' && (
            <div className="grid grid-cols-2 gap-lg">
              {artists.map((artist) => (
                <Card key={artist.id}>
                  <div className="flex gap-md">
                    <div className="avatar avatar-lg">{artist.name[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-sm">
                        <h3 className="font-semibold text-lg">{artist.name}</h3>
                        <Badge variant="primary">{artist.genre}</Badge>
                      </div>
                      <p className="text-secondary text-sm mt-sm">{artist.bio}</p>
                      <div className="flex gap-xs mt-sm flex-wrap">
                        {artist.socialLinks.map((link, i) => (
                          <span key={i} className="chip">{link}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-sm mt-md">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenArtist(artist)}>编辑</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(artist)}>删除</Button>
                  </div>
                </Card>
              ))}
              {artists.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">🎤</div>
                  <div className="empty-state-text">暂无艺人，点击右上角添加</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showArtistModal}
        title={editingArtist ? '编辑艺人' : '添加艺人'}
        onClose={() => setShowArtistModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowArtistModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSaveArtist}>保存</Button>
          </>
        }
      >
        <Input
          label="艺人名称"
          value={artistForm.name || ''}
          onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
          placeholder="输入艺人或乐队名称"
        />
        <div className="form-group">
          <label className="label">音乐风格</label>
          <select
            className="select"
            value={artistForm.genre || ''}
            onChange={(e) => setArtistForm({ ...artistForm, genre: e.target.value })}
          >
            <option value="">请选择风格</option>
            {GENRE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <Textarea
          label="艺人简介"
          value={artistForm.bio || ''}
          onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
          placeholder="介绍艺人背景、代表作品等"
        />
        <div className="form-group">
          <label className="label">社交账号</label>
          <div className="flex gap-sm">
            <input
              className="input flex-1"
              value={newSocial}
              onChange={(e) => setNewSocial(e.target.value)}
              placeholder="@username"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSocialLink())}
            />
            <Button variant="secondary" onClick={addSocialLink}>添加</Button>
          </div>
          <div className="flex gap-xs mt-sm flex-wrap">
            {(artistForm.socialLinks || []).map((link, i) => (
              <span key={i} className="chip">
                {link}
                <button onClick={() => removeSocialLink(i)} style={{ marginLeft: 4 }}>×</button>
              </span>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!showDeleteConfirm}
        title="确认删除艺人"
        onClose={() => setShowDeleteConfirm(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>取消</Button>
            <Button variant="danger" onClick={confirmDelete}>确认删除</Button>
          </>
        }
      >
        {showDeleteConfirm && (
          <div>
            <p style={{ marginBottom: 'var(--spacing-md)' }}>
              确定要删除艺人 <strong>「{showDeleteConfirm.artist.name}」</strong> 吗？
            </p>
            {showDeleteConfirm.slots.length > 0 ? (
              <div>
                <p style={{ color: 'var(--accent-warning)', marginBottom: 'var(--spacing-sm)' }}>
                  ⚠️ 将同时删除以下 {showDeleteConfirm.slots.length} 场排程：
                </p>
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-md)',
                  maxHeight: 200,
                  overflowY: 'auto'
                }}>
                  {showDeleteConfirm.slots.map((slot) => (
                    <div key={slot.id} style={{
                      padding: 'var(--spacing-sm)',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: 'var(--font-sm)'
                    }}>
                      <span className="badge badge-info" style={{ marginRight: 8 }}>{slot.stage}</span>
                      {slot.startTime} - {slot.endTime}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">该艺人暂无关联排程。</p>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          background: toast.type === 'success' ? 'var(--accent-success)' : 'var(--accent-error)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: 500
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
