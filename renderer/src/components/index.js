import CpuChart from './CpuChart.vue'
import MonkeyOption from './MonkeyOption.vue'


export default {
    install(app) {
        app.component({ CpuChart, MonkeyOption })
    }
}