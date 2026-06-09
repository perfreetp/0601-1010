import {
  StageComponent,
  Artist,
  ScheduleSlot,
  LightPreset,
  SponsorBooth,
  AudienceEmoji,
  Vote,
  VirtualMerch,
  Guest,
  Ticket,
  RehearsalPoint,
  WalkPath,
  HeatZone,
  VenueScheme
} from './types';

export const DEFAULT_STAGE_COMPONENTS: StageComponent[] = [
  {
    id: 'main-stage-1',
    type: 'main-stage',
    name: '主舞台',
    x: 400,
    y: 100,
    width: 400,
    height: 200,
    rotation: 0,
    properties: { capacity: 5000, hasLed: true }
  },
  {
    id: 'speaker-1',
    type: 'speaker',
    name: '主扬声器-左',
    x: 350,
    y: 320,
    width: 40,
    height: 80,
    rotation: 0,
    properties: { power: 500 }
  },
  {
    id: 'speaker-2',
    type: 'speaker',
    name: '主扬声器-右',
    x: 810,
    y: 320,
    width: 40,
    height: 80,
    rotation: 0,
    properties: { power: 500 }
  }
];

export const DEFAULT_LIGHT_PRESETS: LightPreset[] = [
  {
    id: 'preset-1',
    name: '日落橙光',
    primaryColor: '#FF6B35',
    secondaryColor: '#FFD700',
    ambientColor: '#FF4500',
    intensity: 0.8,
    pattern: 'static'
  },
  {
    id: 'preset-2',
    name: '霓虹紫夜',
    primaryColor: '#9B59B6',
    secondaryColor: '#E91E63',
    ambientColor: '#2C0A3D',
    intensity: 0.9,
    pattern: 'pulse'
  },
  {
    id: 'preset-3',
    name: '海洋深蓝',
    primaryColor: '#00BCD4',
    secondaryColor: '#2196F3',
    ambientColor: '#001A33',
    intensity: 0.7,
    pattern: 'wave'
  }
];

export const DEFAULT_ARTISTS: Artist[] = [
  {
    id: 'artist-1',
    name: 'DJ Phoenix',
    genre: 'Electronic',
    bio: '国际知名电子音乐制作人，曾多次登上Tomorrowland舞台。',
    socialLinks: ['@djphoenix']
  },
  {
    id: 'artist-2',
    name: 'Neon Dreams',
    genre: 'Synthwave',
    bio: '复古未来主义合成器乐队，以迷幻的视听体验著称。',
    socialLinks: ['@neondreams']
  },
  {
    id: 'artist-3',
    name: '星河乐队',
    genre: 'Indie Rock',
    bio: '融合东方元素与摇滚的独立乐队，现场感染力极强。',
    socialLinks: ['@starband']
  }
];

export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  {
    id: 'slot-1',
    artistId: 'artist-1',
    stageId: 'main-stage-1',
    startTime: new Date('2026-07-01T19:00:00'),
    endTime: new Date('2026-07-01T20:30:00'),
    accessCode: 'OPENING2026'
  }
];

export const DEFAULT_SPONSOR_BOOTHS: SponsorBooth[] = [
  {
    id: 'booth-1',
    sponsorName: '星云科技',
    description: 'AR/VR技术合作伙伴',
    x: 100,
    y: 500,
    width: 120,
    height: 80
  }
];

export const DEFAULT_EMOJIS: AudienceEmoji[] = [
  { id: 'e1', emoji: '🔥', label: '火热', enabled: true },
  { id: 'e2', emoji: '❤️', label: '爱心', enabled: true },
  { id: 'e3', emoji: '🎉', label: '庆祝', enabled: true },
  { id: 'e4', emoji: '👏', label: '鼓掌', enabled: true },
  { id: 'e5', emoji: '😭', label: '感动', enabled: true },
  { id: 'e6', emoji: '💃', label: '跳舞', enabled: true }
];

