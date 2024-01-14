
import CpuChart from './CpuChart/index.js'
import MonkeyOption from './MonkeyOption'
import MenuConfig from './MenuConfig'
import PromptModel from './PromptModel'
import IconContentLayout from './IconContentLayout/index.vue'



const components = Object.entries({ ...CpuChart, ...MonkeyOption, ...MenuConfig, ...PromptModel, IconContentLayout })

export default {
    install(app) {
        for (const [key, component] of components) {
            app.component(component.name || key, component)
        }
    }
}