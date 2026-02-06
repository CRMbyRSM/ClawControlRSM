import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null
const trustedHosts = new Set<string>()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? true : true,
    backgroundColor: '#0d1117'
  })

  // Always allow DevTools with F12 or Ctrl+Shift+I
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      mainWindow?.webContents.toggleDevTools()
    }
  })

  // Enable context menu for copy/paste
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const menu = Menu.buildFromTemplate([
      { role: 'cut', enabled: params.editFlags.canCut },
      { role: 'copy', enabled: params.editFlags.canCopy },
      { role: 'paste', enabled: params.editFlags.canPaste },
      { role: 'selectAll', enabled: params.editFlags.canSelectAll }
    ])
    menu.popup()
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}


// Handle certificate errors - trust hosts that user has explicitly accepted
app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
  try {
    const parsedUrl = new URL(url)
    if (trustedHosts.has(parsedUrl.hostname)) {
      event.preventDefault()
      callback(true)
      return
    }
  } catch {
    // Ignore URL parsing errors
  }
  callback(false)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for OpenClaw communication
ipcMain.handle('openclaw:connect', async (_event, url: string) => {
  // Connection will be handled in renderer process via WebSocket
  return { success: true, url }
})

ipcMain.handle('openclaw:getConfig', async () => {
  return {
    defaultUrl: '',
    theme: 'dark'
  }
})

ipcMain.handle('shell:openExternal', async (_event, url: string) => {
  await shell.openExternal(url)
})

// Trust a hostname for certificate errors
ipcMain.handle('cert:trustHost', async (_event, hostname: string) => {
  trustedHosts.add(hostname)
  return { trusted: true, hostname }
})
