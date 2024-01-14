export default defineStore({
    /** id必填，且需要唯一 */
    id: 'app',
    state: () => {
        return {
            device: '',
        }
    },
    actions: {
        setData (partial) {
            this.$patch(partial)
        }
    },
    getters: {
        getState: (state) => {
            return (key) => {
                return state[key] ? state[key] : { ...state }
            }
        }
    }
})
