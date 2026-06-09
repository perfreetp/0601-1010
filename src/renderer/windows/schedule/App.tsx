import React, { useState, useEffect } from 'react';
import { WindowLauncher } from '@/components/WindowLauncher';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Select } from '@/components/Select';
import { Switch } from '@/components/Switch';
import { useFestivalStore } from '@/store/useFestivalStore';
import { WindowType, ScheduleSlot } from '@shared/types';
import { format } from 'date-fns';

const STAGES = [
  { value: 'main-stage-1', label: '主舞台' },
  { value: 'sub-stage-1', label: '副舞台A' },
  { value: 'sub-stage-2', label: '副舞台B' },
  { value: 'dj-booth-1', label: 'DJ区' }
];

const DAYS = ['2026-07-01', '2026-07-02', '2026-07-03'];
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = 12 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const App: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [formData, setFormData] = useState({
    artistId: '',
    stageId: 'main-stage-1',
    startTime: '19:00',
    endTime: '20:00',
    accessCode: '',
    requireCode: false
  });

  const { schedule, artists, components, addScheduleSlot, updateScheduleSlot, removeScheduleSlot, initializePersistence } = useFestivalStore();

  useEffect(() => {
    initializePersistence();
  }, [initializePersistence]);

  const daySchedule = schedule.filter((s) => {
    const slotDay = format(new Date(s.startTime), 'yyyy-MM-dd');
    return slotDay === selectedDay;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleOpenModal = (slot?: ScheduleSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        artistId: slot.artistId,
        stageId: slot.stageId,
        startTime: format(new Date(slot.startTime), 'HH:mm'),
        endTime: format(new Date(slot.endTime), 'HH:mm'),
        accessCode: slot.accessCode || '',
        requireCode: !!slot.accessCode
      });
    } else {
      setEditingSlot(null);
      setFormData({
        artistId: artists[0]?.id || '',
        stageId: 'main-stage-1',
        startTime: '19:00',
        endTime: '20:00',
        accessCode: '',
        requireCode: false
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.artistId) return;
    const startDate = new Date(`${selectedDay}T${formData.startTime}:00`);
    const endDate = new Date(`${selectedDay}T${formData.endTime}:00`);
    const data = {
      artistId: formData.artistId,
      stageId: formData.stageId,
      startTime: startDate,
      endTime: endDate,
      accessCode: formData.requireCode ? formData.accessCode || undefined : undefined
    };
    if (editingSlot) {
      updateScheduleSlot(editingSlot.id, data);
    } else {
      addScheduleSlot(data);
    }
    setShowModal(false);
  };

  const getStageName = (id: string) => STAGES.find((s) => s.value === id)?.label || id;
  const getArtistName = (id: string) => artists.find((a) => a.id === id)?.name || '未知艺人';
  const getArtistInitial = (id: string) => getArtistName(id)[0] || '?';

  return (
    <div className="app-container">
      <WindowLauncher currentWindow={WindowType.SCHEDULE} />
      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">📅 节目排程</h1>
          <div className="topbar-actions">
            <Button variant="primary" icon="+" onClick={() => handleOpenModal()}>添加场次</Button>
          </div>
        </div>
        <div className="content-area">
          <div className="flex gap-md mb-lg">
            {DAYS.map((day) => (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`card ${selectedDay === day ? 'animate-glow' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  textAlign: 'center',
                  minWidth: 140,
                  borderColor: selectedDay === day ? 'var(--accent-primary)' : undefined
                }}
              >
                <div className="text-muted text-sm">{format(new Date(day), 'EEEE')}</div>
                <div className="font-semibold text-lg mt-xs">{format(new Date(day), 'MM月dd日')}</div>
                <Badge variant="info" style={{ marginTop: 4 }}>
                  {daySchedule.length} 场演出
                </Badge>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-md">
            {STAGES.map((stage) => {
              const stageSlots = daySchedule.filter((s) => s.stageId === stage.value);
              return (
                <Card key={stage.value}>
                  <h3 className="card-title mb-md">🎤 {stage.label}</h3>
                  <div style={{ minHeight: 400 }}>
                    {stageSlots.length === 0 ? (
                      <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                        <div className="empty-state-text">暂无安排</div>
                      </div>
                    ) : (
                      stageSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="list-item"
                          style={{ marginBottom: 'var(--spacing-sm)', cursor: 'pointer' }}
                          onClick={() => handleOpenModal(slot)}
                        >
                          <div className="avatar avatar-sm">{getArtistInitial(slot.artistId)}</div>
                          <div className="flex-1">
                            <div className="font-medium">{getArtistName(slot.artistId)}</div>
                            <div className="text-muted text-sm">
                              {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-xs">
                            {slot.accessCode && <Badge variant="warning">🔒 需口令</Badge>}
                            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); removeScheduleSlot(slot.id); }}>
                              删除
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-lg">
            <h3 className="card-title mb-md">📊 今日排程总览</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>艺人</th>
                  <th>舞台</th>
                  <th>时长</th>
                  <th>入场口令</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {daySchedule.map((slot) => {
                  const duration = (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000;
                  return (
                    <tr key={slot.id}>
                      <td className="font-medium">
                        {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                      </td>
                      <td>{getArtistName(slot.artistId)}</td>
                      <td>{getStageName(slot.stageId)}</td>
                      <td>{duration} 分钟</td>
                      <td>
                        {slot.accessCode ? (
                          <Badge variant="warning">{slot.accessCode}</Badge>
                        ) : (
                          <Badge variant="success">公开</Badge>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-xs">
                          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(slot)}>编辑</Button>
                          <Button variant="danger" size="sm" onClick={() => removeScheduleSlot(slot.id)}>删除</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {daySchedule.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted" style={{ padding: 'var(--spacing-xl)' }}>
                      暂无排程，请点击右上角添加
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      <Modal
        open={showModal}
        title={editingSlot ? '编辑场次' : '添加场次'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSave}>保存</Button>
          </>
        }
      >
        <div className="form-group">
          <label className="label">演出艺人</label>
          <select
            className="select"
            value={formData.artistId}
            onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
          >
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.genre})</option>)}
          </select>
        </div>
        <Select
          label="演出舞台"
          value={formData.stageId}
          onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
          options={STAGES}
        />
        <div className="grid grid-cols-2 gap-md">
          <div className="form-group">
            <label className="label">开始时间</label>
            <select
              className="select"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            >
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">结束时间</label>
            <select
              className="select"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            >
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="divider" />
        <Switch
          checked={formData.requireCode}
          onChange={(v) => setFormData({ ...formData, requireCode: v })}
          label="设置入场口令"
        />
        {formData.requireCode && (
          <Input
            label="入场口令"
            value={formData.accessCode}
            onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
            placeholder="观众需输入此口令进入"
            className="mt-sm"
          />
        )}
      </Modal>
    </div>
  );
};

export default App;
