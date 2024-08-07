<template>
    <div class="cpu-menu">
        <div v-show="!isShowCPUConfigCode" class="config">
            <div class="card-list">
                <a-card v-for="item, index in cpuConfigList" class="card" hoverable>
                    <IconContentLayout icon="icon-experiment" color="red">
                        <div class="lable">
                            <a-tooltip :content="item.name">
                                <span class="title">{{ item.name }}</span>
                            </a-tooltip>
                            <a-tag v-show="applyId == item.name" color="green" size="small">
                                <template #icon>
                                    <icon-check-circle-fill />
                                </template>
                                已启用
                            </a-tag>
                        </div>
                    </IconContentLayout>
                    <div class="btn-box">
                        <a-button type="primary" @click="onShowCPUConfigCode(item)">配置</a-button>
                        <a-button v-show="applyId != item.name" type="outline" @click="onApplyConfig(item.name)">
                            启用
                        </a-button>
                    </div>
                </a-card>
                <a-card class="card dcc" @click="onAddConfig">
                    <icon-plus :size="30" />
                </a-card>
            </div>
            <a-space class="but-box">
                <a-select :style="{ width: '250px' }" multiple :maxTagCount="1" @change="onSelectPackages">
                    <a-option v-for="item in packages">{{ item }}</a-option>
                </a-select>
                <span>间隔时间:</span>
                <a-input-number v-model="cpuSleep" :min="2000" :max="20000" />
                <span>进程数量:</span>
                <a-input-number v-model="cpuNum" :min="1" :max="30" />
                <a-button type="primary" @click="onCpuStart" :loading="isCpuRun">开始</a-button>
                <a-button type="primary" status="warning" @click="onCpuStop">停止</a-button>

            </a-space>
        </div>

        <div class="code-edit" v-show="isShowCPUConfigCode">
            <Codemirror ref="codemirrorRef" v-model="code" :tab-size="4" placeholder="请输入..." :extensions="extensions"
                @ready="onCodemirrorload" autofocus indentWithTab />
            <a-space class="but-box">
                <a-button type="primary" status="warning" @click="onHideCPUConfigCode">返回</a-button>
                <a-button type="primary" status="warning" @click="onTestRun">测试一下</a-button>
                <a-button type="primary" @click="onSaveCode"><icon-save /></a-button>
            </a-space>
        </div>
    </div>
    <FilePathPrompt v-model:visible="isShowFilePathPrompt" :name="cpuConfigName" :path="cpuConfigPath"
        @handleOK="onCreateConfig" />
</template>

<script setup>
import { Codemirror } from 'vue-codemirror'
import { autocompletion } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { Message, Modal, Button } from '@arco-design/web-vue';
import { suffixData, prefixData, variableData } from './config'
import { useAppStore } from '@/store'

const appStore = useAppStore()
const { device, packages } = storeToRefs(appStore)
const applyId = ref('')
const work = ref(null)
const cpuConfigName = ref('')
const cpuConfigPath = ref('')
const isShowFilePathPrompt = ref(false)
const isShowCPUConfigCode = ref(false)
const code = ref('')
const codemirrorRef = ref(null)
const codemirrorView = shallowRef()
const extensions = [javascript(), autocompletion({ override: [getOptions] }), oneDark]
const emits = defineEmits(['handleRun'])
const cpuConfigList = ref([])

const cpuSleep = ref(5000)
const cpuNum = ref(10)
const isCpuRun = ref(false)

const state = reactive({
    app: {
        resources: {}
    }
})


onMounted(() => {
    fs.getResources().then((res) => {
        state.app.resources = res
        readdirCpuFolderAll().then(() => {
            const name = localStorage.getItem('applyId')
            applyId.value = name ? name : cpuConfigList.value[0].name
        })

    })
    codemirrorRef.value.$el.addEventListener('keydown', ctrlAndS)

})

const onShowCPUConfigCode = async (item) => {
    work.value = item
    isShowCPUConfigCode.value = true
    code.value = await fs.readFile(item.path)
}

const onHideCPUConfigCode = () => {
    isShowCPUConfigCode.value = false
}

const onSelectPackages = (value) => {
    appStore.setData({
        selectPackages: value
    })
}

