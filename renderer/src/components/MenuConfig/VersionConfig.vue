<template>
    <div style="height: 60vh;">
        <a-scrollbar style="height: 55vh;overflow-y: auto;display: flex;flex-direction: column;gap: 10px;">
            <a-space v-for="item, index in list"
                :style="{ background: item.actualVersion && item.actualVersion !== item.verifyVersion.trim() ? 'red' : '', padding: '10px 20px 10px 10px' }">
                <a-select v-model="item.type" placeholder="验证类型" style="width: 150px;">
                    <a-option v-for="item in verifyTypes" :key="item.id" :value="item.value" v-text="item.label" />
                </a-select>
                <a-input v-if="item.type === 1" v-model="item.name" placeholder="包名" />
                <a-input v-if="item.type === 1" v-model="item.description" placeholder="描述" />
                <a-select v-else v-model="item.name" placeholder="MPU" style="width: 181px;">
                    <a-option v-for="type, key in versionTypes" :key="key" :value="type.value" v-text="type.label" />
                </a-select>
                <a-input v-model="item.verifyVersion" placeholder="验证版本号" />
                <a-input v-model="item.actualVersion" placeholder="实际版本号" disabled />
                <a-button type="primary" shape="circle" size="mini"
                    @click="onAddItem(item.id, index)"><icon-plus /></a-button>
                <a-button v-show="list.length !== 1" type="primary" status="warning" shape="circle" size="mini"
                    @click="onRemoveItem(item.id, index)">
                    <icon-minus />
                </a-button>
            </a-space>
        </a-scrollbar>
        <!-- style="background-color: red;" -->
        <a-space style="height: 5vh;display: flex;justify-content: center;align-items: center; margin: 10px;">
            <a-button type="primary" :loading="isRun" @click="onRuns">运行</a-button>
            <a-button type="primary" status="danger" @click="onCancelAll">全部清空</a-button>
            <a-button type="primary" status="warning" @click="onCancel">清空实际版本号</a-button>
            <a-button type="primary" @click="onShowFilePathPrompt"><icon-save /></a-button>
        </a-space>
    </div>
    <FilePathPrompt v-model:visible="isShowFilePathPrompt" name="version" @handleOK="onSaveConfig" />
</template>

<script setup>
import { useAppStore } from '@/store'
const appStore = useAppStore()
const { device } = storeToRefs(appStore)

const emits = defineEmits(['handleRun'])


const verifyTypes = [
    {
        label: '中控应用',
        value: 1
    },
    {
        label: '系统版本',
        value: 2
    }
]

const versionTypes = [
    {
        label: 'MPU',
        value: 1
    },
    {
        label: 'MCU',
        value: 2
    },
    {
        label: 'R5',
        value: 3
    }
    ,
    {
        label: '集成版本号',
        value: 4
    }
]

const isShowFilePathPrompt = ref(false)
const isRun = ref(false)

const listIsItem = () => {
    return {
        id: crypto.randomUUID(),
        type: 1,
        description: '',
        name: '',
        verifyVersion: '',
        actualVersion: ''
    }
}

const list = ref([
    listIsItem()
])

const onShowFilePathPrompt = () => {
    isShowFilePathPrompt.value = true
}

const onRuns = async () => {
    isRun.value = true
    for (const item of list.value) {
        if (item.type === 1 && item.name) {
            item.actualVersion = await adb.getAppVersion(device.value, item.name)
        }
    }
    isRun.value = false
}

const onCancel = () => {
    for (const item of list.value) {
        item.actualVersion = ''
    }
}
const onCancelAll = () => {
    list.value = [listIsItem()]
}

const getVersionConfig = () => {
    return JSON.stringify(list.value.map(v => ({ type: v.type, description: v.description, name: v.name, verifyVersion: v.verifyVersion, actualVersion: '' })), null, '\t')
}

const onSaveConfig = (file) => {
    isShowFilePathPrompt.value = false
    fs.writeFile(fs.pathJoin(file.path, `${file.name}.json`), getVersionConfig())
}

const onAddItem = (id, key) => {
    list.value.splice(key ? key + 1 : key, 0, { id: crypto.randomUUID(), type: 1, name: '', verifyVersion: '', actualVersion: '' })
}

const onRemoveItem = (id, key) => {

    list.value.splice(key, 1)
}

const onUseConfig = (config) => {
    list.value = config.map(v => ({ ...v, id: crypto.randomUUID() }))
}

defineExpose({ onUseConfig })
</script>