export const DEFAULT_VOTES: Vote[] = [
  {
    id: 'vote-1',
    title: '安可曲目投票',
    options: [
      { id: 'o1', label: '《星光之夜》', count: 1234 },
      { id: 'o2', label: '《霓虹梦境》', count: 987 },
      { id: 'o3', label: '《未来回响》', count: 1567 }
    ],
    isActive: true
  }
];

export const DEFAULT_MERCH: VirtualMerch[] = [
  {
    id: 'merch-1',
    name: '限定荧光手环',
    description: '可随音乐节奏闪烁的虚拟手环',
    quantity: 5000,
    price: 0
  },
  {
    id: 'merch-2',
    name: '纪念头像框',
    description: '音乐节限定虚拟头像框',
    quantity: 10000,
    price: 0
  },
  {
    id: 'merch-3',
    name: 'VIP专属披风',
    description: 'VIP用户专属虚拟披风',
    quantity: 500,
    price: 99
  }
];

export const DEFAULT_GUESTS: Guest[] = [
  { id: 'g1', name: '张明', seatNumber: 'VIP-A01', status: 'confirmed' },
  { id: 'g2', name: '李娜', seatNumber: 'VIP-A02', status: 'checked-in' },
  { id: 'g3', name: '王强', seatNumber: 'VIP-B01', status: 'pending' }
];

export const DEFAULT_TICKETS: Ticket[] = [
  {
    id: 't1',
    type: 'standard',
    price: 99,
    totalQuantity: 10000,
    soldQuantity: 6523,
    benefits: ['全场通行', '基础虚拟周边']
  },
  {
    id: 't2',
    type: 'vip',
    price: 499,
    totalQuantity: 1000,
    soldQuantity: 678,
    benefits: ['全场通行', 'VIP专属座位', '专属虚拟周边', '艺人见面会'],
    accessCode: 'VIP2026'
  },
  {
    id: 't3',
    type: 'backstage',
    price: 1999,
    totalQuantity: 100,
    soldQuantity: 45,
    benefits: ['全区域通行', '后台访问', '一对一合影', '签名周边'],
    accessCode: 'BACKSTAGE2026'
  }
];

export const DEFAULT_REHEARSAL_POINTS: RehearsalPoint[] = [
  { id: 'rp1', name: '主舞台中央', x: 600, y: 200, type: 'video', status: 'passed' },
  { id: 'rp2', name: '左声道测试点', x: 300, y: 350, type: 'audio', status: 'passed' },
  { id: 'rp3', name: '右声道测试点', x: 900, y: 350, type: 'audio', status: 'testing' },
  { id: 'rp4', name: '艺人入场口', x: 100, y: 200, type: 'walk', status: 'pending' }
];

export const DEFAULT_WALK_PATHS: WalkPath[] = [
  {
    id: 'wp1',
    name: '艺人入场路线',
    points: [
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      { x: 600, y: 200 }
    ],
    duration: 30
  }
];

export const DEFAULT_HEAT_ZONES: HeatZone[] = [
  { id: 'hz1', name: '主舞池前区', x: 450, y: 350, width: 300, height: 150, visitorCount: 3456, averageDuration: 420, color: '#FF4444' },
  { id: 'hz2', name: '赞助商展示区', x: 80, y: 480, width: 160, height: 120, visitorCount: 1234, averageDuration: 180, color: '#FFAA00' },
  { id: 'hz3', name: 'VIP休息区', x: 900, y: 100, width: 180, height: 100, visitorCount: 456, averageDuration: 600, color: '#44AA44' }
];

export const DEFAULT_SCHEMES: VenueScheme[] = [
  {
    id: 'scheme-1',
    name: '经典布局',
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-10'),
    components: DEFAULT_STAGE_COMPONENTS,
    booths: DEFAULT_SPONSOR_BOOTHS,
    lights: DEFAULT_LIGHT_PRESETS
  }
];
