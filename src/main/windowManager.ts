import { BrowserWindow } from 'electron';
import * as path from 'path';
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

    const windowUrl = this.getWindowUrl(windowType);
    window.loadURL(windowUrl);

    window.once('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      this.windows.delete(windowType);
    });

    this.windows.set(windowType, window);
    return true;
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

  private getWindowUrl(windowType: WindowType): string {
    if (this.isDev) {
      return `http://localhost:5173/windows/${windowType}/index.html`;
    }
    return path.join(__dirname, `../renderer/windows/${windowType}/index.html`);
  }
}
