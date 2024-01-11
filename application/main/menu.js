const { Menu } = require('electron');


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
        role: 'toggledevtools'
    },
    {
        label: '日志',
        submenu: [
            { label: '应用日志' },
            { label: '老化日志' },
        ]
    },
    {
        label: '安卓',
        submenu: [
            { label: '重启安卓' },
            { label: '待开发...' },
        ]
    },
    {
        label: '关于',
        submenu: [
            { label: '帮助' },
            { type: 'separator' },
            { label: '作者:贺佳辰|罗雕|张宇' }
        ]
    }
]);