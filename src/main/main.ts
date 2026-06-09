import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { WindowType, WINDOW_CONFIGS, WindowConfig } from '../shared/types';
import { WindowManager } from './windowManager';

let windowManager: WindowManager;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindowManager() {
  windowManager = new WindowManager(isDev);
}

app.whenReady().then(() => {
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

ipcMain.handle('export-map', async () => {
  const result = await dialog.showSaveDialog({
    title: '导出活动地图',
    defaultPath: 'festival-map.png',
    filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]
  });
  return result;
});

ipcMain.handle('save-scheme', async (_event, schemeName: string) => {
  const result = await dialog.showSaveDialog({
    title: '保存方案',
    defaultPath: `${schemeName}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  return result;
});

ipcMain.handle('load-scheme', async () => {
  const result = await dialog.showOpenDialog({
    title: '加载方案',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  return result;
});
