import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { WindowType } from '../shared/types';
import { StageComponent, SponsorBooth, LightPreset, VenueScheme, VirtualMerch } from '../shared/types';
import { WindowManager } from './windowManager';

let windowManager: WindowManager;
let userDataDir: string;
let schemesDir: string;
let recordsDir: string;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function ensureDirs() {
  userDataDir = app.getPath('userData');
  schemesDir = path.join(userDataDir, 'schemes');
  recordsDir = path.join(userDataDir, 'records');
  
  if (!fs.existsSync(schemesDir)) {
    fs.mkdirSync(schemesDir, { recursive: true });
  }
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }
}

function createWindowManager() {
  windowManager = new WindowManager(isDev);
}

function loadSchemesFromDisk(): VenueScheme[] {
  try {
    if (!fs.existsSync(schemesDir)) return [];
    const files = fs.readdirSync(schemesDir).filter((f) => f.endsWith('.json'));
    const schemes: VenueScheme[] = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(schemesDir, file), 'utf-8');
        const scheme = JSON.parse(content) as VenueScheme;
        scheme.createdAt = new Date(scheme.createdAt);
        scheme.updatedAt = new Date(scheme.updatedAt);
        schemes.push(scheme);
      } catch (e) {
        console.error('Failed to load scheme', file, e);
      }
    }
    return schemes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (e) {
    console.error('Failed to load schemes', e);
    return [];
  }
}

function saveSchemeToDisk(scheme: VenueScheme): boolean {
  try {
    const filePath = path.join(schemesDir, `${scheme.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(scheme, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save scheme', e);
    return false;
  }
}

function deleteSchemeFromDisk(schemeId: string): boolean {
  try {
    const filePath = path.join(schemesDir, `${schemeId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (e) {
    console.error('Failed to delete scheme', e);
    return false;
  }
}

function saveMerchRecord(merchId: string, merchName: string, quantity: number = 1) {
  try {
    const recordFile = path.join(recordsDir, 'merch-records.json');
    let records: any[] = [];
    if (fs.existsSync(recordFile)) {
      records = JSON.parse(fs.readFileSync(recordFile, 'utf-8'));
    }
    records.push({
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      merchId,
      merchName,
      quantity,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(recordFile, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save merch record', e);
    return false;
  }
}

function getMerchRecords(): any[] {
  try {
    const recordFile = path.join(recordsDir, 'merch-records.json');
    if (!fs.existsSync(recordFile)) return [];
    return JSON.parse(fs.readFileSync(recordFile, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function saveMapImage(filePath: string, dataUrl: string): boolean {
  try {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    return true;
  } catch (e) {
    console.error('Failed to save map image', e);
    return false;
  }
}

app.whenReady().then(() => {
  ensureDirs();
  createWindowManager();
  
  windowManager.createWindow(WindowType.VENUE_EDITOR);
  windowManager.createWindow(WindowType.STAGE_LIBRARY);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow(WindowType.VENUE_EDITOR);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('open-window', (_event, windowType: WindowType) => {
  return windowManager.createWindow(windowType);
});

ipcMain.handle('close-window', (_event, windowType: WindowType) => {
  return windowManager.closeWindow(windowType);
});

ipcMain.handle('get-open-windows', () => {
  return windowManager.getOpenWindows();
});

ipcMain.handle('get-user-data-path', () => {
  return userDataDir;
});

ipcMain.handle('export-map', async (event, dataUrl?: string) => {
  const result = await dialog.showSaveDialog({
    title: '导出活动地图',
    defaultPath: 'festival-map.png',
    filters: [{ name: 'PNG Images', extensions: ['png'] }]
  });
  
  if (!result.canceled && result.filePath && dataUrl) {
    const success = saveMapImage(result.filePath, dataUrl);
    return { ...result, saved: success };
  }
  return { ...result, saved: false };
});

ipcMain.handle('get-schemes', () => {
  return loadSchemesFromDisk();
});

ipcMain.handle('save-scheme-to-disk', async (_event, scheme: VenueScheme) => {
  const success = saveSchemeToDisk(scheme);
  return { success };
});

ipcMain.handle('delete-scheme', async (_event, schemeId: string) => {
  const success = deleteSchemeFromDisk(schemeId);
  return { success };
});

ipcMain.handle('save-scheme-dialog', async (_event, schemeName: string) => {
  const result = await dialog.showSaveDialog({
    title: '保存方案',
    defaultPath: `${schemeName}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  return result;
});

ipcMain.handle('load-scheme-dialog', async () => {
  const result = await dialog.showOpenDialog({
    title: '加载方案',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const content = fs.readFileSync(result.filePaths[0], 'utf-8');
      const scheme = JSON.parse(content) as VenueScheme;
      scheme.createdAt = new Date(scheme.createdAt);
      scheme.updatedAt = new Date(scheme.updatedAt);
      return { ...result, scheme };
    } catch (e) {
      return { ...result, scheme: null, error: String(e) };
    }
  }
  return { ...result, scheme: null };
});

ipcMain.handle('distribute-merch', async (_event, merchId: string, merchName: string, quantity: number = 1) => {
  const success = saveMerchRecord(merchId, merchName, quantity);
  return { success, timestamp: new Date().toISOString() };
});

ipcMain.handle('get-merch-records', () => {
  return getMerchRecords();
});
