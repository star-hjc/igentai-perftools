const { app, ipcMain, dialog, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const { log, resources } = require('../config/settings')
const { createFolderSync, getFolderPath, readFileSync, writeFileSync, readdirAllSync } = require('../utils/file')


ipcMain.handle('on-get-resources-event', async () => {
    return resources
})

ipcMain.handle('on-get-resources-folder-event', async () => {
    return resources.path
})

ipcMain.handle('on-readdir-all-event', async (event, folderBasePath, notTypes) => {
    return readdirAllSync(folderBasePath, notTypes)
})

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

ipcMain.handle('on-read-file-event', async (event, filePath, options) => {
    return readFileSync(filePath, options)
})


ipcMain.handle('on-write-file-event', async (event, filePath, data, cover) => {
    return writeFileSync(filePath, data, cover)
})

module.exports = () => {
    console.info("fsController finish")
}