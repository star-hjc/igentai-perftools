const { app, BrowserWindow, globalShortcut } = require('electron')
const { createMainWindow } = require('./initApplication')
const initController = require('../controller');
const Store = require('electron-store');
const store = new Store()

app.whenReady().then(async () => {
    createMainWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
    /** 监听事件注册 */
    initController()
    store.delete('android_device')
})

app.on('window-all-closed', function (event) {
    if (process.platform !== 'darwin') app.quit()
})


app.on('ready', () => {
    // 注册快捷键
    globalShortcut.register('CommandOrControl+R', () => {
        // 取消默认事件
        return false;
    });
    // globalShortcut.register('alt+q', () => {
    //     // 取消默认事件
    //     return false;
    // });
});

