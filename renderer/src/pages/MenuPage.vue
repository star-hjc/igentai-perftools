<template>
    <div class="devices">
        执行设备：
        <a-select placeholder="选择安卓设备" v-model="state.device.id" :loading="state.device.isGetDevices"
            @PopupVisibleChange="getAndroidDebugDevices" @change="onSelectDevice">
            <a-option v-for="item in state.device.devices" :value="item.device" :label="item.device">
                <div style="width: 200px; display:flex;justify-content: space-between;">
                    <span style="margin-right: 20px;">{{ item.device }}</span>
                    <span>{{ item.state }}</span>
                </div>
            </a-option>
        </a-select>
        <hr />
        状态：
        <span class="on">在线</span> / <span class="off">断连</span>

    </div>
    <div class="exec">
        <a-button type="primary" v-for="item in allConfig" @click="onConfiog(item.id)">{{ item.label }}</a-button>

        <a-button type="primary">重启安卓</a-button>
        <a-button type="primary">停止monkey</a-button>
        <a-button type="primary" @click="onNumClick">计数器({{ num }})</a-button>
    </div>
    <div>
        <span>获取进程数量</span>
        <a-input-number v-model="runNum" :min="1" :max="30" size="mini" placeholder="获取进程数量..." />
        <span>间隔时间</span>
        <a-input-number v-model="runNum" :min="1" :max="30" size="mini" placeholder="间隔时间..." />
        <a-button type="outline" @click="handleClick">进程过滤</a-button>
        <a-modal width="auto" v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
            <template #title>
                选择进程
            </template>
            <div>
                <a-transfer show-search :data="data" :default-value="value">
                    <template #source-title="{
                        countTotal,
                        countSelected,
                        checked,
                        indeterminate,
                        onSelectAllChange,
                    }">
                        <div>
                            忽略 {{ countSelected }}-{{ countTotal }}
                            <a-checkbox :model-value="checked" :indeterminate="indeterminate" @change="onSelectAllChange" />
                        </div>
                    </template>

                    <template #target-title="{ countTotal, countSelected, indeterminate, checked, onSelectAllChange }">
                        <div>
                            查看 {{ countSelected }}-{{ countTotal }}
                            <a-checkbox :model-value="checked" :indeterminate="indeterminate" @change="onSelectAllChange" />
                        </div>
                    </template>
                </a-transfer>
            </div>
        </a-modal>
    </div>
    <div>
        <p> monkey开始时间：xxxx/xx/xx xx:xx:xx</p>
        <p> monkey结束时间：xxxx/xx/xx xx:xx:xx</p>
        <p> cpu开始时间：xxxx/xx/xx xx:xx:xx</p>
        <p> cpu结束时间：xxxx/xx/xx xx:xx:xx</p>
    </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue';
import { reactive } from 'vue';
import { useAppStore } from '@/store'
const appStore = useAppStore()
const emit = defineEmits(['handleConfig', 'handleSelectDevice']);

const state = reactive({
    device: {
        id: '',
        devices: [],
        isGetDevices: false
    },
})

const runNum = ref()

onMounted(() => {
    if (state.device.devices.length == 0) getAndroidDebugDevices()
})

const getAndroidDebugDevices = async () => {
    state.device.isGetDevices = true
    state.device.devices = await adb.devices()
    /** 找到状态为 “device” 的第一个设备  */
    const { device } = state.device.devices?.find(v => v.state === 'device') || {}
    if (device) {
        state.device.id = device
        onSelectDevice(device)
    }
    state.device.isGetDevices = false
}


const setAppTitle = async(device)=>{
    const regExp = /(.*\().*(\).*)/
    let title = await app.getTitle()
    if(regExp.test(title)){
        title.replace(regExp, `$1${device}$2`)
    }else{
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
        return
    }
    return Message.error(`初始化设备：${device} 失败`)
}



const allConfig = ref([
    { id: 0, label: 'UI配置' },
    { id: 1, label: 'CAN配置' },
    { id: 2, label: 'CPU配置', component: 'CpuConfig' },
    { id: 3, label: 'Monkey配置', component: 'MonkeyConfig' }
])
const num = ref(0)



const onConfiog = (id) => {
    if (!allConfig.value.find(v => v.id === id)?.component) return Message.warning('该功能待开发...')
    emit('handleConfig', allConfig.value, id)
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
    const maxNum = 5
    num.value++
    if (num.value == maxNum) alert('你是真的无聊...')
    if (num.value > maxNum) {
        document.write('')
        alert('无聊鬼，死给你看。完蛋了吧。测试数据没了。叫你摸鱼')
    }

}
</script>

<style lang='less' scoped>
:deep(.devices) {
    .device-state {
        margin-left: 50px;
    }

    .on,
    .off {
        padding: 0px 3px;
        color: #f3f3f3;
        border-radius: 5px;

    }

    .on {
        background-color: rgb(61, 236, 120);
    }

    .off {
        background-color: rgb(248, 149, 146);
    }
}

.exec {
    height: 40vh;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}
</style>
