import React, { useState, useEffect } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Switch } from '@/components/Switch';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, Ticket } from '@shared/types';

const TICKET_TYPE_INFO: Record<Ticket['type'], { icon: string; name: string; color: string }> = {
  standard: { icon: '🎫', name: '标准票', color: 'var(--gradient-primary)' },
  vip: { icon: '👑', name: 'VIP票', color: 'var(--gradient-secondary)' },
  backstage: { icon: '🎤', name: '后台票', color: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
};

const App: React.FC = () => {
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    price: 0,
    totalQuantity: 1000,
    accessCode: '',
    requireCode: false
  });

  const { tickets, updateTicket, initializePersistence } = useFestivalStore();

  useEffect(() => {
    initializePersistence();
  }, [initializePersistence]);

  const totalRevenue = tickets.reduce((sum, t) => sum + t.price * t.soldQuantity, 0);
  const totalSold = tickets.reduce((sum, t) => sum + t.soldQuantity, 0);
  const totalTickets = tickets.reduce((sum, t) => sum + t.totalQuantity, 0);

  const handleOpenEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      price: ticket.price,
      totalQuantity: ticket.totalQuantity,
      accessCode: ticket.accessCode || '',
      requireCode: !!ticket.accessCode
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingTicket) {
      updateTicket(editingTicket.id, {
        price: formData.price,
        totalQuantity: formData.totalQuantity,
        accessCode: formData.requireCode ? formData.accessCode || undefined : undefined
      });
      setShowModal(false);
    }
  };

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.TICKETING} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">🎫 票务入口</h1>
          <div className="topbar-actions">
            <Button variant="secondary" icon="📊">数据报表</Button>
          </div>
        </div>
        <div className="content-area">
          <div className="grid grid-cols-4 gap-lg mb-lg">
            <div className="stat-card">
              <div className="stat-value">¥{totalRevenue.toLocaleString()}</div>
              <div className="stat-label">总销售额</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalSold.toLocaleString()}</div>
              <div className="stat-label">已出票数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{((totalSold / totalTickets) * 100).toFixed(1)}%</div>
              <div className="stat-label">销售进度</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{tickets.length}</div>
              <div className="stat-label">票种数量</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-lg">
            {tickets.map((ticket) => {
              const info = TICKET_TYPE_INFO[ticket.type];
              const soldPercent = (ticket.soldQuantity / ticket.totalQuantity) * 100;
              const revenue = ticket.price * ticket.soldQuantity;
              return (
                <Card key={ticket.id} className="ticket-card">
                  <div
                    style={{
                      background: info.color,
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-lg)',
                      margin: '-var(--spacing-md)',
                      marginBottom: 'var(--spacing-md)'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div style={{ fontSize: 'var(--font-2xl)' }}>{info.icon}</div>
                      <Badge variant="primary">{info.name}</Badge>
                    </div>
                    <div className="mt-md">
                      <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 700 }}>¥{ticket.price}</div>
                    </div>
                  </div>

                  <div className="mb-md">
                    <div className="flex justify-between text-sm mb-xs">
                      <span className="text-muted">销售进度</span>
                      <span className="font-medium">{ticket.soldQuantity} / {ticket.totalQuantity}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${soldPercent}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-sm mb-md">
                    <div>
                      <div className="text-muted text-xs">销售额</div>
                      <div className="font-semibold">¥{revenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted text-xs">剩余</div>
                      <div className="font-semibold">{(ticket.totalQuantity - ticket.soldQuantity).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mb-md">
                    <div className="text-muted text-xs mb-xs">权益包含:</div>
                    <div className="flex gap-xs flex-wrap">
                      {ticket.benefits.map((b, i) => (
                        <span key={i} className="chip">{b}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <span className="text-muted text-sm">入场口令:</span>
                      {ticket.accessCode ? (
                        <Badge variant="warning">🔒 {ticket.accessCode}</Badge>
                      ) : (
                        <Badge variant="success">公开</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-sm">
                    <Button variant="secondary" block size="sm" onClick={() => handleOpenEdit(ticket)}>
                      编辑配置
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-lg">
            <h3 className="card-title mb-md">🔐 入场口令验证记录</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>用户</th>
                  <th>票种</th>
                  <th>口令</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '2026-06-10 14:32:15', user: 'user_8821', type: 'VIP票', code: 'VIP2026', status: 'success' },
                  { time: '2026-06-10 14:30:02', user: 'user_1029', type: '后台票', code: 'BACKSTAGE2026', status: 'success' },
                  { time: '2026-06-10 14:28:45', user: 'user_7731', type: 'VIP票', code: 'WRONG123', status: 'failed' },
                  { time: '2026-06-10 14:25:10', user: 'user_3344', type: '标准票', code: '-', status: 'success' }
                ].map((record, i) => (
                  <tr key={i}>
                    <td className="text-secondary">{record.time}</td>
                    <td>{record.user}</td>
                    <td>{record.type}</td>
                    <td><code style={{ color: 'var(--accent-secondary)' }}>{record.code}</code></td>
                    <td>
                      <Badge variant={record.status === 'success' ? 'success' : 'error'}>
                        {record.status === 'success' ? '✓ 通过' : '✗ 失败'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      <Modal
        open={showModal}
        title={`编辑 ${editingTicket ? TICKET_TYPE_INFO[editingTicket.type].name : ''}`}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSave}>保存</Button>
          </>
        }
      >
        <Input label="票价 (元)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
        <Input label="总票数" type="number" value={formData.totalQuantity} onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })} />
        <div className="divider" />
        <Switch
          checked={formData.requireCode}
          onChange={(v) => setFormData({ ...formData, requireCode: v })}
          label="启用入场口令"
        />
        {formData.requireCode && (
          <Input
            label="入场口令"
            value={formData.accessCode}
            onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
            placeholder="观众需输入此口令入场"
            className="mt-sm"
          />
        )}
      </Modal>
    </div>
  );
};

export default App;
