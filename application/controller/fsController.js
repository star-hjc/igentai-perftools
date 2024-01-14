const { app, ipcMain, dialog, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const { resources } = require('../config/settings')
const { createFolderSync, getFolderPath } = require('../utils/file')


ipcMain.handle('on-create-log-folder-event', async (event, folderName) => {
    return createFolderSync(log.path, folderName)
})

ipcMain.handle('on-create-folder-event', async (event, filePath, folderName) => {
    return createFolderSync(filePath, folderName)
})

ipcMain.handle('on-show-item-in-folder-event', async (event, filePath) => {
    shell.showItemInFolder(path.normalize(filePath))
})

ipcMain.handle('on-show-open-dialog-event', async (event, options = {}) => {
    return dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: resources.path,
        filters: [
            { name: 'JSON 配置文件', extensions: ['json'] }
        ],
        ...options
    })
})

module.exports = () => {
    console.info("fsController finish")
}