import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
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
} from '@shared/types';
import {
  DEFAULT_STAGE_COMPONENTS,
  DEFAULT_LIGHT_PRESETS,
  DEFAULT_ARTISTS,
  DEFAULT_SCHEDULE,
  DEFAULT_SPONSOR_BOOTHS,
  DEFAULT_EMOJIS,
  DEFAULT_VOTES,
  DEFAULT_MERCH,
  DEFAULT_GUESTS,
  DEFAULT_TICKETS,
  DEFAULT_REHEARSAL_POINTS,
  DEFAULT_WALK_PATHS,
  DEFAULT_HEAT_ZONES,
  DEFAULT_SCHEMES
} from '@shared/mockData';

export interface MerchDistributionRecord {
  id: string;
  merchId: string;
  merchName: string;
  quantity: number;
  timestamp: string;
}

interface FestivalState {
  components: StageComponent[];
  setComponents: (components: StageComponent[]) => void;
  addComponent: (component: Omit<StageComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<StageComponent>) => void;
  removeComponent: (id: string) => void;

  lightPresets: LightPreset[];
  activeLightPreset: string | null;
  setLightPresets: (presets: LightPreset[]) => void;
  addLightPreset: (preset: Omit<LightPreset, 'id'>) => void;
  setActiveLightPreset: (id: string | null) => void;

  sponsorBooths: SponsorBooth[];
  setSponsorBooths: (booths: SponsorBooth[]) => void;
  addSponsorBooth: (booth: Omit<SponsorBooth, 'id'>) => void;
  updateSponsorBooth: (id: string, updates: Partial<SponsorBooth>) => void;
  removeSponsorBooth: (id: string) => void;

  artists: Artist[];
  setArtists: (artists: Artist[]) => void;
  addArtist: (artist: Omit<Artist, 'id'>) => void;
  updateArtist: (id: string, updates: Partial<Artist>) => void;
  removeArtist: (id: string) => Artist[];

  schedule: ScheduleSlot[];
  setSchedule: (schedule: ScheduleSlot[]) => void;
  addScheduleSlot: (slot: Omit<ScheduleSlot, 'id'>) => void;
  updateScheduleSlot: (id: string, updates: Partial<ScheduleSlot>) => void;
  removeScheduleSlot: (id: string) => void;

  emojis: AudienceEmoji[];
  toggleEmoji: (id: string) => void;
  addEmoji: (emoji: Omit<AudienceEmoji, 'id'>) => void;

  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
  addVote: (vote: Omit<Vote, 'id'>) => void;
  toggleVoteActive: (id: string) => void;

  merch: VirtualMerch[];
  setMerch: (merch: VirtualMerch[]) => void;
  addMerch: (item: Omit<VirtualMerch, 'id'>) => void;
  distributeMerch: (id: string, quantity?: number) => Promise<{ success: boolean; message: string; remaining?: number }>;
  merchRecords: MerchDistributionRecord[];
  loadMerchRecords: () => Promise<void>;

  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuestStatus: (id: string, status: Guest['status']) => void;

  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;

  rehearsalPoints: RehearsalPoint[];
  setRehearsalPoints: (points: RehearsalPoint[]) => void;
  addRehearsalPoint: (point: Omit<RehearsalPoint, 'id' | 'status'>) => void;
  updateRehearsalPoint: (id: string, updates: Partial<RehearsalPoint>) => void;

  walkPaths: WalkPath[];
  setWalkPaths: (paths: WalkPath[]) => void;

  heatZones: HeatZone[];
  setHeatZones: (zones: HeatZone[]) => void;

  schemes: VenueScheme[];
  loadSchemesFromDisk: () => Promise<void>;
  saveScheme: (name: string) => Promise<{ success: boolean; message: string }>;
  loadScheme: (id: string) => boolean;
  deleteScheme: (id: string) => Promise<boolean>;
}

