const Store = require('electron-store');
const app = new Store()
module.exports = {
    set: app.set,
    get: app.get,
    delete:app.delete
}