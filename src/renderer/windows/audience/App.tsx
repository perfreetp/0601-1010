import React, { useState, useEffect } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Switch } from '@/components/Switch';
import { Select } from '@/components/Select';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, Guest, Vote } from '@shared/types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'vote' | 'merch' | 'guests'>('emoji');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showMerchModal, setShowMerchModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [newEmoji, setNewEmoji] = useState('');
  const [newEmojiLabel, setNewEmojiLabel] = useState('');
  const [voteForm, setVoteForm] = useState({ title: '', options: ['', ''] });
  const [merchForm, setMerchForm] = useState({ name: '', description: '', quantity: 1000, price: 0 });
  const [guestForm, setGuestForm] = useState<Partial<Guest>>({ name: '', seatNumber: '', status: 'pending' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    emojis, toggleEmoji, addEmoji,
    votes, addVote, toggleVoteActive,
    merch, addMerch, distributeMerch,
    merchRecords, loadMerchRecords,
    guests, addGuest, updateGuestStatus,
    initializePersistence
  } = useFestivalStore();

  useEffect(() => {
    initializePersistence();
  }, [initializePersistence]);

  useEffect(() => {
    loadMerchRecords();
  }, [loadMerchRecords]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleDistribute = async (merchId: string, merchName: string) => {
    const result = await distributeMerch(merchId, 1);
    setToast({ message: result.message, type: result.success ? 'success' : 'error' });
  };

  const handleAddEmoji = () => {
    if (newEmoji.trim() && newEmojiLabel.trim()) {
      addEmoji({ emoji: newEmoji.trim(), label: newEmojiLabel.trim(), enabled: true });
      setNewEmoji('');
      setNewEmojiLabel('');
    }
  };

  const handleAddVote = () => {
    if (voteForm.title && voteForm.options.filter((o) => o.trim()).length >= 2) {
      addVote({
        title: voteForm.title,
        options: voteForm.options.filter((o) => o.trim()).map((label) => ({ label, count: 0 })),
        isActive: true
      });
      setVoteForm({ title: '', options: ['', ''] });
      setShowVoteModal(false);
    }
  };

  const handleAddMerch = () => {
    if (merchForm.name) {
      addMerch(merchForm);
      setMerchForm({ name: '', description: '', quantity: 1000, price: 0 });
      setShowMerchModal(false);
    }
  };

  const handleAddGuest = () => {
    if (guestForm.name && guestForm.seatNumber) {
      addGuest(guestForm as Omit<Guest, 'id'>);
      setGuestForm({ name: '', seatNumber: '', status: 'pending' });
      setShowGuestModal(false);
    }
  };

  const addVoteOption = () => {
    if (voteForm.options.length < 6) {
      setVoteForm({ ...voteForm, options: [...voteForm.options, ''] });
    }
  };

  const updateVoteOption = (index: number, value: string) => {
    const options = [...voteForm.options];
    options[index] = value;
    setVoteForm({ ...voteForm, options });
  };

  const getStatusBadge = (status: Guest['status']) => {
    const map = {
      confirmed: { variant: 'success' as const, label: '已确认' },
      pending: { variant: 'warning' as const, label: '待确认' },
      'checked-in': { variant: 'primary' as const, label: '已签到' }
    };
    return <Badge variant={map[status].variant}>{map[status].label}</Badge>;
  };

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.AUDIENCE} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">💬 观众互动</h1>
          <div className="topbar-actions">
            {activeTab === 'vote' && <Button variant="primary" icon="+" onClick={() => setShowVoteModal(true)}>创建投票</Button>}
            {activeTab === 'merch' && <Button variant="primary" icon="+" onClick={() => setShowMerchModal(true)}>添加周边</Button>}
            {activeTab === 'guests' && <Button variant="primary" icon="+" onClick={() => setShowGuestModal(true)}>添加嘉宾</Button>}
          </div>
        </div>
        <div className="content-area">
          <div className="tabs" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className={`tab ${activeTab === 'emoji' ? 'active' : ''}`} onClick={() => setActiveTab('emoji')}>观众表情</div>
            <div className={`tab ${activeTab === 'vote' ? 'active' : ''}`} onClick={() => setActiveTab('vote')}>投票活动</div>
            <div className={`tab ${activeTab === 'merch' ? 'active' : ''}`} onClick={() => setActiveTab('merch')}>虚拟周边</div>
            <div className={`tab ${activeTab === 'guests' ? 'active' : ''}`} onClick={() => setActiveTab('guests')}>嘉宾席管理</div>
          </div>

          {activeTab === 'emoji' && (
            <>
              <Card className="mb-lg">
                <h3 className="card-title mb-md">添加自定义表情</h3>
                <div className="flex gap-sm">
                  <Input
                    placeholder="表情符号 (如: 🔥)"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    style={{ width: 120 }}
                  />
                  <Input
                    placeholder="标签名称"
                    value={newEmojiLabel}
                    onChange={(e) => setNewEmojiLabel(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleAddEmoji}>添加</Button>
                </div>
              </Card>
              <Card>
                <h3 className="card-title mb-md">可用表情</h3>
                <div className="grid grid-cols-6 gap-md">
                  {emojis.map((emoji) => (
                    <div
                      key={emoji.id}
                      className="card"
                      style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-md)',
                        borderColor: emoji.enabled ? 'var(--accent-success)' : 'var(--border-color)',
                        opacity: emoji.enabled ? 1 : 0.5
                      }}
                    >
                      <div style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--spacing-xs)' }}>{emoji.emoji}</div>
                      <div className="font-medium text-sm">{emoji.label}</div>
                      <div className="mt-sm">
                        <Switch checked={emoji.enabled} onChange={() => toggleEmoji(emoji.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'vote' && (
            <div className="grid grid-cols-2 gap-lg">
              {votes.map((vote) => {
                const total = vote.options.reduce((sum, o) => sum + o.count, 0);
                return (
                  <Card key={vote.id}>
                    <div className="flex justify-between items-start mb-md">
                      <div>
                        <h3 className="font-semibold text-lg">{vote.title}</h3>
                        <div className="text-muted text-sm mt-xs">共 {total} 票</div>
                      </div>
                      <Badge variant={vote.isActive ? 'success' : 'warning'}>
                        {vote.isActive ? '进行中' : '已结束'}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-sm">
                      {vote.options.map((opt) => (
                        <div key={opt.id}>
                          <div className="flex justify-between text-sm mb-xs">
                            <span>{opt.label}</span>
                            <span className="text-muted">{opt.count} 票 ({total ? Math.round((opt.count / total) * 100) : 0}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${total ? (opt.count / total) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-md">
                      <Button
                        variant={vote.isActive ? 'warning' : 'success'}
                        size="sm"
                        onClick={() => toggleVoteActive(vote.id)}
                      >
                        {vote.isActive ? '结束投票' : '重新开启'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {votes.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">🗳️</div>
                  <div className="empty-state-text">暂无投票活动，点击右上角创建</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'merch' && (
            <>
              <div className="flex justify-between items-center mb-md">
                <Badge variant="info">共发放 {merchRecords.length} 次</Badge>
                <Button variant="secondary" size="sm" onClick={() => setShowRecordsModal(true)}>查看发放记录</Button>
              </div>
              <div className="grid grid-cols-3 gap-lg">
                {merch.map((item) => {
                  const isOutOfStock = item.quantity <= 0;
                  return (
                    <Card key={item.id} style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                      <div className="text-center mb-sm">
                        <div style={{
                          width: 80, height: 80, margin: '0 auto',
                          background: isOutOfStock ? 'var(--bg-disabled)' : 'var(--gradient-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-2xl)'
                        }}>
                          {isOutOfStock ? '⛔' : '🎁'}
                        </div>
                      </div>
                      <h3 className="font-semibold text-center">{item.name}</h3>
                      <p className="text-secondary text-sm text-center mt-xs">{item.description}</p>
                      <div className="flex justify-between mt-md">
                        <div>
                          <div className="text-muted text-xs">库存</div>
                          <div className={`font-semibold ${isOutOfStock ? 'text-danger' : ''}`}>
                            {isOutOfStock ? '已售罄' : item.quantity.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted text-xs">价格</div>
                          <div className="font-semibold text-accent">{item.price === 0 ? '免费' : `¥${item.price}`}</div>
                        </div>
                      </div>
                      <div className="mt-md">
                        <Button
                          variant={isOutOfStock ? 'secondary' : 'primary'}
                          block
                          size="sm"
                          disabled={isOutOfStock}
                          onClick={() => !isOutOfStock && handleDistribute(item.id, item.name)}
                        >
                          {isOutOfStock ? '库存不足' : '发放'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                {merch.length === 0 && (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state-icon">🎁</div>
                    <div className="empty-state-text">暂无虚拟周边，点击右上角添加</div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'guests' && (
            <Card>
              <div className="flex justify-between items-center mb-md">
                <h3 className="card-title">嘉宾列表 ({guests.length})</h3>
                <div className="flex gap-sm">
                  <Badge variant="success">{guests.filter((g) => g.status === 'confirmed').length} 已确认</Badge>
                  <Badge variant="warning">{guests.filter((g) => g.status === 'pending').length} 待确认</Badge>
                  <Badge variant="primary">{guests.filter((g) => g.status === 'checked-in').length} 已签到</Badge>
                </div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>嘉宾</th>
                    <th>座位号</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="avatar avatar-sm">{guest.name[0]}</div>
                          <span className="font-medium">{guest.name}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="info">{guest.seatNumber}</Badge>
                      </td>
                      <td>{getStatusBadge(guest.status)}</td>
                      <td>
                        <div className="flex gap-xs">
                          {guest.status !== 'confirmed' && (
                            <Button variant="success" size="sm" onClick={() => updateGuestStatus(guest.id, 'confirmed')}>
                              确认
                            </Button>
                          )}
                          {guest.status !== 'checked-in' && (
                            <Button variant="primary" size="sm" onClick={() => updateGuestStatus(guest.id, 'checked-in')}>
                              签到
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={showVoteModal}
        title="创建投票"
        onClose={() => setShowVoteModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowVoteModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleAddVote}>创建</Button>
          </>
        }
      >
        <Input label="投票标题" value={voteForm.title} onChange={(e) => setVoteForm({ ...voteForm, title: e.target.value })} placeholder="请输入投票问题" />
        <div className="form-group">
          <label className="label">投票选项</label>
          {voteForm.options.map((opt, i) => (
            <Input
              key={i}
              placeholder={`选项 ${i + 1}`}
              value={opt}
              onChange={(e) => updateVoteOption(i, e.target.value)}
              className="mb-xs"
            />
          ))}
          {voteForm.options.length < 6 && (
            <Button variant="secondary" size="sm" onClick={addVoteOption}>+ 添加选项</Button>
          )}
        </div>
      </Modal>

      <Modal
        open={showMerchModal}
        title="添加虚拟周边"
        onClose={() => setShowMerchModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowMerchModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleAddMerch}>添加</Button>
          </>
        }
      >
        <Input label="周边名称" value={merchForm.name} onChange={(e) => setMerchForm({ ...merchForm, name: e.target.value })} />
        <div className="form-group">
          <label className="label">描述</label>
          <textarea className="input textarea" value={merchForm.description} onChange={(e) => setMerchForm({ ...merchForm, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-md">
          <Input label="库存数量" type="number" value={merchForm.quantity} onChange={(e) => setMerchForm({ ...merchForm, quantity: Number(e.target.value) })} />
          <Input label="价格 (元)" type="number" value={merchForm.price} onChange={(e) => setMerchForm({ ...merchForm, price: Number(e.target.value) })} />
        </div>
      </Modal>

      <Modal
        open={showGuestModal}
        title="添加嘉宾"
        onClose={() => setShowGuestModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowGuestModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleAddGuest}>添加</Button>
          </>
        }
      >
        <Input label="嘉宾姓名" value={guestForm.name || ''} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} />
        <Input label="座位号" value={guestForm.seatNumber || ''} onChange={(e) => setGuestForm({ ...guestForm, seatNumber: e.target.value })} placeholder="如: VIP-A01" />
        <Select
          label="状态"
          value={guestForm.status || 'pending'}
          onChange={(e) => setGuestForm({ ...guestForm, status: e.target.value as Guest['status'] })}
          options={[
            { value: 'pending', label: '待确认' },
            { value: 'confirmed', label: '已确认' },
            { value: 'checked-in', label: '已签到' }
          ]}
        />
      </Modal>

      <Modal
        open={showRecordsModal}
        title="虚拟周边发放记录"
        onClose={() => setShowRecordsModal(false)}
        footer={
          <Button variant="primary" onClick={() => setShowRecordsModal(false)}>关闭</Button>
        }
      >
        {merchRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">暂无发放记录</div>
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>周边</th>
                  <th>数量</th>
                </tr>
              </thead>
              <tbody>
                {merchRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="text-muted text-sm">
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </td>
                    <td>
                      <Badge variant="primary">{record.merchName}</Badge>
                    </td>
                    <td className="font-semibold text-accent">× {record.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
