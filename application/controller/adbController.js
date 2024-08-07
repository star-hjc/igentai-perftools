const { ipcMain, ipcRenderer, BrowserWindow } = require('electron')
const { appendFileSync } = require('fs')
const path = require('path')
const cp = require('child_process')
const { log, resources } = require('../config/settings')
const { shell, exec, commandCall } = require('../utils/command')
const { readFileSync } = require('../utils/file')
const { AUTOClient, getDevices, command } = require('../utils/adb')

const client = new AUTOClient()
let deviceTemp = null;
let cpuInter = 0


ipcMain.handle('on-monkey-event', async (event, args = '', folder) => {
    const command = args.split(/\s+/)
    const pid = commandCall(command.splice(0, 1)?.[0], command, (state, data) => {
        if (state === 'close') {
            event.sender.send('call-monkey-end-event', state, data)
        } else {
            event.sender.send('call-monkey-event', state, String(data))
        }
        appendFileSync(path.join(log.path, `/${folder}/monkey.log`), `${new Date().toLocaleString()}: ${String(data)}`)
    })
    return pid
})

ipcMain.handle('on-adb-packages-event', async (event) => {
    return await client.getPackagesList()
})

ipcMain.handle('on-logcat-cell-event', async (event) => {
    return await command(deviceTemp, ['logcat', '-c'])
})

ipcMain.handle('on-logcat-event', async (event, folder) => {
    return commandCall('adb', ['-s', deviceTemp, 'shell', 'logcat', '-v', 'time','-b','all'], (state, data) => {
        appendFileSync(path.join(log.path, `/${folder}/logcat.log`), `${new Date().toLocaleString()}: ${String(data)}`)
        event.sender.send('call-logcat-event', state, String(data))
    })
})


ipcMain.handle('on-init-adb-event', async (event, device) => {
    if (!device) return false
    deviceTemp = device
    client.init(device)
    return true
})


ipcMain.handle('on-adb-devices-event', async (event) => {
    return await getDevices()
})


ipcMain.handle('on-adb-command-event', async (event, args, device) => {
    return await command(device || deviceTemp, args)
})


ipcMain.handle('on-kill-monkey-event', async (event, device = deviceTemp) => {
    const deviceStr = device ? `-s ${device} ` : ''
    const { success, data } = (await exec(`adb ${deviceStr}shell "ps | grep -E 'monkey'"`))
    if (success) {
        const pids = data.trim().split('\n').map(v => v.split(/\s+/)[1])
        /** 声明变量结果 */
        let result = []
        for (const pid of pids) {
            const { success } = await command(device || deviceTemp, ['kill', pid])
            result.push(success)
        }
        return !result.includes(false)
    }
    return success
})

ipcMain.handle('on-tombstones-event', async (event, device, folder) => {
    return await shell('adb', ['-s', device || deviceTemp, 'pull', '/data/tombstones', path.join(log.path, `/${folder}/`)])
})

ipcMain.handle('on-anr-event', async (event, device, folder) => {
    return await shell('adb', ['-s', device || deviceTemp, 'pull', '/data/anr', path.join(log.path, `/${folder}/`)])
})

ipcMain.handle('on-bugreport-event', async (event, device, folder) => {
    return await shell('adb', ['-s', device || deviceTemp, 'bugreport', path.join(log.path, `/${folder}/`)])
})

ipcMain.handle('on-app-version-event', async (event, device, name) => {
    const { data, success } = await shell('adb', ['-s', device || deviceTemp, 'shell', `dumpsys package ${name} | grep versionName`])
    if (!success) return void 0
    return data.trim().split('=').at(-1)
})

// adb shell dumpsys package "com.semisky.autosetting | grep versionName" 

ipcMain.handle('on-adb-top-event', async (event, device, num = 10) => {
    // exec(`adb -s ${this.device} shell  top -n 1 -m ${this.num} -d 1`,
    const { data, success } = await shell('adb', ['-s', device || deviceTemp, 'shell', 'COLUMNS=512', 'top', '-n', '1', '-m', num, '-d', 1])
    return data.trim()
})


ipcMain.handle('on-cpu-start-event', async (event, device, num = 10, sleep = 5000, applyId) => {
    clearInterval(cpuInter)
    cpuInter = setInterval(async () => {
        const { data, success } = await shell('adb', ['-s', device || deviceTemp, 'shell', 'COLUMNS=512', 'top', '-n', '1', '-m', num, '-d', 1])
        let result = {}
        if (success) {
            const code = await readFileSync(path.join(resources.cpu.path, `${applyId}.js`))
            const topFun = new Function('top', code)
            try {
                result = topFun(String(data))
            } catch (error) {
                result.error = error.message
            }
        }
        event.sender.send('call-cpu-top-event', result)
    }, Math.min(5000, sleep))
})

ipcMain.handle('on-cpu-stop-event', async (event) => {
    clearInterval(cpuInter)
})

module.exports = () => {
    console.info("adbController finish")
}