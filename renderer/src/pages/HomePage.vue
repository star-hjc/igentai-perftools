<template>
    <a-layout class="home-layout">
        <a-layout-sider class="left-box">
            <MenuPage @handleConfig="onConfig" @handleSelectDevice="onSelectDevice" />
        </a-layout-sider>
        <a-layout-content class="right-box">
            <a-layout class="work">
                <a-layout-content class="chart">
                    <a-layout-sider class="chart-left">
                        <CpuChart title="进程" />
                    </a-layout-sider>
                    <a-layout-sider class="chart-right">
                        <div class="cpu-rate">
                            <CpuChart title="CPU总占用率" />
                        </div>
                        <div class="memory">
                            <CpuChart title="内存使用" />
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
            <IconContentLayout :content="`选择${state.configModel.title}文件`" icon="icon-settings" @click="onSelectConfigFile">
                <template #before>
                    {{ state.configModel.title }}
                </template>
            </IconContentLayout>
        </template>
        <component :is="state.configModel.component" ref="configModalRef" @handleRun="onMonkeyTest" />
    </a-modal>
</template>

<script setup>
import { reactive } from 'vue'
import { Modal, Message } from '@arco-design/web-vue';
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

const configModalRef = ref(null)


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

                .chart-left {
                    width: 30vw !important;
                }

                .chart-right {
                    width: 30vw !important;
                    --chart-right-item-height: calc(var(--work-height) / 2);

                    .cpu-rate {
                        height: var(--chart-right-item-height);
                    }

                    .memory {
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
