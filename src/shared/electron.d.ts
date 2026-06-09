import { WindowType, VenueScheme } from './types';

export interface ElectronAPI {
  openWindow: (windowType: WindowType) => Promise<boolean>;
  closeWindow: (windowType: WindowType) => Promise<boolean>;
  getOpenWindows: () => Promise<WindowType[]>;
  getUserDataPath: () => Promise<string>;
  exportMap: (dataUrl?: string) => Promise<{ canceled: boolean; filePath?: string; saved: boolean }>;
  saveSchemeDialog: (schemeName: string) => Promise<{ canceled: boolean; filePath?: string }>;
  loadSchemeDialog: () => Promise<{ canceled: boolean; filePaths?: string[]; scheme?: VenueScheme; error?: string }>;
  getSchemes: () => Promise<VenueScheme[]>;
  saveSchemeToDisk: (scheme: VenueScheme) => Promise<{ success: boolean }>;
  deleteScheme: (schemeId: string) => Promise<{ success: boolean }>;
  distributeMerch: (merchId: string, merchName: string, quantity?: number) => Promise<{ success: boolean; timestamp: string }>;
  getMerchRecords: () => Promise<any[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
