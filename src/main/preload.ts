import { contextBridge, ipcRenderer } from 'electron';
import { WindowType, VenueScheme, Artist, ScheduleSlot, VirtualMerch } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  openWindow: (windowType: WindowType) => ipcRenderer.invoke('open-window', windowType),
  closeWindow: (windowType: WindowType) => ipcRenderer.invoke('close-window', windowType),
  getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  exportMap: (dataUrl?: string) => ipcRenderer.invoke('export-map', dataUrl),
  saveSchemeDialog: (schemeName: string) => ipcRenderer.invoke('save-scheme-dialog', schemeName),
  loadSchemeDialog: () => ipcRenderer.invoke('load-scheme-dialog'),
  getSchemes: () => ipcRenderer.invoke('get-schemes'),
  saveSchemeToDisk: (scheme: VenueScheme) => ipcRenderer.invoke('save-scheme-to-disk', scheme),
  deleteScheme: (schemeId: string) => ipcRenderer.invoke('delete-scheme', schemeId),
  distributeMerch: (merchId: string, merchName: string, quantity?: number) =>
    ipcRenderer.invoke('distribute-merch', merchId, merchName, quantity),
  getMerchRecords: () => ipcRenderer.invoke('get-merch-records'),
  loadMerchState: () => ipcRenderer.invoke('load-merch-state'),
  loadAppState: () => ipcRenderer.invoke('load-app-state'),
  broadcastState: (data: { artists?: Artist[]; schedule?: ScheduleSlot[] }) =>
    ipcRenderer.invoke('broadcast-state', data),
  broadcastMerchUpdated: (merch: VirtualMerch[]) =>
    ipcRenderer.invoke('broadcast-merch-updated', merch),
  onArtistsUpdated: (callback: (artists: Artist[]) => void) => {
    const listener = (_event: any, artists: Artist[]) => callback(artists);
    ipcRenderer.on('artists-updated', listener);
    return () => ipcRenderer.removeListener('artists-updated', listener);
  },
  onScheduleUpdated: (callback: (schedule: ScheduleSlot[]) => void) => {
    const listener = (_event: any, schedule: ScheduleSlot[]) => callback(schedule);
    ipcRenderer.on('schedule-updated', listener);
    return () => ipcRenderer.removeListener('schedule-updated', listener);
  },
  onMerchUpdated: (callback: (merch: VirtualMerch[]) => void) => {
    const listener = (_event: any, merch: VirtualMerch[]) => callback(merch);
    ipcRenderer.on('merch-updated', listener);
    return () => ipcRenderer.removeListener('merch-updated', listener);
  }
});
