<template>
    <div class="echarts-box">
        <div class="content" ref="echartsRef" @click="onClickChart" />
    </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { useAppStore } from '@/store'
defineOptions({ name: 'ProcessChart' })

let oldSelectPackages = []
const echartsRef = ref(null)
const chart = ref(null)
const lastClickTime = ref(0)
const appStore = useAppStore()
const { selectPackages } = storeToRefs(appStore)
const props = defineProps({
    title: {
        type: String,
        default: ''
    }
})


const state = reactive({
    series: [],
    xAxisData: []
})

onMounted(() => {
    initChart()
    window.onresize = function () {
        chartResize()
    }
})

onUnmounted(() => {
    chart.value.dispose()
})

const onClickChart = () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime.value < 300) {
        echartsRef.value.requestFullscreen()
        setTimeout(() => {
            chartResize()
        }, 500)
    } else {
        lastClickTime.value = currentTime;
    }
}

document.addEventListener('fullscreenchange', function (event) {
    if (document.fullscreenElement) {
        echartsRef.value.classList.add('fullscreen-chart');
    } else {
        echartsRef.value.classList.remove('fullscreen-chart');
        chartResize()
    }
});

const setOption = (data) => {
    for (const infoItem of data.info) {
        const index = state.series.findIndex(v => v.name === infoItem.cmd)
        if (index !== -1) {
            const seriesDataLength = state.series[index]?.data?.length || 0
            const length = state.xAxisData?.length || 0
            if (length - seriesDataLength > 0) state.series[index].data.push(...new Array(length - seriesDataLength).fill(0))
            state.series[index].data.push(infoItem.mem)
        } else {
            state.series.push({
                name: infoItem.cmd,
                data: [...new Array(state.xAxisData.length).fill(0), infoItem.mem],
                type: 'line',
                emphasis: { focus: 'series' },
                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                        { type: 'min', name: 'Min' }
                    ]
                }
            })
        }
    }
    state.xAxisData.push(new Date().toLocaleTimeString())
    for (const item of state.series) {
        if (item.data.length < state.xAxisData.length) item.data.push(0)
    }
    state.xAxisData.push(new Date().toLocaleTimeString())
    appStore.setData({ packages: state.series.map(v => v.name) })
    if (selectPackages?.value.length) {
        const series = state.series.filter(v => selectPackages?.value.includes(v.name))
        const isReplace = selectPackages?.value.filter(v => !oldSelectPackages.includes(v))?.length
        if (oldSelectPackages.length != selectPackages?.value.length || isReplace) {
            chart.value.setOption({ series, xAxis: { data: state.xAxisData } }, { replaceMerge: ['series'] })
        } else {
            chart.value.setOption({ series, xAxis: { data: state.xAxisData } })
        }
        oldSelectPackages = selectPackages?.value
        return
    }
    chart.value.setOption({ series: state.series, xAxis: { data: state.xAxisData } })
    oldSelectPackages = selectPackages?.value
}

// 基础配置一下Echarts
function initChart(options = {}) {
    chart.value = echarts.init(echartsRef.value)
    // 把配置和数据放这里
    chart.value.setOption({
        title: {
            text: props.title
        },
        color: ['#FF4500', '#32CD32', '#FF00FF', '#1E90FF', '#00FFFF', '#FF69B4', '#800080', '#00FF7F', '#FFD700', '#9400D3', '#FF8C00', '#8B0000', '#40E0D0', '#FF1493', '#FFC0CB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none',
                    title: {
                        zoom: '缩放',
                        back: '还原'
                    }
                },
                saveAsImage: { title: '保存图片' },
            }
        },
        legend: {
            top: 15,
            right: 130
        },
        grid: {
            top: 150,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: options.xAxis
        },
        yAxis: {
            type: 'value',
            axisLabel: { formatter: '{value}%' }
        },
        series: options.series || [
            {
                name: '测试数据',
                data: [33, 88],
                type: 'line',
                emphasis: { focus: 'series' }
            }
        ]
    })
}

function chartResize() {
    chart.value.resize()
}

defineExpose({ setOption, chartResize, data: state.series })
</script>

<style lang='less' scoped>
.echarts-box {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .fullscreen-chart {
        background-color: white;
        /* 设置全屏模式下的图表背景色 */
    }

    .content {
        padding: 1px;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
    }
}
</style>
