const { contextBridge, ipcRenderer, shell } = require('electron')
const path = require('path')

contextBridge.exposeInMainWorld('adb', {
    devices: () => ipcRenderer.invoke('on-adb-devices-event'),
    command: (args, device) => ipcRenderer.invoke('on-adb-command-event', args, device),
    init: (device) => ipcRenderer.invoke('on-init-adb-event', device),
    packages: (device) => ipcRenderer.invoke('on-adb-packages-event', device),
    logcat: (device) => ipcRenderer.invoke('on-logcat-cell-event', device),
    getDataANR: (device, folder) => ipcRenderer.invoke('on-anr-event', device, folder),
    getDataTombstones: (device, folder) => ipcRenderer.invoke('on-tombstones-event', device, folder),
    getBugreport: (device, folder) => ipcRenderer.invoke('on-bugreport-event', device, folder),
    getAppVersion: (device, name) => ipcRenderer.invoke('on-app-version-event', device, name),
    getTop: (device, num) => ipcRenderer.invoke('on-adb-top-event', device, num),

})


contextBridge.exposeInMainWorld('app', {
    getTitle: () => ipcRenderer.invoke('on-get-title-event'),
    setTitle: (title) => ipcRenderer.invoke('on-set-title-event', title),
    setAndroidDevice: (device) => ipcRenderer.invoke('on-android_device-event', device)
})


contextBridge.exposeInMainWorld('logcat', {
    exec: (folder) => ipcRenderer.invoke('on-logcat-event', folder),
    cell: () => ipcRenderer.invoke('on-logcat-cell-event'),
})

contextBridge.exposeInMainWorld('fs', {
    getResources: () => ipcRenderer.invoke('on-get-resources-event'),
    getResourcesPath: () => ipcRenderer.invoke('on-get-resources-folder-event'),
    readdirAll: (folderBasePath, notTypes) => ipcRenderer.invoke('on-readdir-all-event', folderBasePath, notTypes),
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


contextBridge.exposeInMainWorld('cpu', {
    start: (device, num, sleep, applyId) => ipcRenderer.invoke('on-cpu-start-event', device, num, sleep, applyId),
    call: (callback) => ipcRenderer.on('call-cpu-top-event', (event, data) => callback(data)),
    stop: () => ipcRenderer.invoke('on-cpu-stop-event')
})