const fs = require('fs')
const path = require('path')

module.exports = {
    /** 配置日志文件路径*/
    log: {
        /** 单份日志大小 10MB */
        maxSize: 10 * 1024 * 1024,
        /** 日志存储格式 */
        format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}',
        /** 日志存储路径 */
        path: path.join(process.cwd(), `/resources/log/`)
    }
}