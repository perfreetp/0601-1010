export interface StageComponent {
  id: string;
  type: 'main-stage' | 'sub-stage' | 'dj-booth' | 'led-wall' | 'speaker' | 'light' | 'booth' | 'seat' | 'entrance' | 'vip-area';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties: Record<string, any>;
}

export interface SponsorBooth {
  id: string;
  sponsorName: string;
  logo?: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Artist {
  id: string;
  name: string;
  avatar?: string;
  genre: string;
  bio: string;
  socialLinks: string[];
}

export interface ScheduleSlot {
  id: string;
  artistId: string;
  stageId: string;
  startTime: Date;
  endTime: Date;
  accessCode?: string;
}

export interface LightPreset {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  ambientColor: string;
  intensity: number;
  pattern: 'static' | 'pulse' | 'wave' | 'rainbow' | 'strobe';
}

export interface AudienceEmoji {
  id: string;
  emoji: string;
  label: string;
  enabled: boolean;
}

export interface Vote {
  id: string;
  title: string;
  options: VoteOption[];
  isActive: boolean;
  endTime?: Date;
}

export interface VoteOption {
  id: string;
  label: string;
  count: number;
}

export interface VirtualMerch {
  id: string;
  name: string;
  image?: string;
  description: string;
  quantity: number;
  price?: number;
}

export interface Guest {
  id: string;
  name: string;
  avatar?: string;
  seatNumber: string;
  status: 'confirmed' | 'pending' | 'checked-in';
}

export interface Ticket {
  id: string;
  type: 'standard' | 'vip' | 'backstage';
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  benefits: string[];
  accessCode?: string;
}

export interface RehearsalPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'video' | 'audio' | 'walk';
  status: 'pending' | 'testing' | 'passed' | 'failed';
  notes?: string;
}

export interface WalkPath {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  duration: number;
}

export interface HeatZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visitorCount: number;
  averageDuration: number;
  color: string;
}

export interface PlaybackData {
  id: string;
  timestamp: Date;
  eventType: string;
  data: Record<string, any>;
}

export interface VenueScheme {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  components: StageComponent[];
  booths: SponsorBooth[];
  lights: LightPreset[];
  thumbnail?: string;
}

export enum WindowType {
  VENUE_EDITOR = 'venue-editor',
  STAGE_LIBRARY = 'stage-library',
  SCHEDULE = 'schedule',
  AUDIENCE = 'audience',
  TICKETING = 'ticketing',
  REHEARSAL = 'rehearsal',
  PLAYBACK = 'playback'
}

export interface WindowConfig {
  type: WindowType;
  title: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export const WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
  [WindowType.VENUE_EDITOR]: {
    type: WindowType.VENUE_EDITOR,
    title: '场地编辑',
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700
  },
  [WindowType.STAGE_LIBRARY]: {
    type: WindowType.STAGE_LIBRARY,
    title: '舞台库',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600
  },
  [WindowType.SCHEDULE]: {
    type: WindowType.SCHEDULE,
    title: '节目排程',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600
  },
  [WindowType.AUDIENCE]: {
    type: WindowType.AUDIENCE,
    title: '观众互动',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600
  },
  [WindowType.TICKETING]: {
    type: WindowType.TICKETING,
    title: '票务入口',
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 500
  },
  [WindowType.REHEARSAL]: {
    type: WindowType.REHEARSAL,
    title: '彩排模式',
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700
  },
  [WindowType.PLAYBACK]: {
    type: WindowType.PLAYBACK,
    title: '数据回放',
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700
  }
};
