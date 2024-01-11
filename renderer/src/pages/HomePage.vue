<template>
    <a-layout class="home-layout">
        <a-layout-sider class="left-box">
            <MenuPage @handleConfig="onConfig" />
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
                    <LogTab />
                </a-layout-sider>
            </a-layout>
        </a-layout-content>
    </a-layout>
    <!-- 配置模块 -->
    <a-modal v-model:visible="state.configModel.visible" :title="state.configModel.title">
        <component :is="state.configModel.component" />
    </a-modal>
</template>

<script setup>
import { reactive } from 'vue'
import { Modal, Message } from '@arco-design/web-vue';
import CpuConfig from './config/CpuConfig.vue'
import MonkeyConfig from './config/MonkeyConfig.vue'
import MenuPage from './MenuPage.vue';
import LogTab from './LogTab.vue'

const state = reactive({
    configModel: {
        visible: false,
        title: '...',
        component:null,
        components:{
            0:CpuConfig,
            1:MonkeyConfig
        }
    }
})

const configModelVisible = ref(false)


const onConfig = (option, id) => {
    state.configModel.visible = true
    state.configModel.title = option.find(v => v.id === id).label
    state.configModel.component = state.configModel.components[id]
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
