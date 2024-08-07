<template>
    <div class="top">
        <span>日志等级：</span>
        <a-select v-model="state.logLevel" size="mini" placeholder="日志等级...">
            <a-option value="-v" label="简单" />
            <a-option value="-v -v" label="普通" />
            <a-option value="-v -v -v" label="详情" />
        </a-select>
        <span>运行次数：</span>
        <a-input-number v-model="state.runNum" :min="1" :max="9999999999" size="mini" placeholder="运行次数..." />
        <span>间隔时间(ms)：</span>
        <a-input-number v-model="state.throttle" :min="0" size="mini" placeholder="间隔时间..." />
        <span>随机种子：</span>
        <a-input-number v-model="state.seed" :min="0" size="mini" placeholder="随机种子..." />
    </div>
    <div class="center">
        <div class="packages">
            <h3>包名</h3>
            <a-radio-group v-model="state.packagesState" :options="packagesOptions" size="large" />
            <a-transfer v-show="state.packagesState" :data="state.packageList" v-model:modelValue="state.packages"
                show-search>
                <template #source-title="{ countTotal, countSelected, checked, indeterminate, onSelectAllChange }">
                    <a-checkbox :model-value="checked" :indeterminate="indeterminate" @change="onSelectAllChange">
                        ({{ countSelected }})&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;忽略({{ countTotal }})
                    </a-checkbox>
                </template>
                <template #target-title="{ countTotal, countSelected, checked, indeterminate, onSelectAllChange }">
                    <a-checkbox :model-value="checked" :indeterminate="indeterminate" @change="onSelectAllChange">
                        ({{ countSelected }})&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;执行({{ countTotal }})
                    </a-checkbox>
                </template>
            </a-transfer>
        </div>
        <div class="event">
            <h3>事件</h3>
            <a-form :model="state.event">
                <a-form-item label="触摸">
                    <a-input-number v-model="state.event.touch" :min="0" :max="100" @blur="onInputEventNum('touch')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="滑动">
                    <a-input-number v-model="state.event.motion" :min="0" :max="100" @blur="onInputEventNum('motion')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="轨迹球">
                    <a-input-number v-model="state.event.trackball" :min="0" :max="100" @blur="onInputEventNum('trackball')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="导航">
                    <a-input-number v-model="state.event.nav" :min="0" :max="100" @blur="onInputEventNum('nav')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="应用切换">
                    <a-input-number v-model="state.event.appswitch" :min="0" :max="100" @blur="onInputEventNum('appswitch')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="系统按键">
                    <a-input-number v-model="state.event.syskeys" :min="0" :max="100" @blur="onInputEventNum('syskeys')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="主要导航">
                    <a-input-number v-model="state.event.majornav" :min="0" :max="100" @blur="onInputEventNum('majornav')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="任意事件">
                    <a-input-number v-model="state.event.anyevent" :min="0" :max="100" @blur="onInputEventNum('anyevent')"
                        size="mini" />
                </a-form-item>
            </a-form>
        </div>
    </div>
    <div class="option">
        <h3>选项</h3>
        <a-checkbox-group v-model="state.ignore">
            <a-checkbox value="--ignore-crashes">忽略崩溃(不建议)</a-checkbox>
            <a-checkbox value="--ignore-timeouts">忽略超时(不建议)</a-checkbox>
            <a-checkbox value="--ignore-security-exceptions">忽略权限错误(建议)</a-checkbox>
            <a-checkbox value="--kill-process-after-error">发生错误后终止应用程序进程</a-checkbox>
            <a-checkbox value="--monitor-native-crashes">监视并报告代码中发生的崩溃</a-checkbox>
            <a-checkbox value="--hprof"> Monkey事件序列分析报告(不建议)</a-checkbox>
        </a-checkbox-group>
    </div>

    <div class="log">
        <h3>日志</h3>
        <a-checkbox-group v-model="state.logcatConfig">
            <a-checkbox :value="0">logcat日志</a-checkbox>
            <a-checkbox :value="1">清除monkey之前的日志</a-checkbox>
        </a-checkbox-group>
    </div>

    <div class="test">
        <a-button type="primary" @click="onShowMonkeyCommand">查看命令</a-button>
        <a-button type="primary" @click="onCopyMonkeyCommand">复制命令</a-button>
        <a-button type="primary" :loading="state.run.isRun" @click="onTest">{{ state.run.isRun ? '测试中' : '测试' }}</a-button>
        <a-button @click="onStopMonkey" type="dashed">停止</a-button>
        <a-button @click="onShowFilePathPrompt"><icon-save /></a-button>
    </div>
    <FilePathPrompt v-model:visible="isShowFilePathPrompt" name="monkey" @handleOK="onSaveConfig" />
</template>
  
