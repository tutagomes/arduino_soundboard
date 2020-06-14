import { app, BrowserWindow, nativeTheme, Tray, Menu, dialog, ipcMain } from 'electron'
import SerialTalker from '../serial'
import ActionController from '../actionController/index.js'
const { autoUpdater } = require('electron-updater')

autoUpdater.autoDownload = false
// autoUpdater.downloadUpdate()

const log = require('electron-log')

/*
*
* Quasar Config
*
*/
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

/*
*
* Main Window
*
*/
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
/*
*
* Serial Communication and Action Executer
*
*/
app.SerialTalker = new SerialTalker()

app.ActionController = new ActionController()

app.SerialTalker.events.on('data', async data => {
  app.ActionController.execute(data[0])
})

/*
*
* Tray Icon and functions
*
*/
let tray = null
var contextMenu = Menu.buildFromTemplate([
  { label: 'Versão ' + app.getVersion(), enabled: false },
  { label: 'Abrir Janela', click () { showWindow() } },
  { label: 'Nenhuma Porta Conectada', enabled: false },
  { type: 'separator' },
  { label: 'Sair', click () { app.quit() } }
])

app.SerialTalker.events.on('connected', data => {
  contextMenu = Menu.buildFromTemplate([
    { label: 'Versão ' + app.getVersion(), enabled: false },
    { label: 'Abrir Janela', click () { showWindow() } },
    { label: 'Porta: ' + data },
    { type: 'separator' },
    { label: 'Sair', click () { app.quit() } }
  ])
  tray.setContextMenu(contextMenu)
})
app.SerialTalker.events.on('disconnected', data => {
  contextMenu = Menu.buildFromTemplate([
    { label: 'Versão ' + app.getVersion(), enabled: false },
    { label: 'Abrir Janela', click () { showWindow() } },
    { label: 'Nenhuma Porta Conectada', enabled: false },
    { type: 'separator' },
    { label: 'Sair', click () { app.quit() } }
  ])
  tray.setContextMenu(contextMenu)
})

/*
*
* app.on ...
*
*/
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  tray = new Tray(require('path').join(__statics, 'tray_icon.png'))
  tray.setToolTip('Arduino SoundBoard')
  tray.setContextMenu(contextMenu)
  autoUpdater.checkForUpdatesAndNotify()
  return createWindow()
})
// path.join(__dirname, 'assets/images/MyImage.png');

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

/*
*
* Auto Updater Events
*
*/
autoUpdater.on('checking-for-update', () => {
  log.error('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
  const options = {
    buttons: ['Sim', 'Não'],
    message: 'Uma nova versão está disponível! Deseja atualizar agora?'
  }
  dialog.showMessageBox(options).then(result => {
    log.info(result)
    if (result.response === 0) {
      log.info('User selected to update NOW')
      autoUpdater.downloadUpdate()
    } else {
      log.info('User selected to not update')
    }
  })
})
autoUpdater.on('update-not-available', (info) => {
  log.error('Update not available.')
})
autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.setProgressBar(progressObj.percent / 100)
})
autoUpdater.on('update-downloaded', (info) => {
  const options = {
    message: 'Atualização obtida com sucesso. Será aplicada na próxima vez que a aplicação for executada!'
  }
  dialog.showMessageBox(options)
})