export const useFestivalStore = create<FestivalState>((set, get) => ({
  components: DEFAULT_STAGE_COMPONENTS,
  setComponents: (components) => set({ components }),
  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, { ...component, id: uuidv4() }]
    })),
  updateComponent: (id, updates) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    })),
  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id)
    })),

  lightPresets: DEFAULT_LIGHT_PRESETS,
  activeLightPreset: DEFAULT_LIGHT_PRESETS[0]?.id || null,
  setLightPresets: (lightPresets) => set({ lightPresets }),
  addLightPreset: (preset) =>
    set((state) => ({
      lightPresets: [...state.lightPresets, { ...preset, id: uuidv4() }]
    })),
  setActiveLightPreset: (id) => set({ activeLightPreset: id }),

  sponsorBooths: DEFAULT_SPONSOR_BOOTHS,
  setSponsorBooths: (sponsorBooths) => set({ sponsorBooths }),
  addSponsorBooth: (booth) =>
    set((state) => ({
      sponsorBooths: [...state.sponsorBooths, { ...booth, id: uuidv4() }]
    })),
  updateSponsorBooth: (id, updates) =>
    set((state) => ({
      sponsorBooths: state.sponsorBooths.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      )
    })),
  removeSponsorBooth: (id) =>
    set((state) => ({
      sponsorBooths: state.sponsorBooths.filter((b) => b.id !== id)
    })),

  artists: DEFAULT_ARTISTS,
  setArtists: (artists) => set({ artists }),
  addArtist: (artist) =>
    set((state) => ({
      artists: [...state.artists, { ...artist, id: uuidv4() }]
    })),
  updateArtist: (id, updates) =>
    set((state) => ({
      artists: state.artists.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      )
    })),
  removeArtist: (id) => {
    const state = get();
    const artist = state.artists.find((a) => a.id === id);
    const affectedSlots = state.schedule.filter((s) => s.artistId === id);
    
    set((s) => ({
      artists: s.artists.filter((a) => a.id !== id),
      schedule: s.schedule.filter((slot) => slot.artistId !== id)
    }));
    
    return affectedSlots;
  },

  schedule: DEFAULT_SCHEDULE,
  setSchedule: (schedule) => set({ schedule }),
  addScheduleSlot: (slot) =>
    set((state) => ({
      schedule: [...state.schedule, { ...slot, id: uuidv4() }]
    })),
  updateScheduleSlot: (id, updates) =>
    set((state) => ({
      schedule: state.schedule.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      )
    })),
  removeScheduleSlot: (id) =>
    set((state) => ({
      schedule: state.schedule.filter((s) => s.id !== id)
    })),

  emojis: DEFAULT_EMOJIS,
  toggleEmoji: (id) =>
    set((state) => ({
      emojis: state.emojis.map((e) =>
        e.id === id ? { ...e, enabled: !e.enabled } : e
      )
    })),
  addEmoji: (emoji) =>
    set((state) => ({
      emojis: [...state.emojis, { ...emoji, id: uuidv4() }]
    })),

  votes: DEFAULT_VOTES,
  setVotes: (votes) => set({ votes }),
  addVote: (vote) =>
    set((state) => ({
      votes: [...state.votes, { ...vote, id: uuidv4() }]
    })),
  toggleVoteActive: (id) =>
    set((state) => ({
      votes: state.votes.map((v) =>
        v.id === id ? { ...v, isActive: !v.isActive } : v
      )
    })),

  merch: DEFAULT_MERCH,
  setMerch: (merch) => set({ merch }),
  addMerch: (item) =>
    set((state) => ({
      merch: [...state.merch, { ...item, id: uuidv4() }]
    })),
  merchRecords: [],
  loadMerchRecords: async () => {
    if (window.electronAPI) {
      try {
        const records = await window.electronAPI.getMerchRecords();
        set({ merchRecords: records as MerchDistributionRecord[] });
      } catch (e) {
        console.error('Failed to load merch records', e);
      }
    }
  },
  distributeMerch: async (id, quantity = 1) => {
    const state = get();
    const item = state.merch.find((m) => m.id === id);
    
    if (!item) {
      return { success: false, message: '周边不存在' };
    }
    
    if (item.quantity <= 0) {
      return { success: false, message: '库存已用完' };
    }
    
    if (item.quantity < quantity) {
      return { success: false, message: `库存不足，剩余 ${item.quantity} 件` };
    }
    
    const newQuantity = item.quantity - quantity;
    
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.distributeMerch(id, item.name, quantity);
        if (!result.success) {
          return { success: false, message: '记录发放失败' };
        }
      } catch (e) {
        return { success: false, message: '记录发放失败' };
      }
    }
    
    set((s) => ({
      merch: s.merch.map((m) =>
        m.id === id ? { ...m, quantity: newQuantity } : m
      ),
      merchRecords: [
        {
          id: `rec-${Date.now()}`,
          merchId: id,
          merchName: item.name,
          quantity,
          timestamp: new Date().toISOString()
        },
        ...s.merchRecords
      ]
    }));
    
    return { success: true, message: `成功发放 ${quantity} 件「${item.name}」`, remaining: newQuantity };
  },

  guests: DEFAULT_GUESTS,
  setGuests: (guests) => set({ guests }),
  addGuest: (guest) =>
    set((state) => ({
      guests: [...state.guests, { ...guest, id: uuidv4() }]
    })),
  updateGuestStatus: (id, status) =>
    set((state) => ({
      guests: state.guests.map((g) =>
        g.id === id ? { ...g, status } : g
      )
    })),

  tickets: DEFAULT_TICKETS,
  setTickets: (tickets) => set({ tickets }),
  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      )
    })),

  rehearsalPoints: DEFAULT_REHEARSAL_POINTS,
  setRehearsalPoints: (rehearsalPoints) => set({ rehearsalPoints }),
  addRehearsalPoint: (point) =>
    set((state) => ({
      rehearsalPoints: [...state.rehearsalPoints, { ...point, id: uuidv4(), status: 'pending' as const }]
    })),
  updateRehearsalPoint: (id, updates) =>
    set((state) => ({
      rehearsalPoints: state.rehearsalPoints.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    })),

  walkPaths: DEFAULT_WALK_PATHS,
  setWalkPaths: (walkPaths) => set({ walkPaths }),

  heatZones: DEFAULT_HEAT_ZONES,
  setHeatZones: (heatZones) => set({ heatZones }),

  schemes: DEFAULT_SCHEMES,
  loadSchemesFromDisk: async () => {
    if (window.electronAPI) {
      try {
        const diskSchemes = await window.electronAPI.getSchemes();
        if (diskSchemes && diskSchemes.length > 0) {
          set({ schemes: diskSchemes });
        }
      } catch (e) {
        console.error('Failed to load schemes from disk', e);
      }
    }
  },
  saveScheme: async (name) => {
    const state = get();
    const newScheme: VenueScheme = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      components: state.components,
      booths: state.sponsorBooths,
      lights: state.lightPresets
    };
    
    if (window.electronAPI) {
      const result = await window.electronAPI.saveSchemeToDisk(newScheme);
      if (!result.success) {
        return { success: false, message: '保存到磁盘失败' };
      }
    }
    
    set((s) => ({ schemes: [newScheme, ...s.schemes] }));
    return { success: true, message: `方案「${name}」已保存` };
  },
  loadScheme: (id) => {
    const scheme = get().schemes.find((s) => s.id === id);
    if (scheme) {
      set({
        components: scheme.components,
        sponsorBooths: scheme.booths,
        lightPresets: scheme.lights,
        activeLightPreset: scheme.lights[0]?.id || null
      });
      return true;
    }
    return false;
  },
  deleteScheme: async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteScheme(id);
    }
    set((s) => ({ schemes: s.schemes.filter((sc) => sc.id !== id) }));
    return true;
  }
}));
