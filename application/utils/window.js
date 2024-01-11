const { exec } = require('./command')

module.exports = { killServerByPname,countByPname }

async function killServerByPname(pName = 'adb.exe') {
    const pidStr = await exec(`tasklist  | findstr /i "${pName}"`) || ''
    if (!pidStr) return []
    const pids = pidStr.trim()?.split('\n')?.map(v => `/pid ${v.split(/\s+/)[1]}`) || []
    await exec(`taskkill ${pids.join(' ')} /f`)
    return { pids, pName}
}

async function countByPname(pName = 'adb.exe'){
    const pidStr = await exec(`tasklist  | findstr /i "${pName}"`) || ''
    if (!pidStr) return 0
    return pidStr.trim()?.split('\n')?.length || 0
}