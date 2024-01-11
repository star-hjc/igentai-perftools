const Store = require('electron-store');
const app = new Store()
module.exports = {
    set: (...args) => {
        app.set('app', ...args)
    },
    get: () => app.get('app'),
    delete:() => app.delete('app')
}