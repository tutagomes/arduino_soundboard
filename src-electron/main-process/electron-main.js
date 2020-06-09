import { app, BrowserWindow, nativeTheme, Tray, Menu } from 'electron'
import SerialTalker from '../../src/serial'
import ActionController from '../../src/actionController/index.js'

// const notifier = require('node-notifier')
// const SerialPort = require('serialport')
// import { Serial, getPorts } from '../../src/serial'

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: QUASAR_NODE_INTEGRATION,
      enableRemoteModule: true

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.SerialTalker = new SerialTalker()

app.ActionController = new ActionController()

app.SerialTalker.events.on('data', async data => {
  app.ActionController.execute(data[0])
})

let tray = null
var contextMenu = Menu.buildFromTemplate([
  { label: 'Abrir Janela', click () { showWindow() } },
  { label: 'Nenhuma Porta Conectada', enabled: false },
  { type: 'separator' },
  { label: 'Sair', click () { app.quit() } }
])

app.SerialTalker.events.on('connected', data => {
  contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Janela', click () { showWindow() } },
    { label: 'Porta: ' + data },
    { type: 'separator' },
    { label: 'Sair', click () { app.quit() } }
  ])
  tray.setContextMenu(contextMenu)
})
app.SerialTalker.events.on('disconnected', data => {
  contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Janela', click () { showWindow() } },
    { label: 'Nenhuma Porta Conectada', enabled: false },
    { type: 'separator' },
    { label: 'Sair', click () { app.quit() } }
  ])
  tray.setContextMenu(contextMenu)
})

app.on('ready', () => {
  tray = new Tray(require('path').join(__dirname, 'icon.png'))
  tray.setToolTip('Arduino SoundBoard')
  tray.setContextMenu(contextMenu)
  return createWindow()
})

app.allowRendererProcessReuse = false
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
    app.dock.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  mainWindow.show()
  app.dock.show()
  mainWindow.focus()
}