<script setup>
import { Modal, Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store'
const appStore = useAppStore()
const { device } = storeToRefs(appStore)

const emits = defineEmits(['handleRun'])

const state = reactive({
    devices: [],
    device: '',
    packageList: [],
    run: {
        isRun: false,
        runTime: 0,
        endTime: 0
    },
    logLevel: '-v -v -v',
    runNum: 20000,
    throttle: 1000,
    seed: 100,
    packages: [],
    event: {
        touch: 70,
        motion: 20,
        trackball: 0,
        nav: 0,
        appswitch: 10,
        syskeys: 0,
        majornav: 0,
        anyevent: 0,
    },
    packagesState: 1,
    /** 0:开启logcat，1:清除logcat之前的日志 */
    ignore: ['--ignore-security-exceptions', '--kill-process-after-error', '--monitor-native-crashes'],
    logcatConfig: [0, 1]
})

const packagesOptions = [{ label: '全选', value: 0 }, { label: '选择指定包', value: 1 }]
const oldEventNum = ref(0)
const isShowFilePathPrompt = ref(false)

onMounted(() => {
    initPackages()
    initMonkeyConfig()
    getMonkeyConfig()
})



const initPackages = () => {
    adb.packages(device.value).then(v => {
        state.packageList = v.map(v => { return { label: v, value: v } })
    })
}

const initMonkeyConfig = () => {
    const monkeyConfigJSon = localStorage.getItem('monkey')
    if (!monkeyConfigJSon) return
    let monkeyConfig = null
    try {
        monkeyConfig = JSON.parse(monkeyConfigJSon || {})
    } catch (error) {
        console.log(error)
    }
    onUseConfig(monkeyConfig)
}



const onStopMonkey = async () => {
    const results = await monkey.kill()
    Message[results ? 'success' : 'error'](`设备${device.value} Monkey停止${results ? '成功' : '失败'}...`)
}

const onInputEventNum = (key) => {
    const eventNum = Object.values(state.event).reduce((a, b) => (a || 0) + (b || 0), 0)
    if (eventNum > 100) {
        state.event[key] += 100 - eventNum
    }
}

const onRestartDevice = () => {
    Modal.warning({
        title: '重启',
        content: '是否确定重启设备？',
        alignCenter: true,
        onOk: () => {
            shell(`adb -s ${device.value} shell reboot`)
        }
    })
}

const onShowFilePathPrompt = () => {
    isShowFilePathPrompt.value = true
}

const packagesCellErrorItem = () => {
    state.packages.forEach((item, i) => {
        if (!state.packageList.map(v => v.value).includes(item)) state.packages.splice(i, 1)
    })
}

const getMonkeyConfig = () => {
    packagesCellErrorItem()
    return JSON.stringify(
        {
            logLevel: state.logLevel,
            runNum: state.runNum,
            throttle: state.throttle,
            seed: state.seed,
            event: state.event,
            packages: state.packages,
            ignore: state.ignore,
            logcatConfig: state.logcatConfig
        },
        null, '\t'
    )
}

const onSaveConfig = (file) => {
    isShowFilePathPrompt.value = false
    fs.writeFile(fs.pathJoin(file.path, `${file.name}.json`), getMonkeyConfig())
}


const createMonkeyCommand = () => {
    const packagesStr = state.packagesState ? state.packages.map(v => `-p ${v}`).join(' ') : ''
    const eventStr = Object.entries(state.event).filter(v => v[1]).map(([key, value]) => `--pct-${key} ${Math.min(Number(value), 100)}`).join(' ')
    const ignoreStr = state.ignore.join(' ')
    return `adb -s ${device.value} shell monkey ${packagesStr} -s ${state.seed} --throttle ${state.throttle} ${eventStr} ${state.logLevel} ${state.runNum} ${ignoreStr}`
}


const getRunSleep = (time = 2000) => {
    return time - (new Date() - new Date(state.run.runTime))
}

const getIsRunSleep = () => {
    return state.run.runTime && getRunSleep() > 0
}

/** 显示Monkey命令 */
const onShowMonkeyCommand = () => {
    Message.info(createMonkeyCommand())
}

/** 复制到粘贴板 */
const onCopyMonkeyCommand = () => {
    navigator.clipboard.writeText(createMonkeyCommand())
}

const onUseConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        state[key] = value
    }
    packagesCellErrorItem()
    localStorage.setItem('monkey', JSON.stringify(config))
}


const onTest = async () => {
    if (state.run.isRun || getIsRunSleep()) return
    state.run.isRun = true
    state.run.runTime = new Date()
    const FolderName = `${device.value}-${dayjs().format('MMDDHHmmss')}`.replace(/:|\\|\/|\*|\?|\"|\<|\>|\|/g, '-')
    await fs.createLogFolder(FolderName)
    const command = createMonkeyCommand()
    if (state.logcatConfig.includes(1)) logcat.cell(device.value)
    const pid = await monkey.exec(command, FolderName)
    let logcatPid = null;
    if (state.logcatConfig.includes(0)) {
        logcatPid = await logcat.exec(FolderName)
    }
    localStorage.setItem('monkey', getMonkeyConfig())
    emits('handleRun')
    monkey.end(async (runState, data) => {
        if (!getIsRunSleep()) state.run.isRun = false
        setTimeout(async () => {
            console.log(await adb.getDataANR(device.value, FolderName));
            console.log(await adb.getDataTombstones(device.value, FolderName));
            adb.getBugreport(device.value, FolderName)
            state.run.isRun = false
        }, getRunSleep())
    })
}

defineExpose({ onUseConfig })
</script>
<style lang="less" scoped>
.top {
    span {
        white-space: nowrap;
    }

    span+span {
        margin-left: 10px;
    }

    box-sizing: border-box;

    display: flex;
    align-items: center;
    margin:10px;
}

.center {
    display: flex;
    overflow: hidden;
    width: 95vw;

    :deep(.packages) {

        padding: 0 20px 0 10px;
        width: 70%;
        overflow: hidden;

        .arco-transfer-view {
            width: 100%;
            height: 360px;
        }

        .arco-checkbox-label {
            user-select: all;
        }
    }

    .event {
        width: 30%;
        padding: 0 20px 0 10px;
    }
}

.option {
    padding: 0 20px;
}

.test {
    padding-top: 20px;
    display: flex;
    justify-content: center;

    .arco-btn+.arco-btn {
        margin-left: 20px;
    }
}

.log {
    padding: 0 20px;
}
</style>