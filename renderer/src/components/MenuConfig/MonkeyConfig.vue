<template>
    <div class="top">
        <span>日志等级：</span>
        <a-select v-model="logLevel" size="mini" placeholder="日志等级...">
            <a-option value="-v" label="简单" />
            <a-option value="-v -v" label="普通" />
            <a-option value="-v -v -v" label="详情" />
        </a-select>
        <span>运行次数：</span>
        <a-input-number v-model="runNum" :min="1" :max="9999999999" size="mini" placeholder="运行次数..." />
        <span>间隔时间(ms)：</span>
        <a-input-number v-model="throttle" :min="0" size="mini" placeholder="间隔时间..." />
        <span>随机种子：</span>
        <a-input-number v-model="seed" :min="0" size="mini" placeholder="随机种子..." />
    </div>
    <div class="center">
        <div class="packages">
            <h1>包名</h1>
            <a-radio-group v-model="packagesSelectState" :options="packagesSelectOptions" size="large" />
            <a-transfer v-show="packagesSelectState" :data="state.packages" v-model:modelValue="packagesSelect" show-search>
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
            <h1>事件</h1>
            <a-form :model="event">
                <a-form-item label="触摸">
                    <a-input-number v-model="event.touch" :min="0" :max="100" @blur="onInputEventNum('touch')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="滑动">
                    <a-input-number v-model="event.motion" :min="0" :max="100" @blur="onInputEventNum('motion')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="轨迹球">
                    <a-input-number v-model="event.trackball" :min="0" :max="100" @blur="onInputEventNum('trackball')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="导航">
                    <a-input-number v-model="event.nav" :min="0" :max="100" @blur="onInputEventNum('nav')" size="mini" />
                </a-form-item>
                <a-form-item label="应用切换">
                    <a-input-number v-model="event.appswitch" :min="0" :max="100" @blur="onInputEventNum('appswitch')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="系统按键">
                    <a-input-number v-model="event.syskeys" :min="0" :max="100" @blur="onInputEventNum('syskeys')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="主要导航">
                    <a-input-number v-model="event.majornav" :min="0" :max="100" @blur="onInputEventNum('majornav')"
                        size="mini" />
                </a-form-item>
                <a-form-item label="任意事件">
                    <a-input-number v-model="event.anyevent" :min="0" :max="100" @blur="onInputEventNum('anyevent')"
                        size="mini" />
                </a-form-item>
            </a-form>
        </div>
    </div>
    <div class="option">
        <h1>选项</h1>
        <a-checkbox-group v-model="ignore">
            <a-checkbox value="--ignore-crashes">忽略崩溃(不建议)</a-checkbox>
            <a-checkbox value="--ignore-timeouts">忽略超时(不建议)</a-checkbox>
            <a-checkbox value="--ignore-security-exceptions">忽略权限错误(建议)</a-checkbox>
            <a-checkbox value="--kill-process-after-error">发生错误后终止应用程序进程</a-checkbox>
            <a-checkbox value="--monitor-native-crashes">监视并报告代码中发生的崩溃</a-checkbox>
            <a-checkbox value="--hprof"> Monkey事件序列分析报告(不建议)</a-checkbox>
        </a-checkbox-group>
    </div>

    <div class="log">
        <h1>日志</h1>
        <a-checkbox-group v-model="logcatConfig">
            <a-checkbox :value="0">logcat日志</a-checkbox>
            <a-checkbox :value="1">清除monkey之前的日志</a-checkbox>
        </a-checkbox-group>
    </div>

    <div class="test">
        <a-button type="primary" @click="onShowMonkeyCommand">查看命令</a-button>
        <a-button type="primary" @click="onCopyMonkeyCommand">复制命令</a-button>
        <a-button type="primary" :loading="state.run.isRun" @click="onTest">{{ state.run.isRun ? '测试中' : '测试' }}</a-button>
        <a-button @click="stopMonkey" type="dashed">停止</a-button>
        <!-- <a-button @click="onRestartDevice">重启设备</a-button>
        <a-button @click="onOpenLogPath">Monkey日志</a-button>
        <a-button type="primary" @click="handleClick" :disabled="isRun">设备</a-button> -->
    </div>

    <!-- <a-modal v-model:visible="visible" @ok="handleOk" :closable="false" hide-cancel>
        <template #title>
            连接设备
        </template>
        <a-select v-model="selectDevice" :style="{ width: '320px' }" placeholder="选择设备..." @change="onSelectDevices">
            <a-option v-for="item in state.devices" :key="item.device" :label="item.device" :value="item.device">
                <div style="width: 200px; display:flex;justify-content: space-between;">
                    <span style="margin-right: 20px;">{{ item.device }}</span>
                    <span>{{ item.state }}</span>
                </div>
            </a-option>
        </a-select>
    </a-modal> -->
