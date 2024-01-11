const { ipcMain, ipcRenderer, BrowserWindow } = require('electron')

const { shell, exec } = require('../utils/command')

const { AUTOClient, getDevices, command } = require('../utils/adb')

const client = new AUTOClient()
let deviceTemp = null;


ipcMain.handle('on-monkey-event', async (event, args = '', dataStr) => {
    const command = args.split(/\s+/)
    return await shell(command.splice(0, 1)?.[0], command, (state, data) => {
        event.sender.send('call-monkey-event', state, String(data))
    })
})

ipcMain.handle('on-logcat-event', async (event, args = '', dataStr) => {
    const command = args.split(/\s+/)
    return await shell(command.splice(0, 1)?.[0], command, (state, data) => {
        event.sender.send('call-logcat-event', state, String(data))
    })
})


ipcMain.handle('on-init-adb-event', async (event, device) => {
    deviceTemp = device
    client.init(device)
})


ipcMain.handle('on-adb-devices-event', async (event) => {
    return await getDevices()
})


ipcMain.handle('on-adb-command-event', async (event, args, device) => {
    return await command(device || deviceTemp, args)
})

ipcMain.handle('on-logcat-cell-event', async (event, device) => {
    return await command(device || deviceTemp, ['logcat', '-c'])
})


ipcMain.handle('on-killmonkey-event', async (event, device) => {
    const { success, data } = await exec(`adb -s ${device} shell "top -m 100 -n 1 | grep -E 'adbd|monkey'"`)
    if (success) {
        const pids = data.trim().split('\n').map(v => v.split(' ')[0])
        /** 声明变量结果 */
        let result = []
        for (const pid of pids) {
            const {success} = await command(device || deviceTemp, ['shell', 'kill', pid])
            result.push(success)
        }
        return result.includes(false)
    }
    return success
})

module.exports = () =>{
    console.info("adbController finish")
}