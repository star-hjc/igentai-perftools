
const { ipcMain, ipcRenderer, BrowserWindow } = require('electron')
const initAdbController = require('./adbController')


/**
 * 设置窗口标题
 */
ipcMain.handle('on-setTitle-event', (event, title) => {
    /** 获取当前页面标题 */
    BrowserWindow.fromWebContents(event.sender).setTitle(title)
})



module.exports = () => {
    console.info("initController start")
    initAdbController()
    console.info("initController finish")
}