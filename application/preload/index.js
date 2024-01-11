const { contextBridge, ipcRenderer, shell } = require('electron')
const path = require('path')

contextBridge.exposeInMainWorld('adb', {
    devices: () => ipcRenderer.invoke('on-adb-devices-event'),
    // packages: (device) => ipcRenderer.invoke('on-adb-packages-event', device),
    command: (args, device) => ipcRenderer.invoke('on-adb-command-event', args, device),
    logcat: (device) => ipcRenderer.invoke('on-logcat-cell-event', device),
})


contextBridge.exposeInMainWorld('logcat', {
    exec: (FolderName, device) => ipcRenderer.invoke('on-logcat-event', FolderName, device),
    cell: (device) => ipcRenderer.invoke('on-logcat-cell-event', device),
})