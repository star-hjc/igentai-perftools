<template>
    <a-modal v-model:visible="visible" @ok="onOk">
        <template #title>
            {{ title || '文件' }}
        </template>
        <div>
            <a-form :model="form">
                <a-form-item field="name" tooltip="存储的配置名称,不许需要带后缀" label="文件名称">
                    <a-input v-model="form.name" placeholder="配置文件名称" />
                </a-form-item>
                <a-form-item field="path" tooltip="配置文件存储的路径" label="路径">
                    <a-input-search v-model="form.path" placeholder="选择文件存储路径" search-button @search="onSelectPath">
                        <template #button-icon>
                            <icon-folder />
                        </template>
                    </a-input-search>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>


<script setup>
defineOptions({ name: 'FilePathPrompt' })
const emits = defineEmits(['handleOK'])
const visible = defineModel('visible')

const props = defineProps({
    title: {
        type: [String, Number],
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    path: {
        type: String,
        default: ''
    }
})


const form = reactive({
    name: '',
    path: ''
});

onMounted(() => {
    initPrompt()
})

const onOk = () => {
    emits('handleOK', form)
}

const initPrompt = async () => {
    form.name = props.name
    form.path = props.path || await fs.getResourcesPath()
}

const onSelectPath = async () => {
    const { filePaths: [filePath] } = await fs.openFolderDialog({ properties: ['openDirectory'] })
    form.path = filePath
}

</script>