const readdirCpuFolderAll = async () => {
    const { cpu } = state.app.resources
    cpuConfigList.value = await fs.readdirAll(cpu.path)
}

const onApplyConfig = (name) => {
    applyId.value = name
    localStorage.setItem('applyId', name)
}

const onCodemirrorload = (payload) => {
    codemirrorView.value = payload.view
}

const onCpuStart = () => {
    isCpuRun.value = true
    cpu.start(device.value, cpuNum.value, cpuSleep.value, applyId.value)
}

cpu.call(() => { if (!isCpuRun.value) isCpuRun.value = true; })

const onCpuStop = () => {
    isCpuRun.value = false
    cpu.stop()
}

function getOptions(context) {
    const prefix = context.matchBefore(/\w+\.\.\w*/)
    const suffix = context.matchBefore(/\w+\.\w*/)
    const variable = context.matchBefore(/\s*\w*\s*/)
    if (prefix?.text) {
        const value = prefix.text.split('..')[0]
        return {
            from: prefix.from,
            options: suffixData(value)
        }
    }
    if (suffix?.text) {
        return {
            from: suffix.from,
            options: prefixData()
        }
    }
    if (variable?.text) {
        const { text } = variable
        const matchText = text.match(/\w/)?.[0]
        return {
            from: variable.from + (matchText ? text.indexOf(matchText) : 0),
            options: variableData()
        }
    }
    return null
}


const onAddConfig = async () => {
    const { cpu } = state.app.resources
    cpuConfigName.value = 'cpu'
    cpuConfigPath.value = cpu.path
    isShowFilePathPrompt.value = true
}

const onCreateConfig = async ({ name, path }) => {
    if (cpuConfigList.value.map(v => v.name).includes(name)) {
        Message.warning(`你所创建的CPU配置文件 "${name}" 已经存在`)
        return
    }
    await fs.writeFile(`${path + name}.js`, '')
    readdirCpuFolderAll()
}

const onTestRun = async () => {
    const data = await adb.getTop()
    const testFun = new Function('top', code.value);
    let content = null
    try {
        content = testFun(data)
    } catch (error) {
        Message.error(error?.message)
    }
    Modal.info({
        title: '运行结果（返回return的值）',
        content: JSON.stringify(content) || '空'
    });
}

const ctrlAndS = (e) => {
    if (e.ctrlKey && e.key === 's') onSaveCode()
}

const onSaveCode = async () => {
    Modal.info({
        title: '保存',
        content: '是否保存该CPU配置？',
        hideCancel: false,
        onOk: async () => {
            await fs.writeFile(work.value.path, code.value)
            onHideCPUConfigCode()
        }
    });
}


onBeforeUnmount(() => {
    codemirrorRef.value.$el.removeEventListener('keydown', ctrlAndS)
})
</script>


<style lang="less" scoped>
.cpu-menu {
    --cpu-menu-height: 60vh;
    --but-box-height: 5vh;
    --list-height: calc(var(--cpu-menu-height) - var(--but-box-height));
    height: var(--cpu-menu-height);
    width: 50vw;
    max-height: var(--cpu-menu-height);

    .config {

        .card-list {
            height: var(--list-height);
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            grid-gap: 5px;


            :deep(.card) {
                .arco-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    justify-content: space-between;

                    .lable {
                        display: flex;
                        gap: 15px;

                        .title {
                            width: 88px;
                            overflow: hidden;
                            /*溢出部分隐藏*/
                            white-space: nowrap;
                            /*文本不换行*/
                            text-overflow: ellipsis;
                        }
                    }
                }

                .btn-box {
                    display: flex;
                    justify-content: space-around;
                }

                height: 100px;
            }

            .card:hover {
                transform: translateY(-2px);
            }
        }

        .but-box {
            width: 100%;
            height: var(--but-box-height);
            justify-content: flex-end;
        }
    }



    :deep(.code-edit) {
        --cm-editor-height: calc(var(--cpu-menu-height) - var(--but-box--height));

        .cm-editor {
            .cm-scroller {
                font-size: 14px;
                font-weight: 300;
                font-family: CascadiaCode !important;
            }

            .cm-activeLine {}

            outline: none;
            height: var(--list-height);
        }

        .but-box {
            width: 100%;
            height: var(--but-box-height);
            justify-content: flex-end;
        }
    }


}
</style>