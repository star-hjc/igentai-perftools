
const path = require('path')
const { shell } = require('./command')
const { delay } = require('./index')
const { killServerByPname, countByPname } = require('./window')

function adb(args, deviceId) {
    return shell('adb', [...(deviceId ? ['-s', deviceId] : []), ...args])
}

function command(device, args) {
    if (!device) throw new Error('未传入设备ID...')
    return adb(['shell', ...args], device.id)
}

/** 获取设备信息  */
async function getDevices() {
    const { data, success } = await adb(['devices'])
    if (!success) return []
    return data.split('\r\n')?.filter(v => v.indexOf('\t') !== -1)?.map(v => {
        const [device_id, device] = v.split('\t')
        return { device_id, device }
    })
}


/** 停止ADB服务 */
async function killServer(all = false) {
    if (all) return killServerByPname('adb.exe')
    return await adb(['killServer'])
}

async function countAdbServe() {
    return await countByPname('adb.exe')
}

class AUTOClient {
    constructor(device) {
        this.device = device
    }

    async init(device) {
        this.device = device
    }
    /**
     * 上传文件
     * @param {String} localPath 本地文件
     * @param {*} toPath 上传文件位置
     * @returns {Boolean}
     */
    async push(localPath, toPath = '/data/local/tmp/') {
        if (localPath) return
        const { success } = await adb(['push', localPath, toPath], this.device)
        return success
    }

    /** 切换WiFiADB */
    async switchWiFiADB(host) {
        const { success: tcpip } = await adb(['tcpip', host.split(':')[1]], this.device)
        if (!tcpip) return
        const { success: connect } = await adb(['connect', host], this.device)
        return tcpip && connect
    }


    /** 获取wifi端口wifi */
    async getWiFiIP() {
        const { data, success } = await command(this.device, ['ifconfig', 'wlan0', '|', 'grep', `"inet addr"`])
        if (!success) return
        return data?.trim()?.split(/\s\s+/)?.reduce((a, b) => {
            const item = b.replace(/\s*/g, '').split(':')
            a[item[0]] = item[1]
            return a
        }, {})
    }

    /** 获取屏幕信息 */
    async getScreenInfo() {
        let width, height, DPI
        await command(this.device, ['wm', 'size']).then(({ data, success }) => {
            if (success) {
                [width, height] = data.split(': ')?.[1]?.split('x') || []
            }
        })
        await command(this.device, ['wm', 'density']).then(({ data, success }) => {
            if (success) {
                DPI = data.split(': ')?.[1]
            }
        })
        return { width: width && Number(width), height: height && Number(height), DPI: DPI && Number(DPI) }
    }

    async getInstrumentScreen() {
        const { success } = await command(this.device, ['dumpsys', 'AutoService', 'Dashboard_Screenshots', '1'])
        let base64Data = ''
        if (success) {
            await delay(5000)
            const { data: fileList, success: lsSuccess } = await command(this.device, ['ls', '/cache/Screenshots/'])
            if (lsSuccess) {
                await command(this.device, ['base64', '/cache/Screenshots/' + fileList.split('\\n')?.[0]?.trim() || '']).then(({ data, success: getBas64 }) => {
                    if (getBas64) base64Data = data
                })
            }
        }
        return `data:image/png;base64,${base64Data}`
    }

    /** 获取所有安装包 */
    async getPackagesList() {
        const { data, success } = await command(this.device, ['pm', 'list', 'packages'])
        if (!success) return []
        return data.trim().split('\n').map(v => v.trim().split(':')[1]).filter(v => v !== undefined)
    }

    /** 获取文件夹信息 */
    async getDevicePathFileInfo(filePath = '/data/local/tmp/') {
        if (!/\/\s*$/.test(filePath)) return
        const { data, success } = await command(this.device, ['ls', filePath])
        if (!success) return []
        return data.trim().split('\n').map(v => v.trim()).filter(v => v !== undefined)
    }

    /** 获取初始化未安装成功的文件 */
    async getInitNotExistFile() {
        const packages = await this.getPackagesList(this.device)
        const files = await this.getDevicePathFileInfo(this.device)
        const notPackages = env.packages.filter(v => packages?.indexOf(v.package) === -1)
        const notFiles = env.files.filter(v => files?.indexOf(v.name) === -1)
        return { packages: notPackages.map(v => v.name), files: notFiles.map(v => v.name) }
    }

    /** 安装未安装的初始化文件 */
    async installInitExistFile(initNotExistFile = { packages: [], files: [] }) {
        const { packages, files } = initNotExistFile
        for (const item of packages) {
            const { path } = env.packages.find(v => v.name === item) || {}
            await adb(['install', path], this.device)
        }
        for (const item of files) {
            const { path } = env.files.find(v => v.name === item) || {}
            await adb(['push', path, '/data/local/tmp/'], this.device)
        }
        return await this.getInitNotExistFile(this.device)
    }


    /** 获取设备截图 */
    async getScreenshot() {
        const { data, success } = await command(this.device, ['screencap', '-p', '|', 'base64'])
        if (!success) return `data:image/png;base64,`
        return `data:image/png;base64,${data}`
    }


    /**
     * 点击触屏事件
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    tap(x, y) {
        return command(this.device, ['input', 'tap', `${x}`, `${y}`])
    }

    /** 拖动触屏事件 */
    swipe(x = 0, y = 0, toX, toY, tiem) {
        return command(this.device, ['input', 'swipe', `${x}`, `${y}`, `${toX}`, `${toY}`, `${tiem}`])
    }

    /** 多指 */
    multitouch(touch) {
        return command(this.device, ['input', 'touchscreen', 'multitouch', `${touch}`])
    }

    /** 根据<package_name/activity_name>启动APP  */
    startApp(name) {
        return command(this.device, ['am', 'start', '-n', `${name}`])
    }

    /** 获取运行在窗口的软件的Activity */
    async getRunAppisActivity() {
        const { data, success } = await command(this.device, ['dumpsys', 'activity', 'top', '|', 'grep', '"ACTIVITY"'])
        if (success) {
            return data.trim()?.split('\r\n')?.map(v => v?.trim()?.split(/\s+/))?.map(a => a?.[1])?.reverse()
        }
        return data
    }

    /** 手机按键 */
    async keyevent(keycode) {
        return command(this.device, ['input', 'keyevent', `${keycode}`])
    }

    async text(content) {
        return command(this.device, ['input', 'text', `${content}`])
    }
}

module.exports = {
    getDevices,
    command,
    killServer,
    countAdbServe,
    AUTOClient
}