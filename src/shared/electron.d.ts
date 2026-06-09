import { WindowType } from './types';

export interface ElectronAPI {
  openWindow: (windowType: WindowType) => Promise<boolean>;
  closeWindow: (windowType: WindowType) => Promise<boolean>;
  getOpenWindows: () => Promise<WindowType[]>;
  exportMap: () => Promise<{ canceled: boolean; filePath?: string }>;
  saveScheme: (schemeName: string) => Promise<{ canceled: boolean; filePath?: string }>;
  loadScheme: () => Promise<{ canceled: boolean; filePaths?: string[] }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
