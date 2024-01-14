const { app, BrowserWindow, Tray, Menu, } = require('electron')
const electronLog = require('electron-log');
const Store = require('electron-store');
const dayjs = require('dayjs')
const path = require('path')

const { existsSync, mkdirSync, renameSync } = require('fs');
const { log } = require('../config/settings')
const { appStore } = require('../store')
const MenuConfig = require('./menu')



module.exports = {
    createMainWindow
}


function initApplication() {
    /** 初始化日志收集 */
    initElectronLog()
    /** 初始状态管理器 */
    initStore()
}


function initStore() {
    Store.initRenderer()
    appStore.set({})
}



function initElectronLog() {
    /** 验证应用日志文件夹是否存在 */
    if (!existsSync(log.appPath)) mkdirSync(log.appPath)
    /** 验证功能文件夹是否存在  */
    if (!existsSync(log.path)) mkdirSync(log.path)
    electronLog.transports.file.maxSize = log.maxSize
    electronLog.transports.file.format = log.format
    electronLog.transports.file.resolvePathFn = () => path.join(log.appPath, `${dayjs().format('YYYY-MM-DD')}.log`)
    electronLog.transports.file.archiveLogFn = (file) => renameSync(file.path, path.join(log.appPath, `${dayjs().format('YYYY-MM-DD_HH_mm_ss')}.log`))
    Object.assign(console, electronLog.functions);
}

function createMainWindow() {
    const icon = path.join(app.getAppPath(), '/icons/icon.ico')
    const win = new BrowserWindow({
        /** 隐藏菜单 */
        width: 850,
        height: 830,
        // frame: false,
        webPreferences: {
            preload: path.join(app.getAppPath(), '/application/preload/index.js'),
            nodeIntegration: true
        },
        title: '性能工具箱',
        icon
    })
    win.loadURL(app.isPackaged ? `file://${path.join(app.getAppPath(), '/.out/renderer/index.html')}` : `http://localhost:5173/`)
    const appData = appStore.get()
    appData[win.id] = { create_time: Date.now() }
    appStore.set(appData)
    win.on('close', async () => {
        const appData = appStore.get()
        delete appData[win.id]
        appStore.set(appData)
    })

    win.webContents.openDevTools()

    win.on('ready-to-show', () => {
        // console.log(1,Menu.getApplicationMenu());
        // win.maximize();
    });
    Menu.setApplicationMenu(MenuConfig);
    createWindowTray(win, icon)
    return win
}


function createWindowTray(win, icon) {
    const tray = new Tray(icon)
    tray.on('click', () => {
        win.show()
    })
}







initApplication()