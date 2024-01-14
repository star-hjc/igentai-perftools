<template>
    <a-tabs>
        <a-tab-pane key="1" class="1" ref="monkeyTerminalRef">
            <template #title>
                <icon-clock-circle /> monkey
            </template>
            <!-- <div class="monkey-terminal" ref="monkeyTerminalRef" /> -->
        </a-tab-pane>
        <a-tab-pane key="2">
            <template #title>
                <icon-calendar /> logcat
            </template>
            logcat - log
        </a-tab-pane>
        <a-tab-pane key="3">
            <template #title>
                <icon-user /> shell
            </template>
            待开发...
        </a-tab-pane>
    </a-tabs>
</template>

<script setup>
import dayjs from 'dayjs';
import { Terminal } from 'xterm'
const monkeyTerminalRef = ref(null)
const monkeyTerminal = ref(null)




onMounted(() => {
    console.dir();
    createMonkeyTerminal()
})

const createMonkeyTerminal = () => {
    monkeyTerminal.value = new Terminal({ cursorStyle: 'underline', cursorInactiveStyle: 'none', cursorBlink: true, });
    monkeyTerminal.value.open(monkeyTerminalRef.value.$el.childNodes[0]);
}

/**
 * 注册Monkey日志打印服务
 */
function registerMonkeyTerminal() {
    monkey.call((runState, data) => {
        monkeyTerminal.value.write(data);
    })
    monkey.end((runState, code) => {
        monkeyTerminal.value.write(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]state: ${code}`);
    })
}


defineExpose({ registerMonkeyTerminal })
</script>


<style lang='less' scoped>
.arco-tabs {
    height: 100vh;
    --arco-tabs-nav-height: 40px;

    --arco-tabs-content-height: calc(100vh - var(--arco-tabs-nav-height));

    :deep(.arco-tabs-nav) {
        height: var(--arco-tabs-nav-height)
    }

    :deep(.arco-tabs-content) {
        padding: 0;

        .arco-tabs-pane {
            height: var(--arco-tabs-content-height);
        }

        .xterm .xterm-viewport {
            overflow-y: auto;
        }
    }
}
</style>