</template>
  
<script setup>
import { Modal, Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store'
const appStore = useAppStore()
const { device } = storeToRefs(appStore)


const emits = defineEmits(['handleMonkeyTest'])

const event = reactive({
    touch: 0,
    motion: 0,
    trackball: 0,
    nav: 0,
    appswitch: 100,
    syskeys: 0,
    majornav: 0,
    anyevent: 0,
});

const state = reactive({
    devices: [],
    device: '',
    packages: [],
    run: {
        isRun: false,
        runTime: 0,
        endTime: 0
    }
})

const runNum = ref(1)
const seed = ref(100)
const logLevel = ref('-v -v -v')
const throttle = ref(100)
const ignore = ref(['--ignore-security-exceptions', '--kill-process-after-error', '--monitor-native-crashes'])
/** 0:开启logcat，1:清除monkey之前的日志 */
const logcatConfig = ref([0, 1])
const packagesSelect = ref([])
const packagesSelectState = ref(1)
const packagesSelectOptions = [{ label: '全选', value: 0 }, { label: '选择指定包', value: 1 }]

const oldEventNum = ref(0)

const runLog = ref([])

onMounted(() => {
    initPackages()
})

const initPackages = () => {
    adb.packages(device.value).then(v => {
        state.packages = v.map(v => { return { label: v, value: v } })
    })
}



const visible = ref(false);


const onOpenLogPath = () => {
    app.openLogFolder()
}

const stopMonkey = () => {
    console.log(packagesSelectState.value);
    // adb.stopMonkey(device.value).then(res => {
    //     Message.info('已发停止Monkey指令！')
    // })
}

const onInputEventNum = (key) => {
    const eventNum = Object.values(event).reduce((a, b) => (a || 0) + (b || 0), 0)
    if (eventNum > 100) {
        event[key] = 100 - oldEventNum.value
        console.log(event[key]);
        oldEventNum.value = 100
    } else {
        oldEventNum.value = eventNum
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


const createMonkeyCommand = () => {
    const packagesStr = packagesSelectState.value ? packagesSelect.value.map(v => `-p ${v}`).join(' ') : ''
    const eventStr = Object.entries(event).filter(v => v[1]).map(([key, value]) => `--pct-${key} ${Math.min(Number(value), 100)}`).join(' ')
    const ignoreStr = ignore.value.join(' ')
    return `adb -s ${device.value} shell monkey ${packagesStr} --throttle ${throttle.value} ${eventStr} ${logLevel.value} ${runNum.value} ${ignoreStr}`
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


const onTest = async () => {
    if (state.run.isRun || getIsRunSleep()) return
    state.run.isRun = true
    state.run.runTime = new Date()
    const FolderName = `${device.value}-${dayjs().format('MMDDHHmmss')}`
    await fs.createLogFolder(FolderName)
    const command = createMonkeyCommand()
    console.log(command);
    if (logcatConfig.value.includes(1)) logcat.cell(device.value)
    const pid = await monkey.exec(command, FolderName)
    let logcatPid = null;
    if (logcatConfig.value.includes(0)) {
        logcatPid = await logcat.exec(FolderName)
    }
    emits('handleMonkeyTest')
    monkey.end(async (runState, data) => {
        if (!getIsRunSleep()) state.run.isRun = false
        setTimeout(() => {
            state.run.isRun = false
        }, getRunSleep())
    })
}

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
            width: 600px;
            height: 350px;
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
  