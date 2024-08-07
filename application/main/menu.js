const { Menu, shell, dialog } = require('electron');
const Store = require('electron-store');
const store = new Store()
const { readdirSync } = require('fs')
const path = require('path')
const { log } = require('../config/settings')
const { exec } = require('../utils/command')



module.exports = Menu.buildFromTemplate([
    {
        label: '选项',
        submenu: [
            { label: '退出', role: 'quit' } // 添加退出菜单项
        ]
    },
    {
        label: '刷新',
        role: 'reload'
    },
    {
        label: '开发者模式',
        accelerator: 'f12',
        role: 'toggledevtools'
    },
    {
        label: '日志',
        submenu: [
            {
                label: '应用日志',
                click: () => shell.showItemInFolder(path.join(log.appPath, readdirSync(log.appPath).at(-1) || ''))
            },
            {
                label: '老化日志',
                click: () => shell.showItemInFolder(path.join(log.path, readdirSync(log.path).at(-1) || ''))
            },
        ]
    },
    {
        label: '安卓',
        submenu: [
            {
                label: '重启安卓',
                click: () => {
                    const response = dialog.showMessageBoxSync({
                        buttons: ['确认', '取消'],
                        noLink: true,
                        icon: path.join(__dirname, '../../icons/icon.ico'),
                        message: '你确定要重启该安卓吗?',
                    })
                    if (response === 0) {
                        const device = store.get('android_device') 
                        if(device){
                            exec(`adb -s ${device} shell reboot`)
                        }
                    }
                }
            },
            { label: '待开发...' },
        ]
    },
    {
        label: '关于',
        submenu: [
            {
                label: '帮助',
                click: async () => {
                    await shell.openExternal('https://www.electronjs.org/zh/')
                }
            },
            { type: 'separator' },
            { label: '团队: 锦图测试部' },
            { type: 'separator' },
            { label: '作者: 贺佳辰 | 罗雕 | 张宇 | 杨永强' }
        ]
    }
]);