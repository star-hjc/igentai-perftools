
const { ipcMain, ipcRenderer, BrowserWindow } = require('electron')
const Store = require('electron-store');
const store = new Store()
const initAdbController = require('./adbController')
const initFsController = require('./fsController')



/**
 * 设置窗口标题
 */
ipcMain.handle('on-set-title-event', (event, title) => {
    /** 获取当前页面标题 */
    BrowserWindow.fromWebContents(event.sender).setTitle(title)
})


ipcMain.handle('on-get-title-event', (event) => {
    /** 获取当前页面标题 */
    return BrowserWindow.fromWebContents(event.sender).title
})


ipcMain.handle('on-android_device-event', (event, device) => {
    /** 获取当前页面标题 */
    store.set('android_device', device)
})


module.exports = () => {
    console.info("initController start")
    initAdbController()
    initFsController()
    console.info("initController finish")
}