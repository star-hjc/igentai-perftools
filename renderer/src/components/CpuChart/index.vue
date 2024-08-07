<template>
    <div class="echarts-box">
        <div class="content" ref="echartsRef" @click="onClickChart" />
    </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { useAppStore } from '@/store'
defineOptions({ name: 'CpuChart' })

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
    const arr = Object.entries(data.cpuWhole).map(v => { return [v[0], parseFloat(v[1])] })
    for (const [key, value] of arr) {
        const index = state.series.findIndex(v => v.name === key)
        if (index !== -1) {
            const seriesDataLength = state.series[index]?.data?.length || 0
            const length = state.xAxisData?.length || 0
            if (length - seriesDataLength > 0) state.series[index].data.push(...new Array(length - seriesDataLength).fill(0))
            state.series[index].data.push(value)
        } else {
            state.series.push({
                name: key,
                data: [...new Array(state.xAxisData.length).fill(0), value],
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
    chart.value.setOption({ series: state.series, xAxis: { data: state.xAxisData } })
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
                fullScreen: {
                    title: '全屏',
                    icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891'
                },
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
