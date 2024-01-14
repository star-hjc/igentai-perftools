const { contextBridge, ipcRenderer, shell } = require('electron')
const path = require('path')

contextBridge.exposeInMainWorld('adb', {
    devices: () => ipcRenderer.invoke('on-adb-devices-event'),
    command: (args, device) => ipcRenderer.invoke('on-adb-command-event', args, device),
    init: (device) => ipcRenderer.invoke('on-init-adb-event', device),
    packages: () => ipcRenderer.invoke('on-adb-packages-event'),
    logcat: (device) => ipcRenderer.invoke('on-logcat-cell-event', device),

})


contextBridge.exposeInMainWorld('app', {
    getTitle: () => ipcRenderer.invoke('on-get-title-event'),
    setTitle: (title) => ipcRenderer.invoke('on-set-title-event', title),
})


contextBridge.exposeInMainWorld('logcat', {
    exec: (folder) => ipcRenderer.invoke('on-logcat-event', folder),
    cell: () => ipcRenderer.invoke('on-logcat-cell-event'),
})

contextBridge.exposeInMainWorld('fs', {
    getResourcesPath: () => ipcRenderer.invoke('on-get-resources-folder-event'),
    createFolder: (path, folder) => ipcRenderer.invoke('on-create-folder-event', path, folder),
    createLogFolder: (folder) => ipcRenderer.invoke('on-create-log-folder-event', folder),
    showItemInFolder: (filePath) => ipcRenderer.invoke('on-show-item-in-folder-event', filePath),
    openFolderDialog: (options) => ipcRenderer.invoke('on-show-open-dialog-event', options),
    readFile: (filePath, options) => ipcRenderer.invoke('on-read-file-event', filePath, options),
    writeFile: (filePath, data, cover) => ipcRenderer.invoke('on-write-file-event', filePath, data, cover),
    pathJoin: (...args) => path.join(...args)
})


contextBridge.exposeInMainWorld('monkey', {
    kill: (device) => ipcRenderer.invoke('on-kill-monkey-event', device),
    exec: (command, folder) => ipcRenderer.invoke('on-monkey-event', command, folder),
    call: (callback) => ipcRenderer.on('call-monkey-event', (event, state, data) => callback(state, data)),
    end: (callback) => ipcRenderer.on('call-monkey-end-event', (event, state, data) => {
        ipcRenderer.removeAllListeners('call-monkey-event')
        callback(state, data)
    })
})
