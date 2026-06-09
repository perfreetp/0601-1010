import { contextBridge, ipcRenderer } from 'electron';
import { WindowType } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  openWindow: (windowType: WindowType) => ipcRenderer.invoke('open-window', windowType),
  closeWindow: (windowType: WindowType) => ipcRenderer.invoke('close-window', windowType),
  getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),
  exportMap: () => ipcRenderer.invoke('export-map'),
  saveScheme: (schemeName: string) => ipcRenderer.invoke('save-scheme', schemeName),
  loadScheme: () => ipcRenderer.invoke('load-scheme')
});
