import { contextBridge, ipcRenderer } from 'electron';
import { WindowType, VenueScheme } from '../shared/types';

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
  getMerchRecords: () => ipcRenderer.invoke('get-merch-records')
});
