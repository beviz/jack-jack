// Modules to control application life and create native browser window
const { app, BrowserWindow, systemPreferences, dialog, Tray, Menu, shell } = require('electron')
const electronStorage = require('electron-json-storage')
const _ = require('lodash')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray
let isFocusingMainWindow = false

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    show: false,
    icon: path.join(__dirname, 'assets/logo.png')
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('minimize', function(e) {
    mainWindow.hide()
    e.returnValue = false
  })
}

function showWindow() {
  mainWindow.show()
  mainWindow.focus()
}

function getTrayIconPath() {
  return (process.platform === 'darwin' && !systemPreferences.isDarkMode()) ? 'icon-black.png' : 'icon-white.png'
}

function createTray() {
  const trayIconName = getTrayIconPath()
  tray = new Tray(path.join(__dirname, `assets/${trayIconName}`))
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show config in Finder',
      click: () => {
        electronStorage.get('config', (error, data) => {
          shell.openItem(data.commandsPath)
        })
      }
    },
    { label: 'Reload config', click: () => { mainWindow.emit('reload') } },
    { label: 'Quit', click: () => { mainWindow.close() } }
  ])
  tray.setToolTip('Jack-Jack')
  tray.on('click', showWindow)
  tray.on('double-click', showWindow)
  tray.on('right-click', () => tray.popUpContextMenu(contextMenu))
}

function initConfigPath(callback) {
  electronStorage.get('config', (error, data) => {
    if (error) {
      throw error
    }

    if (_.isEmpty(data)) {
      const configWindow = new BrowserWindow({ width: 360, height: 106, resizable: false })
      configWindow.loadFile('config.html')
      configWindow.on('done', function() {
        callback()
        configWindow.close()
      })
    } else {
      callback()
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  initConfigPath(() => {
    createTray()
    createWindow()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
