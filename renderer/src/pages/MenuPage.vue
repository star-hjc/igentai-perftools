<template>
    <div class="devices">
        执行设备：
        <a-select placeholder="选择安卓设备" v-model="state.device.id" :loading="state.device.isGetDevices"
            @PopupVisibleChange="onShowDeviceSelect" @change="onSelectDevice">
            <a-option v-for="item in state.device.devices" :value="item.device" :label="item.device">
                <div style="width: 200px; display:flex;justify-content: space-between;">
                    <span style="margin-right: 20px;">{{ item.device }}</span>
                    <span>{{ item.state }}</span>
                </div>
            </a-option>
        </a-select>
    </div>
    <div class="exec">
        <a-button type="primary" v-for="item in allConfig" @click="onConfiog(item.id)">{{ item.label }}</a-button>

        <!-- <a-button type="primary" @click="onOpenFolderDialog">导入Excel</a-button> -->
        <input type="file" ref="excelFile" style="display: none;" @change="onImportExcel" accept=".xlx,.xlsx" />
        <a-button type="primary" @click="onNumClick">计数器({{ num }})</a-button>
    </div>
</template>

<script setup>
import * as xlsx from "xlsx";
import { Message } from '@arco-design/web-vue';
import { reactive } from 'vue';
import { useAppStore } from '@/store'

const appStore = useAppStore()

const excelFile = ref(null)

const emit = defineEmits(['handleConfig', 'handleSelectDevice']);

const state = reactive({
    device: {
        id: '',
        devices: [],
        isGetDevices: false
    },
})


onMounted(() => {
    app.setAndroidDevice('')
    if (state.device.devices.length == 0) getAndroidDebugDevices()
})

const onShowDeviceSelect = (visible) => {
    /** 下拉框为收起状态不触发 */
    if (!visible) return
    getAndroidDebugDevices(false)
}

const getAndroidDebugDevices = async (isSelectOne = true) => {
    state.device.isGetDevices = true
    state.device.devices = await adb.devices()
    if (isSelectOne) {
        /** 找到状态为 “device” 的第一个设备  */
        const { device } = state.device.devices?.find(v => v.state === 'device') || {}
        if (device) {
            state.device.id = device
            onSelectDevice(device)
        }
    }
    state.device.isGetDevices = false
}


const setAppTitle = async (device) => {
    const regExp = /(.*\().*(\).*)/
    let title = await app.getTitle()
    if (regExp.test(title)) {
        title.replace(regExp, `$1${device}$2`)
    } else {
        title = `${title}(${device})`
    }
    await app.setTitle(title)
}

const onSelectDevice = async (device) => {
    if (await adb.init(device)) {
        /** 缓存设备 */
        appStore.setData({ device })
        emit('handleSelectDevice', device)
        /** 刷新应用标题 */
        await setAppTitle(device)
        Message.success(`初始化设备：${device} 成功`)
        app.setAndroidDevice(device)
        return
    }
    return Message.error(`初始化设备：${device} 失败`)
}



const allConfig = ref([
    // { id: 0, label: 'UI配置' },
    // { id: 1, label: 'CAN配置' },
    { id: 2, label: 'CPU配置', component: 'CpuConfig', adb: true },
    { id: 3, label: 'Monkey配置', component: 'MonkeyConfig', adb: true },
    { id: 4, label: '版本遍历', component: 'VersionConfig', adb: true }
])
const num = ref(0)



const onConfiog = (id) => {
    if (!allConfig.value.find(v => v.id === id)?.component) return Message.warning('该功能待开发...')
    if (allConfig.value.find(v => v.id === id)?.adb && !state.device.id) return Message.warning('未连接ADB,无法使用该功能...')
    emit('handleConfig', allConfig.value, id)
}


const onOpenFolderDialog = () => {
    excelFile.value.click()
}

const onImportExcel = async (event) => {
    const files = event.target.files
    const fileReader = new FileReader()
    fileReader.onload = function (ev) {
        try {
            const data = ev.target.result
            const workbook = xlsx.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            console.log(JSON.stringify(xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1})));
        } catch (e) {
            console.log(e);
            console.log('文件类型不正确')
            return
        }
    }
    fileReader.readAsBinaryString(files[0])
    // XLSX.read(data, { type: type })
    // const {filePaths:[path]} = await fs.openFolderDialog({
    //     filters: [
    //         { name: 'Excel 表格', extensions: ['xlsx', 'xls'] }
    //     ],
    // })

    //     console.log(await fs.readFile(path));
}




const value = ['option1', 'option3', 'option5'];
const visible = ref(false);
const handleClick = () => {
    visible.value = true;
};
const handleOk = () => {
    visible.value = false;
};
const handleCancel = () => {
    visible.value = false;
}
const data = Array(8)
    .fill(undefined)
    .map((_, index) => ({
        value: `option${index + 1}`,
        label: `Option ${index + 1}`,
    }));

const onNumClick = () => {
    const maxNum = 20
    num.value++
    if (num.value == maxNum) alert('你是真的无聊...')
    if (num.value > maxNum) {
        document.write('')
        alert('扑街仔，测试数据没了。叫你摸鱼')
    }

}
</script>

<style lang='less' scoped>
:deep(.devices) {
    .device-state {
        margin-left: 50px;
    }
}

.exec {
    height: 40vh;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}
</style>
