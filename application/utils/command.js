const { app } = require('electron')
const cp = require('child_process')
const path = require('path')
const { resources } = require('../config/settings')

module.exports = { shell, exec, commandCall }


async function exec(command, options = { cwd: resources.bin.path }) {
    return new Promise((resolve, reject) => {
        cp.exec(command, { ...options }, (err, stdout, stderr) => {
            if (err) {
                console.error(`cmd:${command}\nerr:${stderr || err.message}}`)
                return reject({
                    success: false,
                    data: stderr,
                    message: err.message
                })
            }
            console.info(`cmd:${command}\ndata:${stdout}`)
            resolve({
                success: true,
                data: stdout
            })
        })
    }).catch((err) => err)
}


function commandCall(command, args, callback, options = { cwd: resources.bin.path }) {
    const childProcess = cp.spawn(command, args, options)
    let stdout = ''
    let stderr = ''

    childProcess.stdout.on('data', data => {
        callback && callback('data', data)
        stdout += data.toString()
    })

    childProcess.stderr.on('data', data => {
        stderr += data.toString()
    })

    childProcess.on('error', (err) => {
        callback && callback('error', err?.message)
        console.error(`cmd:${command} ${args.join(' ')}\nerr:${err?.message}`)
    })

    childProcess.on('close', code => {
        if (code !== 0) {
            callback && callback('data', `${stderr}\n`)
            console.error(`cmd:${command} ${args.join(' ')}\nerr:${stderr}`)
        }
        callback && callback('close', code)
        console.info(`cmd:${command} ${args.join(' ')}\ndata:${stdout.length <= 200 ? stdout : `... ${stdout.slice(-200)}`}`)
    })
    return childProcess?.pid || null
}


async function shell(command, args, callback, options = { cwd: resources.bin.path }) {
    return new Promise((resolve, reject) => {
        const childProcess = cp.spawn(command, args, options)
        let stdout = ''
        let stderr = ''

        childProcess.stdout.on('data', data => {
            callback && callback('data', data)
            stdout += data.toString()
        })

        childProcess.stderr.on('data', data => {
            stderr += data.toString()
        })

        childProcess.on('error', (err) => {
            callback && callback('error', err?.message)
            
            console.error(`cmd:${command} ${args.join(' ')}\nerr:${err?.message}`)
            reject({
                command: `${command} ${args.join(' ')}`,
                data: null,
                success: false,
                message: err?.message
            })
        })

        childProcess.on('close', code => {

            if (code !== 0) {
                console.info(`cmd:${command} ${args.join(' ')}\nerr:${stderr}`)
                callback && callback('close', stderr)
                return reject({
                    command: `${command} ${args.join(' ')}`,
                    data: stderr,
                    success: false,
                    message: stderr
                })

            }
            callback && callback('close', code)
            console.info(`cmd:${command} ${args.join(' ')}\ndata:${stdout.length <= 200 ? stdout : `... ${stdout.slice(-200)}`}`)
            resolve({
                command: `${command} ${args.join(' ')}`,
                data: stdout,
                success: true
            })
        })
    }).catch(res => res)
}