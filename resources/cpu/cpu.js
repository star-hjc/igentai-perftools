const lines = String(top).trim()
    .replace(/(.*?)(?=Tasks)/, '')
    .replace(/\r[^\r]*$/, '')
    .replace(/\r/g, '')
const rows = lines.split(/\n/)

const tasks = rows[0].replace(/Tasks:\s+/, '').split(/,\s+/).map(v => v.split(/\s+/)).reduce((a, b) => {
    a[b[1]] = b[0]
    return a
}, {})

const mem = rows[1].replace(/Mem:\s+/, '').split(/,\s+/).map(v => v.trim().split(/\s+/)).reduce((a, b) => {
    a[b[1]] = b[0]
    return a
}, {})

const swap = rows[2].replace(/Swap:\s+/, '').split(/,\s+/).map(v => v.split(/\s+/)).reduce((a, b) => {
    a[b[1]] = b[0]
    return a
}, {})

const cpuWhole = rows[3].trim().split(/\s+/).reduce((a, b) => {
    const [value, key] = b.split(/%/)
    a[key] = value
    return a
}, {})

cpuWhole.use = cpuWhole.cpu - cpuWhole.idle

const info = rows.slice(5).map(v => {
    const process = v.trim().split(/\s+/)
    return {
        pid: process[0],
        cpu: parseFloat(process[8]),
        mem: parseFloat(process[9]),
        cmd: process.length > 12 ? process.slice(11).join(' ') : process[11]
    }
})

console.log({ tasks, mem, swap, cpuWhole, info })
return { tasks, mem, swap, cpuWhole, info }