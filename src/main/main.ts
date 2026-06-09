import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { WindowType, VirtualMerch, Artist, ScheduleSlot, VenueScheme } from '../shared/types';
import { WindowManager } from './windowManager';

let windowManager: WindowManager;
let userDataDir: string;
let schemesDir: string;
let recordsDir: string;
let merchStateFile: string;
let appStateFile: string;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function ensureDirs() {
  userDataDir = app.getPath('userData');
  schemesDir = path.join(userDataDir, 'schemes');
  recordsDir = path.join(userDataDir, 'records');
  merchStateFile = path.join(userDataDir, 'merch-state.json');
  appStateFile = path.join(userDataDir, 'app-state.json');
  
  if (!fs.existsSync(schemesDir)) {
    fs.mkdirSync(schemesDir, { recursive: true });
  }
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }
}

function broadcastToAllWindows(channel: string, ...args: any[]) {
  const windows = BrowserWindow.getAllWindows();
  for (const win of windows) {
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
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

function saveMerchState(merch: VirtualMerch[]): boolean {
  try {
    fs.writeFileSync(merchStateFile, JSON.stringify(merch, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save merch state', e);
    return false;
  }
}

function loadMerchState(): VirtualMerch[] | null {
  try {
    if (!fs.existsSync(merchStateFile)) return null;
    const content = fs.readFileSync(merchStateFile, 'utf-8');
    return JSON.parse(content) as VirtualMerch[];
  } catch (e) {
    console.error('Failed to load merch state', e);
    return null;
  }
}

interface AppState {
  artists: Artist[];
  schedule: ScheduleSlot[];
}

function saveAppState(state: AppState): boolean {
  try {
    fs.writeFileSync(appStateFile, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save app state', e);
    return false;
  }
}

function loadAppState(): AppState | null {
  try {
    if (!fs.existsSync(appStateFile)) return null;
    const content = fs.readFileSync(appStateFile, 'utf-8');
    const raw = JSON.parse(content);
    if (raw.schedule && Array.isArray(raw.schedule)) {
      raw.schedule = raw.schedule.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime)
      }));
    }
    return raw as AppState;
  } catch (e) {
    console.error('Failed to load app state', e);
    return null;
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

ipcMain.handle('save-merch-state', async (_event, merch: VirtualMerch[]) => {
  const success = saveMerchState(merch);
  return { success };
});

ipcMain.handle('load-merch-state', () => {
  return loadMerchState();
});

ipcMain.handle('save-app-state', async (_event, state: AppState) => {
  const success = saveAppState(state);
  return { success };
});

ipcMain.handle('load-app-state', () => {
  return loadAppState();
});

ipcMain.handle('broadcast-state', async (_event, data: { artists?: Artist[]; schedule?: ScheduleSlot[] }) => {
  const current = loadAppState() || { artists: [], schedule: [] };
  const merged: AppState = {
    artists: data.artists !== undefined ? data.artists : current.artists,
    schedule: data.schedule !== undefined ? data.schedule : current.schedule
  };
  saveAppState(merged);
  if (data.artists !== undefined) {
    broadcastToAllWindows('artists-updated', data.artists);
  }
  if (data.schedule !== undefined) {
    broadcastToAllWindows('schedule-updated', data.schedule);
  }
  return { success: true };
});

ipcMain.handle('broadcast-merch-updated', async (_event, merch: VirtualMerch[]) => {
  saveMerchState(merch);
  broadcastToAllWindows('merch-updated', merch);
  return { success: true };
});
