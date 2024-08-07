<template>
    <a-layout class="home-layout">
        <a-layout-sider class="left-box">
            <MenuPage @handleConfig="onConfig" @handleSelectDevice="onSelectDevice" />
        </a-layout-sider>
        <a-layout-content class="right-box">
            <a-layout class="work">
                <a-layout-content class="chart">
                    <a-layout-sider class="chart-box">
                        <div class="top">
                            <ProcessChart ref="processRef" title="进程" />
                        </div>
                        <div class="bottom">
                            <ProcessMemChart ref="processMemRef" title="进程内存" />
                        </div>
                    </a-layout-sider>
                    <a-layout-sider class="chart-box">
                        <div class="top">
                            <CpuChart ref="rateRef" title="CPU总占用率" />
                        </div>
                        <div class="bottom">
                            <MemoryChart ref="memoryRef" title="内存使用" />
                        </div>
                    </a-layout-sider>
                </a-layout-content>
                <a-layout-sider class="log">
                    <LogTab ref="logTabRef" />
                </a-layout-sider>
            </a-layout>
        </a-layout-content>
    </a-layout>
    <!-- 配置模块 -->
    <a-modal width="auto" v-model:visible="state.configModel.visible">
        <template #title>
            <IconContentLayout :content="`选择${state.configModel.title}文件`" icon="icon-settings"
                @click="onSelectConfigFile">
                <template #before>
                    {{ state.configModel.title }}
                </template>
            </IconContentLayout>
        </template>
        <div>
            <component :is="state.configModel.component" ref="configModalRef" @handleRun="onMonkeyTest" />
        </div>
    </a-modal>
</template>

<script setup>
import { reactive } from 'vue'
import { Message } from '@arco-design/web-vue';
const logTabRef = ref(null)
import MenuPage from './MenuPage.vue';
import LogTab from './LogTab.vue'

const state = reactive({
    device: '',
    configModel: {
        visible: false,
        title: '...',
        component: 'div'
    }
})

const processRef = ref(null)
const rateRef = ref(null)
const memoryRef = ref(null)
const processMemRef = ref(null)
const configModalRef = ref(null)
const isOpenFolderDialog = ref(false)

cpu.call((top) => {
    rateRef.value.setOption(top)
    memoryRef.value.setOption(top)
    processRef.value.setOption(top)
    processMemRef.value.setOption(top)
})


const onMonkeyTest = () => {
    logTabRef.value.registerMonkeyTerminal()
}

const onConfig = (option, id) => {
    state.configModel.visible = true
    const { label, component } = option.find(v => v.id === id) || {}
    state.configModel.title = label
    state.configModel.component = component
}

const onSelectConfigFile = async () => {
    if (isOpenFolderDialog.value) return
    isOpenFolderDialog.value = true
    const { filePaths: [filePath] } = await fs.openFolderDialog()
    if (!filePath) return
    const configJson = await fs.readFile(filePath)
    let configObject = null
    try {
        configObject = JSON.parse(configJson)
    } catch (error) {
        Message.error('配置文件不合法，请检测配置文件...')
    }
    configModalRef.value?.onUseConfig(configObject)
    isOpenFolderDialog.value = false
}

const onSelectDevice = (device) => {
    state.device = device
}

</script>

<style lang='less' scoped>
.home-layout {
    --left-box--width: 15vw;
    height: 100vh;
    box-sizing: content-box;
    border-top: 1px solid #f5f5f5;


    .left-box {
        width: var(--left-box--width) !important;
        box-sizing: border-box;
        padding: 10px;

        .devices {

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
            height: 25vh;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
        }
    }


    .right-box {
        height: 100vh;

        .monkey {
            overflow: hidden;
            height: 25vh;
            background-color: rgb(255, 255, 255);
        }

        .work {
            --work-height: 100vh;
            --log-width: 25vw;

            height: var(--work-height);

            .chart {
                display: flex;

                .chart-box {
                    width: 30vw !important;
                    --chart-right-item-height: calc(var(--work-height) / 2);

                    .top {
                        height: var(--chart-right-item-height);
                    }

                    .bottom {
                        height: calc(var(--work-height) - var(--chart-right-item-height));
                    }
                }
            }

            .log {
                width: var(--log-width) !important;
            }
        }
    }

    // .rigth{
    //     display: grid;
    //     grid-template-columns: 1fr 1fr 1fr;
    //     grid-template-rows: 1fr 1fr 1fr;

    // }
}
</style>
