const { app, BrowserWindow } = require('electron')
const { createMainWindow } = require('./initApplication')
// const Store = require('electron-store');
const initController = require('../controller');



// Store.initRenderer()

app.whenReady().then(async () => {
    createMainWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
    /** 监听事件注册 */
    initController()
})

app.on('window-all-closed', function (event) {
    if (process.platform !== 'darwin') app.quit()
})



