import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { WindowType, WINDOW_CONFIGS, WindowConfig } from '../shared/types';

export class WindowManager {
  private windows: Map<WindowType, BrowserWindow> = new Map();
  private isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
  }

  createWindow(windowType: WindowType): boolean {
    if (this.windows.has(windowType)) {
      const existingWindow = this.windows.get(windowType)!;
      if (existingWindow.isMinimized()) {
        existingWindow.restore();
      }
      existingWindow.focus();
      return false;
    }

    const config: WindowConfig = WINDOW_CONFIGS[windowType];
    const window = new BrowserWindow({
      width: config.width,
      height: config.height,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      title: config.title,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      },
      backgroundColor: '#0a0a1a',
      show: false,
      frame: true,
      autoHideMenuBar: true
    });

    this.loadWindowContent(window, windowType);

    window.once('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      this.windows.delete(windowType);
    });

    this.windows.set(windowType, window);
    return true;
  }

  private loadWindowContent(window: BrowserWindow, windowType: WindowType) {
    const windowUrl = this.getWindowUrl(windowType);
    
    if (this.isDev) {
      this.loadWithRetry(window, windowUrl, 20, 500);
    } else {
      window.loadURL(windowUrl);
    }
  }

  private loadWithRetry(window: BrowserWindow, urlStr: string, maxRetries: number, interval: number) {
    let retries = 0;
    const tryLoad = () => {
      window.loadURL(urlStr).catch(() => {
        retries++;
        if (retries < maxRetries) {
          setTimeout(tryLoad, interval);
        }
      });
    };
    tryLoad();
  }

  closeWindow(windowType: WindowType): boolean {
    const window = this.windows.get(windowType);
    if (window) {
      window.close();
      this.windows.delete(windowType);
      return true;
    }
    return false;
  }

  getOpenWindows(): WindowType[] {
    return Array.from(this.windows.keys());
  }

  getWindow(windowType: WindowType): BrowserWindow | undefined {
    return this.windows.get(windowType);
  }

  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  private getWindowUrl(windowType: WindowType): string {
    if (this.isDev) {
      return `http://localhost:5173/windows/${windowType}/index.html`;
    }
    const filePath = path.resolve(__dirname, `../renderer/windows/${windowType}/index.html`);
    return url.format({
      pathname: filePath,
      protocol: 'file:',
      slashes: true
    });
  }
}
