
import CpuChart from './CpuChart'
import ProcessChart from './ProcessChart'
import MemoryChart from './MemoryChart'
import ProcessMemChart from './ProcessMemChart'
import MenuConfig from './MenuConfig'
import PromptModel from './PromptModel'
import IconContentLayout from './IconContentLayout/index.vue'



const components = Object.entries({ ...CpuChart, ...ProcessChart, ...MemoryChart, ...ProcessMemChart, ...MenuConfig, ...PromptModel, IconContentLayout })

export default {
    install(app) {
        for (const [key, component] of components) {
            app.component(component.name || key, component)
        }
    }
}