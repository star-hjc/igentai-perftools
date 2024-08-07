const lines = String(top).trim()
    .replace(/(.*?)(?=Tasks)/, '')
    .replace(/\r[^\r]*$/, '')
    .replace(/\r/g, '')
const rows = lines.split(/\n/)


return { tasks, mem, swap, cpuWhole, info }