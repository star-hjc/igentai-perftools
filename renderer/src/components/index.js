
import CpuChart from './CpuChart/index.js'
import MonkeyOption from './MonkeyOption'
import MenuConfig from './MenuConfig'
import IconContentLayout from './IconContentLayout/index.vue'


const components = Object.entries({ ...CpuChart, ...MonkeyOption, ...MenuConfig, IconContentLayout })

export default {
    install(app) {
        for (const [key, component] of components) {
            console.log(key, component);
            app.component(component.name || key, component)
        }
    }
}